//frontend\src\components\dashboard\KpiCard.jsx
import styles from "../../styles/components/dashboard/KpiCard.module.css";
import MiniChart from "./MiniChart";
import { useState } from "react";

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
