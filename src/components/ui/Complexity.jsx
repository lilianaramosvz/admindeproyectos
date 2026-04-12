import styles from "../../styles/components/ui/Complexity.module.css";

export default function Complexity({ level, max = 5 }) {
  return (
    <div className={styles.complexity}>
      {[...Array(max)].map((_, i) => (
        <div
          key={i}
          className={`${styles.dot} ${i < level ? styles.dotActive : ""}`}
        />
      ))}
    </div>
  );
}