//frontend\src\components\dashboard\SprintBoard.jsx
import styles from "../../styles/components/dashboard/SprintBoard.module.css";

export default function SprintBoard() {
  return (
    <section className={styles.wrapper} aria-label="Sprint board">
      <h2 className={styles.title}>Tablero de Sprint</h2>
      <div className={styles.board}>
        <div className={styles.column}>
          <strong className={styles.columnTitle}>Por hacer</strong>
          <div className={styles.task}>Definir objetivos de sprint</div>
          <div className={styles.task}>Revisar elementos del backlog</div>
        </div>
        <div className={styles.column}>
          <strong className={styles.columnTitle}>En Progreso</strong>
          <div className={styles.task}>Construir tarjetas del tablero</div>
        </div>
        <div className={styles.column}>
          <strong className={styles.columnTitle}>Hecho</strong>
          <div className={styles.task}>Configurar el contenedor de diseño</div>
        </div>
      </div>
    </section>
  );
}
