//frontend\src\screens\KPIScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import KpiCard from "../components/dashboard/KpiCard";
import MiniChart from "../components/dashboard/MiniChart";
import PrecisionEstimationChart from "../components/dashboard/PrecisionEstimationChart";
import SprintDurationChart from "../components/dashboard/SprintDurationChart";
import CycleTimeHistogramChart from "../components/dashboard/CycleTimeHistogramChart";
import { useKpis } from "../features/hooks/useKpis";
import { useKpiContext } from "../features/hooks/useKpiContext";
import { usePrecisionEstimationByUser } from "../features/hooks/usePrecisionEstimationByUser";
import { useTaskComplianceByUser } from "../features/hooks/useTaskComplianceByUser";
import UserComplianceChart from "../components/dashboard/UserComplianceChart";
import { getActiveSprints } from "../services/api";

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
  const [availableSprints, setAvailableSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [isSprintMenuOpen, setIsSprintMenuOpen] = useState(false);
  const sprintDropdownRef = useRef(null);

  useEffect(() => {
    if (sprintId == null) {
      return;
    }

    setSelectedSprintId((current) => current ?? sprintId);
  }, [sprintId]);

  useEffect(() => {
    let isMounted = true;

    async function loadSprints() {
      try {
        const response = await getActiveSprints();

        if (!isMounted) {
          return;
        }

        setAvailableSprints(Array.isArray(response) ? response : []);
      } catch {
        if (isMounted) {
          setAvailableSprints([]);
        }
      }
    }

    loadSprints();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isSprintMenuOpen) {
      return;
    }

    function handlePointerDown(event) {
      if (!sprintDropdownRef.current?.contains(event.target)) {
        setIsSprintMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsSprintMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSprintMenuOpen]);

  const effectiveSprintId = selectedSprintId ?? sprintId;
  const selectedSprintName = useMemo(() => {
    const selected = availableSprints.find((item) => item.id === effectiveSprintId);
    return selected?.nombre || sprintName;
  }, [availableSprints, effectiveSprintId, sprintName]);

  const { kpis, loading, error } = useKpis({
    userId,
    projectId,
    sprintId: effectiveSprintId,
  });
  const {
    data: complianceByUser,
    loading: complianceLoading,
    error: complianceError,
  } = useTaskComplianceByUser(effectiveSprintId);
  const {
    data: precisionByUser,
    loading: precisionLoading,
    error: precisionError,
  } = usePrecisionEstimationByUser(effectiveSprintId);

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
            <span>Usuario: {userName} | Proyecto: {projectName}</span>
            <span className={styles.sprintPicker} ref={sprintDropdownRef}>
              <button
                type="button"
                className={styles.sprintButton}
                onClick={() => setIsSprintMenuOpen((open) => !open)}
                aria-expanded={isSprintMenuOpen}
                aria-haspopup="listbox"
              >
                <span className={styles.sprintButtonLabel}>{selectedSprintName}</span>
                <span
                  className={`${styles.sprintChevron} ${isSprintMenuOpen ? styles.sprintChevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {isSprintMenuOpen && availableSprints.length > 0 ? (
                <div
                  className={styles.sprintMenu}
                  role="listbox"
                  aria-label="Sprints disponibles"
                >
                  {availableSprints.map((item) => {
                    const isSelected = item.id === effectiveSprintId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sprintOption} ${isSelected ? styles.sprintOptionSelected : ""}`}
                        onClick={() => {
                          setSelectedSprintId(item.id);
                          setIsSprintMenuOpen(false);
                        }}
                      >
                        <span className={styles.sprintOptionLabel}>{item.nombre}</span>
                        <span className={styles.sprintOptionCheck} aria-hidden="true">
                          {isSelected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </span>
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
                        ? "Comparativo de horas estimadas vs horas reales por usuario en el sprint activo"
                        : kpi.key === "duration"
                          ? "Comparativo de tiempo real del sprint vs tiempo planificado"
                          : kpi.key === "cycleTime"
                            ? "Histograma de tiempo real promedio vs tiempo esperado por tarea"
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
                    <UserComplianceChart data={complianceByUser} color={kpi.color} />
                  )}
                </>
              ) : kpi.key === "precision" ? (
                <>
                  {precisionError ? (
                    <div className={styles.error}>{precisionError}</div>
                  ) : null}
                  {precisionLoading ? (
                    <div className={styles.chartMeta}>
                      Cargando precisión de estimación por usuario...
                    </div>
                  ) : (
                    <PrecisionEstimationChart data={precisionByUser} color={kpi.color} />
                  )}
                </>
              ) : kpi.key === "duration" ? (
                <SprintDurationChart
                  comparison={kpi.durationComparison}
                  color={kpi.color}
                />
              ) : kpi.key === "cycleTime" ? (
                <CycleTimeHistogramChart
                  comparison={kpi.cycleTimeComparison}
                  color={kpi.color}
                />
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
