//frontend\src\screens\KPIScreen.jsx
import MainLayout from "../components/layout/MainLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import KpiCard from "../components/dashboard/KpiCard";
import MiniChart from "../components/dashboard/MiniChart";
import PrecisionEstimationChart from "../components/charts/PrecisionEstimationChart";
import SprintDurationChart from "../components/charts/SprintDurationChart";
import TasksByUserChart from "../components/charts/TasksByUserChart";
import RealHoursByUser from "../components/charts/RealHoursByUser";
import TasksHistoryChart from "../components/charts/TasksHistoryChart";
import RealHoursHistoryChart from "../components/charts/RealHoursHistoryChart";
import { useKpis } from "../hooks/useKpis";
import { useKpiCardValues } from "../hooks/useKpiCardValues";
import { useKpiContext } from "../hooks/useKpiContext";
import { usePrecisionEstimationByUser } from "../hooks/usePrecisionEstimationByUser";
import { useTaskComplianceByUser } from "../hooks/useTaskComplianceByUser";
import { useSprintCompletedTasks } from "../hooks/useSprintCompletedTasks";
import { useRealHoursByUser } from "../hooks/useRealHoursByUser";
import {
  getActiveProjects,
  getSprintsByProject,
} from "../services/api";
import { useSelection } from "../context/SelectionContext";
import {
  filterSelectableSprints,
  getSelectableSprintId,
} from "../utils/sprints";

import styles from "../styles/screens/KPIScreen.module.css";

export default function KPIScreen() {
  const {
    userId,
    projectId,
    sprintId,
    projectName,
    sprintName,
    loading: contextLoading,
    error: contextError,
  } = useKpiContext();

  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const projectDropdownRef = useRef(null);

  const [availableSprints, setAvailableSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [isSprintMenuOpen, setIsSprintMenuOpen] = useState(false);
  const sprintDropdownRef = useRef(null);
  const {
    sprintId: sharedSprintId,
    setSprintId: setSharedSprintId,
    setSprintName: setSharedSprintName,
  } = useSelection();

  const effectiveProjectId = selectedProjectId ?? projectId;
  const effectiveSprintId = selectedSprintId ?? sprintId;
  const sprintCompletedTasks = useSprintCompletedTasks(effectiveSprintId);

  // Cargar proyectos activos al montar el componente
  useEffect(() => {
    let isMounted = true;
    getActiveProjects()
      .then((data) => {
        if (!isMounted) return;
        setAvailableProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setAvailableProjects([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Inicializar selectedProjectId una vez que los proyectos están disponibles
  useEffect(() => {
    if (projectId == null) return;
    setSelectedProjectId((current) => current ?? projectId);
  }, [projectId]);

  // Inicializar selectedSprintId una vez que el contexto esté listo
  useEffect(() => {
    if (sprintId == null) return;
    setSelectedSprintId((current) => current ?? sharedSprintId ?? sprintId);
    if (sharedSprintId == null) {
      setSharedSprintId(sprintId);
      setSharedSprintName(sprintName);
    }
  }, [sprintId]);

  useEffect(() => {
    if (effectiveProjectId == null) return;
    let isMounted = true;
    setAvailableSprints([]);
    getSprintsByProject(effectiveProjectId)
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : [];

        const normalized = filterSelectableSprints(list).map((s) => ({
          ...s,
          id: s.idSprint ?? s.id,
        }));
        setAvailableSprints(normalized);
        setSelectedSprintId((current) => {
          if (normalized.length === 0) return null;
          return getSelectableSprintId(normalized, current);
        });
      })
      .catch(() => {
        if (isMounted) setAvailableSprints([]);
      });
    return () => {
      isMounted = false;
    };
  }, [effectiveProjectId]);

  useEffect(() => {
    if (!isProjectMenuOpen) return;

    function handlePointerDown(event) {
      if (!projectDropdownRef.current?.contains(event.target)) {
        setIsProjectMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setIsProjectMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProjectMenuOpen]);

  useEffect(() => {
    if (!isSprintMenuOpen) return;

    function handlePointerDown(event) {
      if (!sprintDropdownRef.current?.contains(event.target)) {
        setIsSprintMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setIsSprintMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSprintMenuOpen]);

  const selectedProjectName = useMemo(() => {
    const selected = availableProjects.find((p) => p.id === effectiveProjectId);
    return selected?.nombre || projectName;
  }, [availableProjects, effectiveProjectId, projectName]);

  const selectedSprintName = useMemo(() => {
    const selected = availableSprints.find((s) => s.id === effectiveSprintId);
    return selected?.nombre || sprintName;
  }, [availableSprints, effectiveSprintId, sprintName]);

  const { kpis, loading, error } = useKpis({
    userId,
    projectId: effectiveProjectId ?? projectId,
    sprintId: effectiveSprintId,
  });
  const { data: complianceByUser } = useTaskComplianceByUser(effectiveSprintId);
  const {
    data: precisionByUser,
    loading: precisionLoading,
    error: precisionError,
  } = usePrecisionEstimationByUser(effectiveSprintId);
  const { totalRealHours } = useRealHoursByUser(effectiveSprintId);
  const { kpisForCards, precisionValueFromChart, totalCompletedTasks } =
    useKpiCardValues({
      kpis,
      precisionByUser,
      precisionLoading,
      complianceByUser,
      sprintCompletedTasks,
    });

  if (contextLoading || loading) {
    return <div className={styles.container}>Cargando KPIs...</div>;
  }

  return (
    <MainLayout title="KPIs">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Indicadores Clave de Desempeño</h1>
          <p className={styles.intro}>
            Visualiza y analiza los KPI's de tus proyectos para ver el desempeño
            de tu equipo
          </p>
        </div>

        <div className={styles.selectors}>
          <div className={styles.selectorGroup}>
            <label className={styles.selectorLabel}>Proyecto</label>
            <span className={styles.sprintPicker} ref={projectDropdownRef}>
              <button
                type="button"
                className={styles.sprintButton}
                onClick={() => setIsProjectMenuOpen((open) => !open)}
                disabled={availableProjects.length === 0}
                aria-expanded={isProjectMenuOpen}
                aria-haspopup="listbox"
              >
                <span className={styles.sprintButtonLabel}>
                  {availableProjects.length === 0
                    ? "Cargando..."
                    : selectedProjectName}
                </span>
                <span
                  className={`${styles.sprintChevron} ${isProjectMenuOpen ? styles.sprintChevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isProjectMenuOpen && availableProjects.length > 0 && (
                <div
                  className={styles.sprintMenu}
                  role="listbox"
                  aria-label="Proyectos disponibles"
                >
                  {availableProjects.map((p) => {
                    const isSelected = p.id === effectiveProjectId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sprintOption} ${isSelected ? styles.sprintOptionSelected : ""}`}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setSelectedSprintId(null);
                          setIsProjectMenuOpen(false);
                        }}
                      >
                        <span className={styles.sprintOptionLabel}>
                          {p.nombre}
                        </span>
                        <span
                          className={styles.sprintOptionCheck}
                          aria-hidden="true"
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </span>
          </div>

          <div className={styles.selectorGroup}>
            <label className={styles.selectorLabel}>Sprint</label>
            <span className={styles.sprintPicker} ref={sprintDropdownRef}>
              <button
                type="button"
                className={styles.sprintButton}
                onClick={() => setIsSprintMenuOpen((open) => !open)}
                disabled={availableSprints.length === 0}
                aria-expanded={isSprintMenuOpen}
                aria-haspopup="listbox"
              >
                <span className={styles.sprintButtonLabel}>
                  {availableSprints.length === 0
                    ? "Cargando..."
                    : selectedSprintName}
                </span>
                <span
                  className={`${styles.sprintChevron} ${isSprintMenuOpen ? styles.sprintChevronOpen : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              {isSprintMenuOpen && availableSprints.length > 0 && (
                <div
                  className={styles.sprintMenu}
                  role="listbox"
                  aria-label="Sprints disponibles"
                >
                  {availableSprints.map((s) => {
                    const isSelected = s.id === effectiveSprintId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.sprintOption} ${isSelected ? styles.sprintOptionSelected : ""}`}
                        onClick={() => {
                          setSelectedSprintId(s.id);
                          setSharedSprintId(s.id);
                          setSharedSprintName(s.nombre);
                          setIsSprintMenuOpen(false);
                        }}
                      >
                        <span className={styles.sprintOptionLabel}>
                          {s.nombre}
                        </span>
                        <span
                          className={styles.sprintOptionCheck}
                          aria-hidden="true"
                        >
                          {isSelected ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </span>
          </div>
        </div>

        {contextError ? (
          <div className={styles.error}>{contextError}</div>
        ) : null}
        {error ? <div className={styles.error}>{error}</div> : null}

        {/* MAIN KPIs */}
        <div className={styles.kpiGrid}>
          {kpisForCards
            .filter(({ key }) => key !== "precision")
            .map(({ key: kpiKey, ...kpiProps }) => {
              const cardProps =
                kpiKey === "realHours"
                  ? {
                      ...kpiProps,
                      value: `${Math.round(totalRealHours)} horas por equipo`,
                    }
                  : kpiProps;

              return <KpiCard key={kpiKey} {...cardProps} />;
            })}
        </div>

        <div className={styles.charts}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h3>Tareas completadas por sprint</h3>
                <p className={styles.chartMeta}>
                  Tareas completadas por usuario en cada sprint
                </p>
              </div>
            </div>
            <TasksHistoryChart />
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <h3>Horas reales por sprint</h3>
                <p className={styles.chartMeta}>
                  Horas trabajadas por usuario en cada sprint
                </p>
              </div>
            </div>
            <RealHoursHistoryChart />
          </div>

          {kpis
            .filter((kpi) => kpi.key !== "compliance")
            .map((kpi) => (
              <div key={kpi.key} className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <div>
                    <h3>{kpi.title}</h3>
                    <p className={styles.chartMeta}>
                      {kpi.key === "duration"
                        ? "Comparativo de tiempo real del sprint vs tiempo planificado"
                        : kpi.key === "precision"
                          ? "Comparativo de horas estimadas vs horas reales por usuario en el sprint activo"
                          : kpi.key === "cycleTime"
                            ? "Total de tareas completadas por cada integrante en el sprint activo"
                            : kpi.hasHistory
                              ? `Histórico de ${kpi.chartData?.length ?? 0} mediciones`
                              : "Sin historial: mostrando valor actual"}
                    </p>
                  </div>
                  <span
                    className={`${styles.chartValue} ${kpi.key === "duration" ? styles.chartValueDuration : ""} ${
                      kpi.key === "duration" &&
                      /^0(?:\.0+)?%$/.test(String(kpi.value).trim())
                        ? styles.chartValueDurationZero
                        : ""
                    }`}
                  >
                    {kpi.key === "cycleTime"
                      ? `${totalCompletedTasks.toFixed(0)} tareas por equipo`
                      : kpi.key === "realHours"
                        ? `${Math.round(totalRealHours)} hrs por equipo`
                        : kpi.key === "precision"
                          ? precisionLoading
                            ? "..."
                            : (precisionValueFromChart ?? "Sin datos")
                          : kpi.value}
                  </span>
                </div>
                {kpi.key === "cycleTime" ? (
                  <TasksByUserChart data={complianceByUser} color={kpi.color} />
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
                      <PrecisionEstimationChart
                        data={precisionByUser}
                        color={kpi.color}
                      />
                    )}
                  </>
                ) : kpi.key === "duration" ? (
                  <SprintDurationChart
                    sprintId={effectiveSprintId}
                    color={kpi.color}
                  />
                ) : kpi.key === "realHours" ? (
                  <RealHoursByUser
                    sprintId={effectiveSprintId}
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
