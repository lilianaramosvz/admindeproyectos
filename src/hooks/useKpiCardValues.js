//frontend\src\hooks\useKpiCardValues.js
import { useMemo } from "react";

export function useKpiCardValues({
  kpis,
  precisionByUser,
  precisionLoading,
  complianceByUser,
}) {
  const precisionValueFromChart = useMemo(() => {
    const validPrecisions = precisionByUser
      .map((item) => Number(item?.precision))
      .filter((value) => Number.isFinite(value));

    if (validPrecisions.length === 0) {
      return null;
    }

    const avgPrecision =
      validPrecisions.reduce((acc, value) => acc + value, 0) /
      validPrecisions.length;

    return `${avgPrecision.toFixed(1)}%`;
  }, [precisionByUser]);

  const totalCompletedTasks = useMemo(() => {
    return complianceByUser.reduce((acc, item) => {
      const completed = Number(item?.completed);
      return Number.isFinite(completed) ? acc + completed : acc;
    }, 0);
  }, [complianceByUser]);

  const kpisForCards = useMemo(() => {
    return kpis.map((kpi) => {
      if (kpi.key === "precision") {
        return {
          ...kpi,
          value: precisionLoading
            ? "..."
            : (precisionValueFromChart ?? "Sin datos"),
        };
      }

      if (kpi.key === "cycleTime") {
        return {
          ...kpi,
          value: `${totalCompletedTasks.toFixed(0)} tareas`,
        };
      }

      return kpi;
    });
  }, [kpis, precisionLoading, precisionValueFromChart, totalCompletedTasks]);

  return {
    kpisForCards,
    precisionValueFromChart,
    totalCompletedTasks,
  };
}
