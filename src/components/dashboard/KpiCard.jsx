//frontend\src\components\dashboard\KpiCard.jsx
import styles from "../../styles/components/dashboard/KpiCard.module.css";

export const kpiCards = [
  {
    title: "Tiempo de ciclo por tarea",
    value: "2.7 días",
    change: "-8%",
    color: "green",
  },
  {
    title: "Duración del sprint",
    value: "14 días",
    change: "Estable",
    color: "blue",
  },
  {
    title: "Precisión de estimación de carga",
    value: "84%",
    change: "+5%",
    color: "purple",
  },
  {
    title: "Cumplimiento de ssssssssprint",
    value: "91%",
    change: "+4%",
    color: "orange",
  },
  {
    title: "Tiempo de bloqueo por dependencias",
    value: "6.2h",
    change: "-10%",
    color: "yellow",
    showChart: false,
  },
  {
    title: "Tasa de errores",
    value: "3.8%",
    change: "-0.6%",
    color: "yellow",
    showChart: false,
  },
  {
    title: "Cumplimiento de fechas límite",
    value: "88%",
    change: "+3%",
    color: "yellow",
    showChart: false,
  },
  {
    title: "Tareas incompletas por sprint",
    value: "4",
    change: "-1",
    color: "yellow",
    showChart: false,
  },
];

export const primaryKpiCards = kpiCards.slice(0, 4);

export const relevantChartKpis = [
  kpiCards[0],
  kpiCards[1],
  kpiCards[2],
  kpiCards[3],
];

export default function KpiCard({
  title,
  value,
  change,
  color = "blue",
  subtitle,
  showChart = true,
}) {
  const colorClass = styles[color] || "";

  return (
    <div className={`${styles.card} ${colorClass}`}>
      <div className={styles.top}>
        <div className={styles.icon}></div>
        <span className={styles.badge}>{change}</span>
      </div>

      <h2 className={styles.title}>{value}</h2>
      <p className={styles.subtitle}>{title}</p>

      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

      {showChart ? <div className={styles.chart}></div> : null}
    </div>
  );
}
