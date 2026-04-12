import styles from "../../styles/screens/BacklogTable.module.css";
import Avatar from "../ui/Avatar";
import Complexity from "../ui/Complexity";
import Badge from "../ui/Badge";
import { Search } from "lucide-react";


export default function BacklogPanel() {
  const tasks = [
  {
    id: "TSK-001",
    title: "Desarrollo de Dashboard",
    priority: "high",
    complexity: 4,
    hours: "4h",
    assignee: "LR",
    name: "Liliana Ramos",
    sprint: "Sprint 11",
  },
  {
    id: "TSK-002",
    title: "Desarrollo de Backlog",
    priority: "medium",
    complexity: 3,
    hours: "3h",
    assignee: "AR",
    name: "Anna Ramirez",
    sprint: "Sprint 1",
  },
  {
    id: "TSK-003",
    title: "Desarrollo de KPIs",
    priority: "medium",
    complexity: 3,
    hours: "2h",
    assignee: "AR",
    name: "Liliana Ramos",
    sprint: "Sprint 1",
  },
];
  return (
  
    <div>
      <section className={styles.wrapperSearch}>
      <div className={styles.searchBar}>
        <Search className={styles.icon} />
        <input placeholder="Search tasks..." />
      </div>
      </section>
    

    <section className={styles.wrapper}>
      

      <div className={styles.board}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>TAREA</div>
          <div>PRIORIDAD</div>
          <div>COMPLEJIDAD</div>
          <div>EST. HORAS</div>
          <div>ASIGNADO</div>
          <div>SPRINT</div>
        </div>

        {tasks.map((task) => (
          <div key={task.id} className={styles.row}>
            <div>
              <strong>{task.title}</strong>
              <p>{task.id}</p>
            </div>

            <div>
              <Badge type={task.priority}>
                  {task.priority}
              </Badge>
            </div>

            <Complexity level={task.complexity} />

            <div>{task.hours}</div>

            <div className={styles.assignee}>
              <Avatar initials={task.assignee} />
              {task.name}
            </div>

            <div>{task.sprint}</div>
          </div>
        ))}
      </div>
    </section>
  </div>
);
}