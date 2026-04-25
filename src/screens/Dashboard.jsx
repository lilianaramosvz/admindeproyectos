//frontend\src\screens\Dashboard.jsx
import MainLayout from "../components/layout/MainLayout";
import KpiCard from "../components/dashboard/KpiCard";
import { useKpis } from "../hooks/useKpis";
import { useKpiContext } from "../hooks/useKpiContext";
import SprintBoard from "../components/dashboard/SprintBoard";
import AIPanel from "../components/dashboard/AIPanel";
import styles from "../styles/screens/Dashboard.module.css";

export default function Dashboard() {
  const {
    userId,
    projectId,
    sprintId,
    userName,
    projectName,
    sprintName,
    loading: contextLoading,
    error: contextError,
  } = useKpiContext();
  const { kpis, loading, error } = useKpis({ userId, projectId, sprintId });

  if (contextLoading || loading) {
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
          <p className={styles.intro}>
            ¡Bienvenido! Esta es la vista general del progreso de tu equipo.
          </p>
          <p className={styles.contextMeta}>
            Usuario: {userName} | Proyecto: {projectName} | Sprint: {sprintName}
          </p>
        </div>

        {contextError ? (
          <div className={styles.error}>{contextError}</div>
        ) : null}
        {error ? <div className={styles.error}>{error}</div> : null}

        {/*KPIS*/}
        <div className={styles.kpiGrid}>
          {kpis.map(({ key: kpiKey, ...kpiProps }) => (
            <KpiCard key={kpiKey} {...kpiProps} />
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
