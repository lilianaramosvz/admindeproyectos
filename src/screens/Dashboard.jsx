//frontend\src\screens\Dashboard.jsx
import MainLayout from "../components/layout/MainLayout";
import KpiCard from "../components/dashboard/KpiCard";
import { useKpis } from "../features/hooks/useKpis";
import SprintBoard from "../components/dashboard/SprintBoard";
import AIPanel from "../components/dashboard/AIPanel";
import styles from "../styles/screens/Dashboard.module.css";

export default function Dashboard() {
  const userId = Number(import.meta.env.VITE_KPI_USER_ID || 1);
  const projectId = Number(import.meta.env.VITE_KPI_PROJECT_ID || 1);
  const { kpis, loading } = useKpis({ userId, projectId });

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className={styles.container}>Cargando KPIs...</div>
      </MainLayout>
    );
  }

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
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/*SprintBoard e IA*/}
        <div className={styles.bottom}>
          <SprintBoard />
          <AIPanel />
        </div>
      </div>
    </MainLayout>
  );
}
