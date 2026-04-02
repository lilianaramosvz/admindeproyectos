//frontend\src\components\dashboard\KpiCard.jsx
import styles from "../../styles/components/dashboard/KpiCard.module.css";

const kpis = [
  { title: "Tareas completadas", value: "12/18", change: "+8%", color: "blue" },
  { title: "En progreso", value: "5", change: "+2%", color: "green" },
  { title: "Atrasadas", value: "2", change: "-1%", color: "purple" },
  { title: "Velocidad del equipo", value: "87%", change: "+5%", color: "orange" },
];

function KpiCardItem({ title, value, change, color }) {
  const colorClass = styles[color] || "";

  return (
    <div className={`${styles.card} ${colorClass}`}>
      <div className={styles.top}>
        <div className={styles.icon}></div>
        <span className={styles.badge}>{change}</span>
      </div>

      <h2 className={styles.title}>{value}</h2>
      <p className={styles.subtitle}>{title}</p>

      <div className={styles.chart}></div>
    </div>
  );
}

export default function KpiCard() {
  return (
    <section className={styles.grid} aria-label="KPI overview">
      {kpis.map((kpi) => (
        <KpiCardItem key={kpi.title} {...kpi} />
      ))}
    </section>
  );
}
