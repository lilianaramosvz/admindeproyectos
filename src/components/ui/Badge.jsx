import styles from "../../styles/components/ui/Badge.module.css";

export default function Badge({ type, children }) {
  return (
    <span className={`${styles.badge} ${styles[type]}`}>
      {children}
    </span>
  );
}