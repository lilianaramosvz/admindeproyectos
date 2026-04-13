//frontend\src\screens\KPIScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import KpiCard, {
  kpiCards,
  relevantChartKpis,
} from "../components/dashboard/KpiCard";
import { useKpis } from "../features/hooks/useKpis";

import styles from "../styles/screens/KPIScreen.module.css";

export default function KPIScreen() {
  const userId = Number(import.meta.env.VITE_KPI_USER_ID || 1);
  const projectId = Number(import.meta.env.VITE_KPI_PROJECT_ID || 1);
  const { kpis, loading, error } = useKpis({ userId, projectId });

  if (loading) {
    return <div className={styles.container}>Cargando KPIs...</div>;
  }

  const secondaryKpis = kpiCards.slice(4, 8);

  return (
    <MainLayout title="KPIs">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Indicadores Clave de Desempeño</h1>
          <p style={{ paddingTop: "12px" }}>
            Aquí puedes ver los KPI's clave de tu equipo para evaluar su
            desempeño y progreso.
          </p>
        </div>

        {/* MAIN KPIs */}
        <div className={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* SECONDARY KPIs */}
        <div className={styles.kpiGrid}>
          {secondaryKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* charts */}
        <div className={styles.charts}>
          {relevantChartKpis.map((kpi) => (
            <div key={kpi.title} className={styles.chartCard}>
              <h3>{kpi.title}</h3>
              <div className={styles.chartPlaceholder}></div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
