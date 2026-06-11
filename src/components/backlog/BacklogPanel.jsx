//frontend\src\components\backlog\BacklogPanel.jsx
import { useMemo, useState } from "react";
import styles from "../../styles/components/backlog/BacklogTable.module.css";
import Avatar from "../ui/Avatar";
import Complexity from "../ui/Complexity";
import Badge from "../ui/Badge";
import {
  Search,
  Filter,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Timer,
} from "lucide-react";
import { useBacklogTasks } from "../../hooks/useBacklogTasks";
import { isExcludedSprintLabel } from "../../utils/sprints";
import taskStyles from "../../styles/screens/TasksScreen.module.css";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BacklogPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSprint, setSelectedSprint] = useState("todos");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { tasks, loading, error } = useBacklogTasks();

  const availableSprints = useMemo(() => {
    const sprints = [...new Set(tasks.map((t) => t.sprint))];
    return sprints
      .filter((sprint) => !isExcludedSprintLabel(sprint))
      .sort((a, b) => {
      const numA = Number(a.replace(/\D/g, ""));
      const numB = Number(b.replace(/\D/g, ""));
      return numB - numA;
      });
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSprint =
        selectedSprint === "todos" || task.sprint === selectedSprint;
      const matchesSearch =
        !term ||
        [task.title, task.id, task.name, task.sprint, task.status].some((v) =>
          v?.toLowerCase().includes(term),
        );
      return matchesSprint && matchesSearch;
    });
  }, [searchTerm, selectedSprint, tasks]);

  return (
    <div>
      <section className={styles.wrapperSearch}>
        <div className={styles.searchBar}>
          <Search className={styles.icon} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tareas..."
            aria-label="Buscar tareas"
          />
        </div>

        <button
          className={`${styles.filterButton} ${selectedSprint !== "todos" ? styles.filterButtonActive : ""}`}
          onClick={() => setShowFilter((prev) => !prev)}
          aria-label="Filtrar por sprint"
        >
          <Filter size={16} />
        </button>

        {showFilter && (
          <div
            className={styles.filterDropdown}
            role="listbox"
            aria-label="Filtrar por sprint"
          >
            <button
              role="option"
              aria-selected={selectedSprint === "todos"}
              className={
                selectedSprint === "todos"
                  ? styles.filterOptionActive
                  : styles.filterOption
              }
              onClick={() => {
                setSelectedSprint("todos");
                setShowFilter(false);
              }}
            >
              <span className={styles.filterOptionLabel}>
                Todos los sprints
              </span>
              <span className={styles.filterOptionCheck}>
                {selectedSprint === "todos" ? "✓" : ""}
              </span>
            </button>
            {availableSprints.map((sprint) => (
              <button
                key={sprint}
                role="option"
                aria-selected={selectedSprint === sprint}
                className={
                  selectedSprint === sprint
                    ? styles.filterOptionActive
                    : styles.filterOption
                }
                onClick={() => {
                  setSelectedSprint(sprint);
                  setShowFilter(false);
                }}
              >
                <span className={styles.filterOptionLabel}>{sprint}</span>
                <span className={styles.filterOptionCheck}>
                  {selectedSprint === sprint ? "✓" : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={styles.wrapper}>
        <div className={styles.board}>
          <div className={styles.header}>
            <div>TAREA</div>
            <div>ESTADO</div>
            <div>COMPLEJIDAD</div>
            <div>EST. HORAS</div>
            <div>ASIGNADO</div>
            <div>SPRINT</div>
          </div>

          {loading && (
            <div className={styles.noResults}>Cargando tareas...</div>
          )}
          {!loading && error && <div className={styles.noResults}>{error}</div>}

          {!loading &&
            !error &&
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={styles.row}
                onClick={() => setSelectedTask(task)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.id}</p>
                </div>
                <div>
                  <Badge type={task.status}>{task.status}</Badge>
                </div>
                <Complexity level={task.complexity} />
                <div>{task.hours}</div>
                <div className={styles.assignee}>
                  <Avatar initials={task.assignee} />
                  <span className={styles.assigneeName}>{task.name}</span>
                </div>
                <div>{task.sprint}</div>
              </div>
            ))}

          {!loading && !error && filteredTasks.length === 0 && (
            <div className={styles.noResults}>No se encontraron tareas.</div>
          )}
        </div>
      </section>

      {/* Modal detalle tarea */}
      {selectedTask && (
        <div
          className={taskStyles.modalOverlay}
          onClick={() => setSelectedTask(null)}
        >
          <div
            className={taskStyles.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={taskStyles.modalHeader}>
              <h2 className={taskStyles.modalTitle}>{selectedTask.title}</h2>
              <button
                className={taskStyles.closeBtn}
                onClick={() => setSelectedTask(null)}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className={taskStyles.modalBody}>
              <p className={taskStyles.modalId}>{selectedTask.id}</p>

              <div className={taskStyles.modalMetaItem}>
                {selectedTask.status === "completada" && (
                  <CheckCircle2 size={15} color="var(--green)" />
                )}
                {selectedTask.status === "en progreso" && (
                  <Timer size={15} color="var(--blue)" />
                )}
                {selectedTask.status === "pendiente" && (
                  <Circle size={15} color="var(--text-tertiary)" />
                )}
                <span
                  style={{
                    fontSize: "13px",
                    textTransform: "capitalize",
                    color: "var(--text-secondary)",
                  }}
                >
                  {selectedTask.status}
                </span>
              </div>

              {selectedTask.description ? (
                <p className={taskStyles.modalDesc}>
                  {selectedTask.description}
                </p>
              ) : (
                <p
                  className={taskStyles.modalDesc}
                  style={{ fontStyle: "italic", color: "var(--text-tertiary)" }}
                >
                  Sin descripción.
                </p>
              )}

              <div className={taskStyles.modalMeta}>
                {selectedTask.fechaFin && (
                  <div className={taskStyles.modalMetaItem}>
                    <Calendar size={14} />
                    <span>
                      Fecha de entrega: {formatDate(selectedTask.fechaFin)}
                    </span>
                  </div>
                )}
                {selectedTask.hours && (
                  <div className={taskStyles.modalMetaItem}>
                    <Clock size={14} />
                    <span>Horas estimadas: {selectedTask.hours}</span>
                  </div>
                )}
                {selectedTask.status === "completada" &&
                  selectedTask.tiempoReal != null && (
                    <div className={taskStyles.modalMetaItem}>
                      <Clock size={14} />
                      <span>Horas reales: {selectedTask.tiempoReal}h</span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
