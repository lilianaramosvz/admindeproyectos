//frontend\src\components\dashboard\KpiCard.jsx
import styles from "../../styles/components/dashboard/KpiCard.module.css";
import { useState } from "react";

export default function KpiCard({
  title,
  value,
  change,
  statusMessage,
  color = "blue",
  subtitle,
}) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const colorClass = styles[color] || "";
  const infoText = String(statusMessage ?? "").trim() || String(change ?? "").trim() || "Sin detalles";

  return (
    <div className={`${styles.card} ${colorClass}`}>
      <div className={styles.top}>
        <div className={styles.icon}></div>
        <div className={styles.actions}>
          <span className={styles.badge}>{change}</span>
          <button
            type="button"
            className={styles.infoButton}
            onClick={() => setIsInfoOpen((open) => !open)}
            aria-expanded={isInfoOpen}
            aria-label={`Mostrar mas informacion de ${title}`}
          >
            {isInfoOpen ? "-" : "+"}
          </button>
        </div>
      </div>

      <h2 className={styles.title}>{value}</h2>
      <p className={styles.subtitle}>{title}</p>

      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

      {isInfoOpen ? (
        <div className={styles.infoPanel}>{infoText}</div>
      ) : null}
    </div>
  );
}
