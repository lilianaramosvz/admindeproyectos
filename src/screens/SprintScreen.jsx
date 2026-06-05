//frontend\src\screens\SprintScreen.jsx
import { useEffect, useRef, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Calendar, Clock, X } from "lucide-react";
import {
  getActiveProjects,
  getSprintsByProject,
  getTasksBySprint,
  updateTaskStatus,
} from "../services/api";
import styles from "../styles/screens/SprintScreen.module.css";

const COLUMNS = [
  { id: 1, title: "Por hacer", colorClass: "todo" },
  { id: 2, title: "En Progreso", colorClass: "inProgress" },
  { id: 3, title: "Hecho", colorClass: "done" },
];

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SprintScreen() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isSprintMenuOpen, setIsSprintMenuOpen] = useState(false);
  const sprintDropdownRef = useRef(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const projectDropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingProjects(true);
    getActiveProjects()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      })
      .catch(() => {
        if (isMounted) setProjects([]);
      })
      .finally(() => {
        if (isMounted) setLoadingProjects(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    let isMounted = true;
    setLoadingSprints(true);
    setSprints([]);
    setSelectedSprintId(null);
    setTasks([]);
    setIsSprintMenuOpen(false);
    getSprintsByProject(selectedProjectId)
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];
        setSprints(list);
        if (list.length > 0) setSelectedSprintId(list[0].idSprint);
      })
      .catch(() => {
        if (isMounted) setSprints([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSprints(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedSprintId == null) return;
    let isMounted = true;
    setLoadingTasks(true);
    setTasks([]);
    getTasksBySprint(selectedSprintId)
      .then((data) => {
        if (!isMounted) return;
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setTasks([]);
      })
      .finally(() => {
        if (isMounted) setLoadingTasks(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedSprintId]);

  useEffect(() => {
    if (!isSprintMenuOpen) return;

    function handlePointerDown(event) {
      if (!sprintDropdownRef.current?.contains(event.target)) {
        setIsSprintMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setIsSprintMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSprintMenuOpen]);

  useEffect(() => {
    if (!isProjectMenuOpen) return;

    function handlePointerDown(event) {
      if (!projectDropdownRef.current?.contains(event.target)) {
        setIsProjectMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setIsProjectMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProjectMenuOpen]);

  const completedCount = tasks.filter((t) => t.idEstado === 3).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const selectedSprint = sprints.find((s) => s.idSprint === selectedSprintId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const openModal = (task) => {
    setSelectedTask(task);
    setEditingStatus(task.idEstado);
    setSaveError(null);
  };

  const closeModal = () => {
    if (saving) return;
    setSelectedTask(null);
    setEditingStatus(null);
    setSaveError(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedTask || editingStatus === null) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateTaskStatus(selectedTask.idTarea, { idEstado: editingStatus });
      setTasks((prev) =>
        prev.map((t) =>
          t.idTarea === selectedTask.idTarea
            ? { ...t, idEstado: editingStatus }
            : t,
        ),
      );

      setSelectedTask(null);
      setEditingStatus(null);
    } catch {
      setSaveError("No se pudo actualizar el estado. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title="Sprint">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Sprint</h1>
          <p className={styles.intro}>
            ¡Bienvenido! Esta es la vista general del progreso de tu equipo.
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
                disabled={loadingProjects}
                aria-expanded={isProjectMenuOpen}
                aria-haspopup="listbox"
              >
                <span className={styles.sprintButtonLabel}>
                  {loadingProjects
                    ? "Cargando..."
                    : projects.length === 0
                      ? "Sin proyectos"
                      : (selectedProject?.nombre ?? "Selecciona proyecto")}
                </span>
                <span
                  className={`${styles.sprintChevron} ${isProjectMenuOpen ? styles.sprintChevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isProjectMenuOpen && projects.length > 0 && (
                <div
                  className={styles.sprintMenu}
                  role="listbox"
                  aria-label="Proyectos disponibles"
                >
                  {projects.map((p) => {
                    const isSelected = p.id === selectedProjectId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sprintOption} ${isSelected ? styles.sprintOptionSelected : ""}`}
                        onClick={() => {
                          setSelectedProjectId(Number(p.id));
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
                disabled={loadingSprints || !selectedProjectId}
                aria-expanded={isSprintMenuOpen}
                aria-haspopup="listbox"
              >
                <span className={styles.sprintButtonLabel}>
                  {loadingSprints
                    ? "Cargando..."
                    : sprints.length === 0
                      ? "Sin sprints"
                      : (selectedSprint?.nombre ?? "Selecciona sprint")}
                </span>
                <span
                  className={`${styles.sprintChevron} ${isSprintMenuOpen ? styles.sprintChevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isSprintMenuOpen && sprints.length > 0 && (
                <div
                  className={styles.sprintMenu}
                  role="listbox"
                  aria-label="Sprints disponibles"
                >
                  {sprints.map((s) => {
                    const isSelected = s.idSprint === selectedSprintId;
                    return (
                      <button
                        key={s.idSprint}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sprintOption} ${isSelected ? styles.sprintOptionSelected : ""}`}
                        onClick={() => {
                          setSelectedSprintId(s.idSprint);
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

        {selectedSprintId != null && !loadingTasks && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <div>
                <span className={styles.progressTitle}>
                  {selectedSprint?.nombre ?? "Sprint"}
                </span>
                {selectedSprint?.fechaInicio && selectedSprint?.fechaFin && (
                  <span className={styles.sprintDates}></span>
                )}
              </div>
              <span className={styles.progressLabel}>
                {completedCount} / {tasks.length} tareas completadas
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={styles.progressPercent}>
              {Math.round(progress)}%
            </span>
          </div>
        )}

        {loadingTasks ? (
          <div className={styles.loadingState}>Cargando tareas...</div>
        ) : selectedSprintId != null ? (
          <section className={styles.board} aria-label="Sprint board">
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
                          onKeyDown={(e) =>
                            e.key === "Enter" && openModal(task)
                          }
                          aria-label={`Abrir tarea: ${task.titulo}`}
                        >
                          <div className={styles.taskHeader}>
                            <span className={styles.taskTitle}>
                              {task.titulo}
                            </span>
                          </div>
                          <div className={styles.taskId}>#{task.idTarea}</div>
                          {task.descripcion && (
                            <p className={styles.taskDesc}>
                              {task.descripcion}
                            </p>
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
        ) : (
          <div className={styles.loadingState}>
            Selecciona un proyecto y sprint para ver las tareas.
          </div>
        )}

        {selectedTask && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className={styles.modalHeader}>
                <h2 id="modal-title" className={styles.modalTitle}>
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
                          onClick={() => setEditingStatus(col.id)}
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
                    selectedTask.idEstado === 3
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
