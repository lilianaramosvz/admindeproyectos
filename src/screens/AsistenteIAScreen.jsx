//frontend\src\screens\AsistenteIAScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import styles from "../styles/screens/AsistenteIA.module.css";

export default function AsistenteIAScreen() {
  return (
    <MainLayout title="Asistente IA">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Asistente IA</h1>
          <p className={styles.headerDescription}>
            Recomendaciones y asistencia inteligente para tu gestión de
            proyectos.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
