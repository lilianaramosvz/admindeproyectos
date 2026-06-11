//frontend\src\screens\TasksScreen.jsx
import { useEffect, useRef, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import KpiCard from "../components/dashboard/KpiCard";
import { Calendar, Clock, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSelection } from "../context/SelectionContext";
import { useKpiContext } from "../hooks/useKpiContext";
import { useKpis } from "../hooks/useKpis";
import { useKpiCardValues } from "../hooks/useKpiCardValues";
import { useRealHoursByUser } from "../hooks/useRealHoursByUser";
import {
  getTasksByUser,
  getTasksBySprint,
  getActiveProjects,
  getSprintsByProject,
  updateTaskStatus,
  updateRealHours,
} from "../services/api";
import styles from "../styles/screens/TasksScreen.module.css";

const COLUMNS = [
  { id: 1, title: "Por hacer", colorClass: "todo" },
  { id: 2, title: "En Progreso", colorClass: "inProgress" },
  { id: 3, title: "Hecho", colorClass: "done" },
];

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TasksScreen() {
  const { user } = useAuth();
  const {
    sprintId: sharedSprintId,
    setSprintId: setSharedSprintId,
    setSprintName: setSharedSprintName,
  } = useSelection();
  const {
    projectId: contextProjectId,
    sprintId: contextSprintId,
    error: contextError,
  } = useKpiContext();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [horasReales, setHorasReales] = useState("");

  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const projectDropdownRef = useRef(null);

  const [availableSprints, setAvailableSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [isSprintMenuOpen, setIsSprintMenuOpen] = useState(false);
  const sprintDropdownRef = useRef(null);

  const effectiveProjectId = selectedProjectId ?? contextProjectId;
  const effectiveSprintId =
    selectedSprintId ?? sharedSprintId ?? contextSprintId;

  const selectedProjectName =
    availableProjects.find((p) => p.id === effectiveProjectId)?.nombre ??
    "Proyecto";
  const selectedSprintName =
    availableSprints.find((s) => s.id === effectiveSprintId)?.nombre ??
    "Sprint";

  const { kpis, error } = useKpis({
    userId: user?.idUsuario ?? null,
    projectId: effectiveProjectId,
    sprintId: effectiveSprintId,
  });
  const { kpisForCards } = useKpiCardValues({ kpis });
  const { totalRealHours } = useRealHoursByUser(effectiveSprintId);

  useEffect(() => {
    getActiveProjects()
      .then((data) => setAvailableProjects(Array.isArray(data) ? data : []))
      .catch(() => setAvailableProjects([]));
  }, []);

  useEffect(() => {
    if (!effectiveProjectId) return;
    getSprintsByProject(effectiveProjectId)
      .then((data) => {
        const sprints = Array.isArray(data)
          ? data.map((s) => ({ ...s, id: s.idSprint ?? s.id }))
          : [];
        setAvailableSprints(sprints);
      })
      .catch(() => setAvailableSprints([]));
  }, [effectiveProjectId]);

  useEffect(() => {
    if (!user?.idUsuario) return;
    let isMounted = true;
    setLoading(true);

    const fetchTasks = effectiveSprintId
      ? Promise.all([
          getTasksByUser(user.idUsuario),
          getTasksBySprint(effectiveSprintId),
        ]).then(([userTasks, sprintTasks]) => {
          const userTaskIds = new Set(
            (Array.isArray(userTasks) ? userTasks : []).map((t) => t.idTarea),
          );
          return (Array.isArray(sprintTasks) ? sprintTasks : []).filter((t) =>
            userTaskIds.has(t.idTarea),
          );
        })
      : getTasksByUser(user.idUsuario).then((data) =>
          Array.isArray(data) ? data : [],
        );

    fetchTasks
      .then((data) => {
        if (isMounted) setTasks(data);
      })
      .catch(() => {
        if (isMounted) setTasks([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.idUsuario, effectiveSprintId]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(e.target)
      ) {
        setIsProjectMenuOpen(false);
      }
      if (
        sprintDropdownRef.current &&
        !sprintDropdownRef.current.contains(e.target)
      ) {
        setIsSprintMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsProjectMenuOpen(false);
        setIsSprintMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openModal = (task) => {
    setSelectedTask(task);
    setEditingStatus(task.idEstado);
    setSaveError(null);
    setHorasReales("");
  };

  const closeModal = () => {
    if (saving) return;
    setSelectedTask(null);
    setEditingStatus(null);
    setSaveError(null);
    setHorasReales("");
  };

  const handleSaveStatus = async () => {
    if (!selectedTask || editingStatus === null) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateTaskStatus(selectedTask.idTarea, editingStatus);
      if (editingStatus === 3 && horasReales !== "") {
        await updateRealHours(selectedTask.idTarea, parseFloat(horasReales));
      }
      setTasks((prev) =>
        prev.map((t) =>
          t.idTarea === selectedTask.idTarea
            ? { ...t, idEstado: editingStatus }
            : t,
        ),
      );
      setSelectedTask(null);
      setEditingStatus(null);
      setHorasReales("");
    } catch (err) {
      console.error("[handleSaveStatus] error:", err);
      setSaveError(`Error: ${err?.message ?? "desconocido"}`);
    } finally {
      setSaving(false);
    }
  };

  const displayName = user
    ? `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim()
    : "";

  if (loading) {
    return (
      <MainLayout title="Tasks">
        <div className={styles.container}>
          <div className={styles.loadingState}>Cargando tareas...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Tasks">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Mis Tareas</h1>
          <p className={styles.intro}>
            {displayName
              ? `Tareas asignadas a ${displayName}.`
              : "Tus tareas asignadas."}
          </p>
        </div>

        <div className={styles.selectors}>
          <div className={styles.selectorGroup}>
            <label className={styles.selectorLabel}>Proyecto</label>
            <span className={styles.sprintPicker} ref={projectDropdownRef}>
              <button
                type="button"
                className={styles.sprintButton}
                onClick={() => setIsProjectMenuOpen((open) => !open)}
                disabled={availableProjects.length === 0}
                aria-expanded={isProjectMenuOpen}
                aria-haspopup="listbox"
              >
                <span className={styles.sprintButtonLabel}>
                  {availableProjects.length === 0
                    ? "Cargando..."
                    : selectedProjectName}
                </span>
                <span
                  className={`${styles.sprintChevron} ${isProjectMenuOpen ? styles.sprintChevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isProjectMenuOpen && availableProjects.length > 0 && (
                <div
                  className={styles.sprintMenu}
                  role="listbox"
                  aria-label="Proyectos disponibles"
                >
                  {availableProjects.map((p) => {
                    const isSelected = p.id === effectiveProjectId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sprintOption} ${isSelected ? styles.sprintOptionSelected : ""}`}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setSelectedSprintId(null);
                          setIsProjectMenuOpen(false);
                        }}
                      >
                        <span className={styles.sprintOptionLabel}>
                          {p.nombre}
                        </span>
                        <span
                          className={styles.sprintOptionCheck}
                          aria-hidden="true"
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </span>
          </div>

          <div className={styles.selectorGroup}>
            <label className={styles.selectorLabel}>Sprint</label>
            <span className={styles.sprintPicker} ref={sprintDropdownRef}>
              <button
                type="button"
                className={styles.sprintButton}
                onClick={() => setIsSprintMenuOpen((open) => !open)}
                disabled={availableSprints.length === 0}
                aria-expanded={isSprintMenuOpen}
                aria-haspopup="listbox"
              >
                <span className={styles.sprintButtonLabel}>
                  {availableSprints.length === 0
                    ? "Cargando..."
                    : selectedSprintName}
                </span>
                <span
                  className={`${styles.sprintChevron} ${isSprintMenuOpen ? styles.sprintChevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isSprintMenuOpen && availableSprints.length > 0 && (
                <div
                  className={styles.sprintMenu}
                  role="listbox"
                  aria-label="Sprints disponibles"
                >
                  {availableSprints.map((s) => {
                    const isSelected = s.id === effectiveSprintId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sprintOption} ${isSelected ? styles.sprintOptionSelected : ""}`}
                        onClick={() => {
                          setSelectedSprintId(s.id);
                          setSharedSprintId(s.id);
                          setSharedSprintName(s.nombre);
                          setIsSprintMenuOpen(false);
                        }}
                      >
                        <span className={styles.sprintOptionLabel}>
                          {s.nombre}
                        </span>
                        <span
                          className={styles.sprintOptionCheck}
                          aria-hidden="true"
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </span>
          </div>
        </div>

        {contextError ? (
          <div className={styles.error}>{contextError}</div>
        ) : null}
        {error ? <div className={styles.error}>{error}</div> : null}

        <section className={styles.board} aria-label="Tablero de mis tareas">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.idEstado === col.id);
            return (
              <div key={col.id} className={styles.column}>
                <div className={styles.columnHeader}>
                  <div className={styles.columnTitleRow}>
                    <span
                      className={`${styles.columnDot} ${styles[col.colorClass]}`}
                    />
                    <span className={styles.columnTitle}>{col.title}</span>
                  </div>
                  <span className={styles.count}>{colTasks.length}</span>
                </div>

                <div className={styles.tasks}>
                  {colTasks.length === 0 ? (
                    <div className={styles.emptyState}>Sin tareas</div>
                  ) : (
                    colTasks.map((task) => (
                      <article
                        key={task.idTarea}
                        className={styles.task}
                        onClick={() => openModal(task)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && openModal(task)}
                        aria-label={`Abrir tarea: ${task.titulo}`}
                      >
                        <div className={styles.taskHeader}>
                          <span className={styles.taskTitle}>
                            {task.titulo}
                          </span>
                        </div>
                        <div className={styles.taskId}>#{task.idTarea}</div>
                        {task.descripcion && (
                          <p className={styles.taskDesc}>{task.descripcion}</p>
                        )}
                        <div className={styles.taskMeta}>
                          {task.tiempoEstimado != null && (
                            <span className={styles.metaItem}>
                              <Clock size={14} />
                              {task.tiempoEstimado}h est.
                            </span>
                          )}
                          {task.fechaLimite && (
                            <span className={styles.metaItem}>
                              <Calendar size={14} />
                              {formatDate(task.fechaLimite)}
                            </span>
                          )}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {selectedTask && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-modal-title"
            >
              <div className={styles.modalHeader}>
                <h2 id="task-modal-title" className={styles.modalTitle}>
                  {selectedTask.titulo}
                </h2>
                <button
                  className={styles.closeBtn}
                  onClick={closeModal}
                  disabled={saving}
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <p className={styles.modalId}>#{selectedTask.idTarea}</p>

                {selectedTask.descripcion && (
                  <p className={styles.modalDesc}>{selectedTask.descripcion}</p>
                )}

                <div className={styles.modalMeta}>
                  {selectedTask.fechaLimite && (
                    <div className={styles.modalMetaItem}>
                      <Calendar size={14} />
                      <span>
                        Fecha límite: {formatDate(selectedTask.fechaLimite)}
                      </span>
                    </div>
                  )}
                  {selectedTask.tiempoEstimado != null && (
                    <div className={styles.modalMetaItem}>
                      <Clock size={14} />
                      <span>
                        Tiempo estimado: {selectedTask.tiempoEstimado}h
                      </span>
                    </div>
                  )}
                  {selectedTask.tiempoReal != null && (
                    <div className={styles.modalMetaItem}>
                      <Clock size={14} />
                      <span>Horas reales: {selectedTask.tiempoReal}h</span>
                    </div>
                  )}
                </div>

                <div className={styles.statusSection}>
                  <p className={styles.statusSectionTitle}>Cambiar estado</p>
                  {selectedTask.idEstado === 3 ? (
                    <p className={styles.completedNotice}>
                      Las tareas completadas no pueden cambiar de estado.
                    </p>
                  ) : (
                    <div className={styles.statusOptions}>
                      {COLUMNS.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          className={`${styles.statusBtn} ${editingStatus === col.id ? styles[col.colorClass + "Active"] : ""}`}
                          onClick={() => {
                            setEditingStatus(col.id);
                            if (col.id !== 3) setHorasReales("");
                          }}
                          disabled={saving}
                        >
                          <span
                            className={`${styles.statusDot} ${styles[col.colorClass]}`}
                          />
                          {col.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {editingStatus === 3 && selectedTask.idEstado !== 3 && (
                  <div className={styles.horasSection}>
                    <label className={styles.horasLabel} htmlFor="horas-reales">
                      ¿Cuántas horas tardaste en completar esta tarea?
                    </label>
                    <input
                      id="horas-reales"
                      type="number"
                      min="0"
                      step="0.5"
                      className={styles.horasInput}
                      value={horasReales}
                      onChange={(e) => setHorasReales(e.target.value)}
                      placeholder="ej. 3.5"
                      disabled={saving}
                    />
                  </div>
                )}

                {saveError && <p className={styles.saveError}>{saveError}</p>}
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.btnSecondary}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleSaveStatus}
                  disabled={
                    saving ||
                    editingStatus === selectedTask.idEstado ||
                    selectedTask.idEstado === 3 ||
                    (editingStatus === 3 && horasReales === "")
                  }
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
