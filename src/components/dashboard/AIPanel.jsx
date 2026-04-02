//frontend\src\components\dashboard\AIPanel.jsx
import styles from "../../styles/components/dashboard/AIPanel.module.css";

export default function AIPanel() {
  return (
    <aside className={styles.panel} aria-label="AI assistant panel">
      <h2 className={styles.title}>Asistente de IA</h2>
      <p className={styles.subtitle}>Áreas de enfoque sugeridas para hoy.</p>

      <div className={styles.insight}>
        La velocidad del equipo es estable, pero dos tareas están envejeciendo
        en revisión.
      </div>
      <div className={styles.insight}>
        Considera mover un elemento del backlog al sprint.
      </div>
      <div className={styles.insight}>
        No se detectaron señales de bloqueo en la última sincronización.
      </div>
    </aside>
  );
}
