//frontend\src\screens\KPIScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import KpiCard, {
  kpiCards,
  relevantChartKpis,
} from "../components/dashboard/KpiCard";

import styles from "../styles/screens/KPIScreen.module.css";

export default function KPIScreen() {
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
          {kpiCards.map((kpi) => (
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
