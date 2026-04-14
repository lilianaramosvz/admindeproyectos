//frontend\src\features\hooks\useKpis.js
import { useEffect, useState } from "react";
import {
  getProjectDeadlineCompliance,
  getProjectEfficiency,
  getProjectProductivity,
  getUserWorkload,
} from "../../services/api";

const toPercent = (value) => {
  const num = Number(value);
  if (Number.isFinite(num)) {
    return `${num.toFixed(1)}%`;
  }
  return "0%";
};

const messageOrDefault = (value, fallback) => value || fallback;

export function useKpis({ userId, projectId }) {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [workloadRes, efficiencyRes, deadlineRes, productivityRes] =
          await Promise.allSettled([
            getUserWorkload(userId),
            getProjectEfficiency(projectId),
            getProjectDeadlineCompliance(projectId),
            getProjectProductivity(projectId),
          ]);

        const workload =
          workloadRes.status === "fulfilled" ? workloadRes.value : null;
        const efficiency =
          efficiencyRes.status === "fulfilled" ? efficiencyRes.value : null;
        const deadline =
          deadlineRes.status === "fulfilled" ? deadlineRes.value : null;
        const productivity =
          productivityRes.status === "fulfilled" ? productivityRes.value : null;

        console.log("KPI Data Loaded:", {
          workload,
          efficiency,
          deadline,
          productivity,
        });

        const mapped = [
          {
            title: "Tiempo de ciclo por tarea",
            value: toPercent(productivity?.productivityPercentage),
            change: messageOrDefault(productivity?.statusMessage, "Sin datos"),
            color: "green",
          },
          {
            title: "Duración del sprint",
            value: toPercent(efficiency?.efficiencyPercentage),
            change: messageOrDefault(efficiency?.statusMessage, "Sin datos"),
            color: "blue",
          },
          {
            title: "Precisión de estimación de carga",
            value: toPercent(workload?.porcentajeCarga),
            change: workload
              ? `${workload.tareasCompletadas ?? 0} completadas / ${workload.tareasPendientes ?? 0} pendientes`
              : "Sin datos",
            color: "purple",
          },
          {
            title: "Cumplimiento de sprint",
            value: toPercent(deadline?.compliancePercentage),
            change: deadline
              ? `${deadline.delayedTasks ?? 0} retrasadas de ${deadline.totalTasks ?? 0}`
              : "Sin datos",
            color: "orange",
          },
        ];

        console.log("KPIs Mapped:", mapped);
        setKpis(mapped);

        if (
          [workloadRes, efficiencyRes, deadlineRes, productivityRes].some(
            (result) => result.status === "rejected",
          )
        ) {
          console.warn(
            "No se pudieron cargar todos los KPI. Se muestran los datos disponibles.",
          );
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los KPI.");
        setKpis([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId, userId]);

  return { kpis, loading, error };
}
