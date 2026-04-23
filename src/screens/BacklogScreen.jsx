//frontend\src\screens\BacklogScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import BacklogPanel from "../components/backlog/BacklogPanel";
import styles from "../styles/screens/Backlog.module.css";

export default function BacklogScreen() {
  return (
    <MainLayout title="Backlog">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Backlog</h1>
          <p className={styles.headerDescription}>
            Encuentra aquí todas las tareas y planeación futura.
          </p>
        </div>

        <div className={styles.bottom}>
          <BacklogPanel />
        </div>
      </div>
    </MainLayout>
  );
}
