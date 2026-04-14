//frontend\src\components\dashboard\SprintBoard.jsx
import styles from "../../styles/components/dashboard/SprintBoard.module.css";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { Calendar, Clock } from "lucide-react";

export const sprintTasks = [
  {
    title: "Por hacer",

    tasks: [
      {
        id: "TSK-001",
        title: "Desarrollo de KPIs",
        priority: "medium",
        date: "Mar 14",
        hours: "2h",
        assignee: "LR",
        name: "Liliana Ramos",
      },
    ],
  },
  {
    title: "En Progreso",
    tasks: [
      {
        id: "TSK-002",
        title: "Desarrollo de Backlog",
        priority: "medium",
        date: "Mar 15",
        hours: "3h",
        assignee: "AR",
        name: "Anna Ramirez",
      },
    ],
  },
  {
    title: "Hecho",
    tasks: [
      {
        id: "TSK-003",
        title: "Desarrollo de Sprint Board",
        priority: "high",
        date: "Mar 13",
        hours: "4h",
        assignee: "AR",
        name: "Anna Ramirez",
      },
      {
        id: "TSK-003",
        title: "Desarrollo de Dashboard",
        priority: "high",
        date: "Mar 13",
        hours: "4h",
        assignee: "LR",
        name: "Liliana Ramos",
      },
      {
        id: "TSK-003",
        title: "Desarrollo de Tasks",
        priority: "low",
        date: "Mar 13",
        hours: "4h",
        assignee: "AR",
        name: "Anna Ramirez",
      },
      {
        id: "TSK-003",
        title: "Desarrollo de Dashboard",
        priority: "high",
        date: "Mar 13",
        hours: "4h",
        assignee: "LR",
        name: "Liliana Ramos",
      },
      {
        id: "TSK-003",
        title: "Desarrollo de vista de KPIS",
        priority: "high",
        date: "Mar 13",
        hours: "4h",
        assignee: "LR",
        name: "Liliana Ramos",
      },
    ],
  },
];

export default function SprintBoard() {
  return (
    <section className={styles.wrapper} aria-label="Sprint board">
      <h2 className={styles.title}>Tablero de Sprint</h2>
      <div className={styles.board}>
        {sprintTasks.map((col) => (
          <div key={col.title} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>{col.title}</span>
              <span className={styles.count}>{col.tasks.length}</span>
            </div>

            {col.tasks.map((task) => (
              <article key={task.id} className={styles.task}>
                <div className={styles.taskHeader}>
                  <span className={styles.taskTitle}>{task.title}</span>
                  <Badge type={task.priority}>{task.priority}</Badge>
                </div>

                <div className={styles.taskId}>{task.id}</div>

                <div className={styles.taskMeta}>
                  <span className={styles.metaItem}>
                    <Clock size={14} />
                    {task.hours}
                  </span>
                  <span className={styles.metaItem}>
                    <Calendar size={14} />
                    {task.date}
                  </span>
                </div>

                <div className={styles.taskFooter}>
                  <Avatar initials={task.assignee} />
                  <span>{task.name}</span>
                </div>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
