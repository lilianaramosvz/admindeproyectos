//frontend\src\screens\Dashboard.jsx
import MainLayout from "../components/layout/MainLayout";
import KpiCard from "../components/dashboard/KpiCard";
import SprintBoard from "../components/dashboard/SprintBoard";
import AIPanel from "../components/dashboard/AIPanel";
import styles from "../styles/screens/Dashboard.module.css";

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard">
      {/*Header*/}
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <p style={{ paddingTop: "12px" }}>
            ¡Bienvenido! Esta es la vista general del progreso de tu equipo.
          </p>
        </div>

        {/*KPIS*/}
        <KpiCard />

        {/*SprintBoard e IA*/}
        <div className={styles.bottom}>
          <SprintBoard />
          <AIPanel />
        </div>
      </div>
    </MainLayout>
  );
}
