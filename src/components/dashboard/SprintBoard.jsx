//frontend\src\components\dashboard\SprintBoard.jsx
import { useEffect, useState } from "react";
import styles from "../../styles/components/dashboard/SprintBoard.module.css";
import { Calendar, Clock } from "lucide-react";
import { getTasksBySprint } from "../../services/api";

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
  });
}

export default function SprintBoard({ sprintId, sprintName }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sprintId == null) return;
    let isMounted = true;
    setLoading(true);
    setTasks([]);
    getTasksBySprint(sprintId)
      .then((data) => {
        if (!isMounted) return;
        setTasks(Array.isArray(data) ? data : []);
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
  }, [sprintId]);

  return (
    <section className={styles.wrapper} aria-label="Sprint board">
      <h2 className={styles.title}>Tablero de Sprint</h2>

      {loading ? (
        <div className={styles.loading}>Cargando tareas...</div>
      ) : (
        <div className={styles.board}>
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

                {colTasks.length === 0 ? (
                  <div className={styles.emptyCol}>Sin tareas</div>
                ) : (
                  colTasks.map((task) => (
                    <article key={task.idTarea} className={styles.task}>
                      <div className={styles.taskHeader}>
                        <span className={styles.taskTitle}>{task.titulo}</span>
                      </div>
                      <div className={styles.taskId}>#{task.idTarea}</div>
                      <div className={styles.taskMeta}>
                        {task.tiempoEstimado != null && (
                          <span className={styles.metaItem}>
                            <Clock size={12} />
                            {task.tiempoEstimado}h
                          </span>
                        )}
                        {task.fechaLimite && (
                          <span className={styles.metaItem}>
                            <Calendar size={12} />
                            {formatDate(task.fechaLimite)}
                          </span>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
