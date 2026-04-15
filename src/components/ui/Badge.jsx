//frontend\src\components\ui\Badge.jsx
import styles from "../../styles/components/ui/Badge.module.css";

export default function Badge({ type, children }) {
  const normalizedType =
    {
      alta: "high",
      high: "high",
      media: "medium",
      medium: "medium",
      baja: "low",
      low: "low",
    }[(type || "").toLowerCase()] || "low";

  const label = {
    high: "alta",
    medium: "media",
    low: "baja",
  }[normalizedType];

  return (
    <span className={`${styles.badge} ${styles[normalizedType]}`}>
      {label || children}
    </span>
  );
}
