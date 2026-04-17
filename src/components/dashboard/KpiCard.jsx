//frontend\src\components\dashboard\KpiCard.jsx
import styles from "../../styles/components/dashboard/KpiCard.module.css";
import MiniChart from "./MiniChart";
import { useState } from "react";

export const kpiCards = [
  {
    metricKey: "cycleTime",
    title: "Tiempo de ciclo por tarea",
    value: "2.7 días",
    change: "-8%",
    color: "green",
  },
  {
    metricKey: "duration",
    title: "Duración del sprint",
    value: "14 días",
    change: "Estable",
    color: "blue",
  },
  {
    metricKey: "precision",
    title: "Precisión de estimación de carga",
    value: "84%",
    change: "+5%",
    color: "purple",
  },
  {
    metricKey: "compliance",
    title: "Cumplimiento de sprint",
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

export const secondaryKpiCards = kpiCards.slice(4, 8);

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
  statusMessage,
  color = "blue",
  subtitle,
  showChart = true,
  chartData = [],
}) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const colorClass = styles[color] || "";
  const hasChartData =
    showChart && Array.isArray(chartData) && chartData.length > 0;
  const hasStatusMessage = Boolean(
    statusMessage && String(statusMessage).trim(),
  );

  return (
    <div className={`${styles.card} ${colorClass}`}>
      <div className={styles.top}>
        <div className={styles.icon}></div>
        <div className={styles.actions}>
          <span className={styles.badge}>{change}</span>
          {hasStatusMessage ? (
            <button
              type="button"
              className={styles.infoButton}
              onClick={() => setIsInfoOpen((open) => !open)}
              aria-expanded={isInfoOpen}
              aria-label={`Mostrar mas informacion de ${title}`}
            >
              {isInfoOpen ? "-" : "+"}
            </button>
          ) : null}
        </div>
      </div>

      <h2 className={styles.title}>{value}</h2>
      <p className={styles.subtitle}>{title}</p>

      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

      {hasStatusMessage && isInfoOpen ? (
        <div className={styles.infoPanel}>{statusMessage}</div>
      ) : null}

      {showChart ? (
        <div className={styles.chart}>
          {hasChartData ? (
            <MiniChart data={chartData} color={color} compact />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
