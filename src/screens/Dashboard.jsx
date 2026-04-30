//frontend\src\screens\Dashboard.jsx
import MainLayout from "../components/layout/MainLayout";
import KpiCard from "../components/dashboard/KpiCard";
import { useKpis } from "../hooks/useKpis";
import { useKpiCardValues } from "../hooks/useKpiCardValues";
import { useKpiContext } from "../hooks/useKpiContext";
import { useTaskComplianceByUser } from "../hooks/useTaskComplianceByUser";
import { useAuth } from "../context/AuthContext";
import SprintBoard from "../components/dashboard/SprintBoard";
import AIPanel from "../components/dashboard/AIPanel";
import styles from "../styles/screens/Dashboard.module.css";

export default function Dashboard() {
  const { user } = useAuth();
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

  const teamName = user?.idEquipo ?? "Equipo";
  const { kpis, loading, error } = useKpis({ userId, projectId, sprintId });
  const { data: complianceByUser } = useTaskComplianceByUser(sprintId);
  const { kpisForCards } = useKpiCardValues({
    kpis,
    complianceByUser,
  });

  if (contextLoading || loading) {
    return (
      <MainLayout title="Dashboard">
        <div className={styles.container}>Cargando...</div>
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
            Equipo: {teamName} | Sprint: {sprintName}
          </p>
        </div>

        {contextError ? (
          <div className={styles.error}>{contextError}</div>
        ) : null}
        {error ? <div className={styles.error}>{error}</div> : null}

        {/*KPIS*/}
        <div className={styles.kpiGrid}>
          {kpisForCards.map(({ key: kpiKey, ...kpiProps }) => (
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
