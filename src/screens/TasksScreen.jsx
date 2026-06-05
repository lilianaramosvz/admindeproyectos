//frontend\src\screens\TasksScreen.jsx
import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Calendar, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getTasksByUser } from "../services/api";
import styles from "../styles/screens/SprintScreen.module.css";

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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.idUsuario) return;
    let isMounted = true;
    setLoading(true);
    getTasksByUser(user.idUsuario)
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
  }, [user?.idUsuario]);

  const displayName =
    user ? `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim() : "";

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
          <p>
            {displayName
              ? `Tareas asignadas a ${displayName}.`
              : "Tus tareas asignadas."}
          </p>
        </div>

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
                      <article key={task.idTarea} className={styles.task}>
                        <div className={styles.taskHeader}>
                          <span className={styles.taskTitle}>{task.titulo}</span>
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
      </div>
    </MainLayout>
  );
}
