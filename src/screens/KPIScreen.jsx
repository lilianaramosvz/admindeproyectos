//frontend\src\screens\KPIScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import KpiCard from "../components/dashboard/KpiCard";
import MiniChart from "../components/dashboard/MiniChart";
import PrecisionEstimationChart from "../components/dashboard/PrecisionEstimationChart";
import { useKpis } from "../features/hooks/useKpis";
import { useKpiContext } from "../features/hooks/useKpiContext";
import { useTaskComplianceByUser } from "../features/hooks/useTaskComplianceByUser";
import UserComplianceChart from "../components/dashboard/UserComplianceChart";

import styles from "../styles/screens/KPIScreen.module.css";

export default function KPIScreen() {
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
  const {
    data: complianceByUser,
    loading: complianceLoading,
    error: complianceError,
  } = useTaskComplianceByUser(sprintId);

  if (contextLoading || loading) {
    return <div className={styles.container}>Cargando KPIs...</div>;
  }

  return (
    <MainLayout title="KPIs">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Indicadores Clave de Desempeño</h1>
          <p className={styles.intro}>
            Aquí puedes ver los KPI's clave de tu equipo para evaluar su
            desempeño y progreso.
          </p>
          <p className={styles.contextMeta}>
            Usuario: {userName} | Proyecto: {projectName} | Sprint: {sprintName}
          </p>
        </div>

        {contextError ? (
          <div className={styles.error}>{contextError}</div>
        ) : null}
        {error ? <div className={styles.error}>{error}</div> : null}

        {/* MAIN KPIs */}
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* SECONDARY KPIs 
        <div className={styles.kpiGrid}>
          {secondaryKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>*/}

        {/* charts */}
        <div className={styles.charts}>
          {kpis.map((kpi) => (
            <div key={kpi.title} className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div>
                  <h3>{kpi.title}</h3>
                  <p className={styles.chartMeta}>
                    {kpi.key === "compliance"
                      ? "Cumplimiento de tareas completadas por usuario en el sprint activo"
                      : kpi.key === "precision"
                        ? "Comparativo de tiempo estimado vs tiempo real del usuario activo"
                      : kpi.hasHistory
                        ? `Histórico de ${kpi.chartData?.length ?? 0} mediciones`
                        : "Sin historial: mostrando valor actual"}
                  </p>
                </div>
                <span className={styles.chartValue}>{kpi.value}</span>
              </div>
              {kpi.key === "compliance" ? (
                <>
                  {complianceError ? (
                    <div className={styles.error}>{complianceError}</div>
                  ) : null}
                  {complianceLoading ? (
                    <div className={styles.chartMeta}>
                      Cargando cumplimiento por usuario...
                    </div>
                  ) : (
                    <UserComplianceChart data={complianceByUser} />
                  )}
                </>
              ) : kpi.key === "precision" ? (
                <PrecisionEstimationChart comparison={kpi.estimationComparison} />
              ) : (
                <MiniChart
                  data={kpi.chartData}
                  color={kpi.color}
                  unit={kpi.unit}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
