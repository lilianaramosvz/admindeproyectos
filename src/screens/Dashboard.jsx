//frontend\src\screens\Dashboard.jsx
import MainLayout from "../components/layout/MainLayout";
import KpiCard from "../components/dashboard/KpiCard";
import { useKpis } from "../hooks/useKpis";
import { useKpiCardValues } from "../hooks/useKpiCardValues";
import { useKpiContext } from "../hooks/useKpiContext";
import { useTaskComplianceByUser } from "../hooks/useTaskComplianceByUser";
import { useSprintCompletedTasks } from "../hooks/useSprintCompletedTasks";
import { useAuth } from "../context/AuthContext";
import { useSelection } from "../context/SelectionContext";
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

  const displayName = user
    ? `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim()
    : "";

  const { sprintId: sharedSprintId, sprintName: sharedSprintName } =
    useSelection();
  const effectiveSprintId = sharedSprintId ?? sprintId;
  const effectiveSprintName = sharedSprintName || sprintName;
  const sprintCompletedTasks = useSprintCompletedTasks(effectiveSprintId);

  const teamName = user?.idEquipo ?? "Equipo";
  const { kpis, loading, error } = useKpis({
    userId,
    projectId,
    sprintId: effectiveSprintId,
  });
  const { data: complianceByUser } = useTaskComplianceByUser(effectiveSprintId);
  const { kpisForCards } = useKpiCardValues({
    kpis,
    complianceByUser,
    sprintCompletedTasks,
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
            {displayName
              ? `¡Bienvenido, ${displayName}!`
              : "Tus tareas asignadas."}
          </p>
          <p className={styles.intro}>
            Esta es la vista general del progreso de tu equipo {teamName}.
          </p>
          {effectiveSprintName && (
            <span className={styles.sprintChip}>{effectiveSprintName}</span>
          )}
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
          <SprintBoard
            sprintId={effectiveSprintId}
            sprintName={effectiveSprintName}
          />
          <AIPanel />
        </div>
      </div>
    </MainLayout>
  );
}
