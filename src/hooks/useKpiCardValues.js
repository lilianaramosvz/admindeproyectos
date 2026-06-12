//frontend\src\hooks\useKpiCardValues.js
import { useMemo } from "react";

export function useKpiCardValues({
  kpis,
  precisionByUser = [],
  precisionLoading,
  complianceByUser = [],
  realHoursByUser = [],
  tasksHistorySprints = [],
  hoursHistorySprints = [],
  sprintCompletedTasks = null,
}) {
  const median = (values) => {
    const sortedValues = values
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .sort((left, right) => left - right);

    if (sortedValues.length === 0) return 0;

    const middleIndex = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 1) {
      return sortedValues[middleIndex];
    }

    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  };

  const getTotalsByUser = (sprintRows = [], valueKey) => {
    if (!Array.isArray(sprintRows) || sprintRows.length === 0) {
      return [];
    }

    const userNames = sprintRows.reduce((names, row) => {
      Object.keys(row ?? {})
        .filter((key) => key !== "sprintName" && key !== "sprintId")
        .forEach((key) => names.add(key));
      return names;
    }, new Set());

    return Array.from(userNames).map((userName) => {
      const total = sprintRows.reduce((acc, row) => {
        const value = Number(row?.[userName]);
        return Number.isFinite(value) ? acc + value : acc;
      }, 0);

      return { userName, total: Number(total) };
    });
  };

  const precisionValueFromChart = useMemo(() => {
    if (!precisionByUser || precisionByUser.length === 0) {
      return null;
    }

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
    if (Number.isFinite(sprintCompletedTasks)) {
      return sprintCompletedTasks;
    }

    if (!complianceByUser || complianceByUser.length === 0) {
      return 0;
    }

    return complianceByUser.reduce((acc, item) => {
      const completed = Number(item?.completed);
      return Number.isFinite(completed) ? acc + completed : acc;
    }, 0);
  }, [complianceByUser, sprintCompletedTasks]);

  const tasksPerDevValues = useMemo(
    () => getTotalsByUser(tasksHistorySprints).map((item) => item.total),
    [tasksHistorySprints],
  );

  const hoursPerDevValues = useMemo(
    () => getTotalsByUser(hoursHistorySprints).map((item) => item.total),
    [hoursHistorySprints],
  );

  const averageTasksPerDev = useMemo(() => {
    if (tasksPerDevValues.length === 0) return 0;
    return (
      tasksPerDevValues.reduce((acc, value) => acc + value, 0) /
      tasksPerDevValues.length
    );
  }, [tasksPerDevValues]);

  const averageHoursPerDev = useMemo(() => {
    if (hoursPerDevValues.length === 0) return 0;
    return (
      hoursPerDevValues.reduce((acc, value) => acc + value, 0) /
      hoursPerDevValues.length
    );
  }, [hoursPerDevValues]);

  const medianTasksPerDev = useMemo(
    () => median(tasksPerDevValues),
    [tasksPerDevValues],
  );

  const medianHoursPerDev = useMemo(
    () => median(hoursPerDevValues),
    [hoursPerDevValues],
  );

  const kpisForCards = useMemo(() => {
    if (!kpis || kpis.length === 0) {
      return [];
    }

    return kpis
      .filter((kpi) => kpi.key !== "precision")
      .map((kpi) => {
        if (kpi.key === "cycleTime") {
          return {
            ...kpi,
            value: `${totalCompletedTasks.toFixed(0)} tareas`,
          };
        }

        return kpi;
      });
  }, [kpis, totalCompletedTasks]);

  const summaryCards = useMemo(
    () => [
      {
        key: "avgTasksPerDev",
        title: "Prom. Tareas/Dev",
        value: `${averageTasksPerDev.toFixed(1)} tareas`,
        color: "green",
      },
      {
        key: "avgHoursPerDev",
        title: "Prom. Horas/Dev",
        value: `${averageHoursPerDev.toFixed(1)} hrs`,
        color: "purple",
      },
      {
        key: "medianTasksPerDev",
        title: "Med. Tareas/Dev",
        value: `${medianTasksPerDev.toFixed(1)} tareas`,
        color: "blue",
      },
      {
        key: "medianHoursPerDev",
        title: "Med. Horas/Dev",
        value: `${medianHoursPerDev.toFixed(1)} hrs`,
        color: "orange",
      },
    ],
    [averageHoursPerDev, averageTasksPerDev, medianHoursPerDev, medianTasksPerDev],
  );

  return {
    kpisForCards,
    summaryCards,
    precisionValueFromChart,
    totalCompletedTasks,
  };
}
