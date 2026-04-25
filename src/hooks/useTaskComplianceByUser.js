//frontend\src\hooks\useTaskComplianceByUser.js
import { useEffect, useState } from "react";
import { getActiveUsers, getSprintCompliance } from "../services/api";

const COMPLIANCE_FIELDS = [
  "productivityPercentage",
  "compliancePercentage",
  "cumplimiento",
  "percentage",
  "valor",
  "value",
  "average",
  "promedio",
];

const COMPLETED_FIELDS = [
  "tareasCompletadas",
  "completedTasks",
  "completed",
  "completadas",
  "done",
  "tareasTerminadas",
  "finalizadas",
];

const ASSIGNED_FIELDS = [
  "tareasAsignadas",
  "assignedTasks",
  "assigned",
  "asignadas",
  "total",
  "totalTareas",
  "tareas",
];

const DETAILS_FIELDS = [
  "calculationDetails",
  "calculoDetalles",
  "details",
  "detalle",
];

const unwrapResponse = (response) => {
  if (response && typeof response === "object") {
    return response.data ?? response.result ?? response.payload ?? response;
  }
  return response;
};

const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizePercent = (value) => {
  const numericValue = toNumber(value);
  if (numericValue === null) return null;
  return Math.abs(numericValue) <= 1 ? numericValue * 100 : numericValue;
};

const extractField = (source, fields) => {
  if (!source || typeof source !== "object") return null;
  for (const field of fields) {
    if (source[field] !== undefined && source[field] !== null) {
      return source[field];
    }
  }
  return null;
};

const extractMetricValue = (response) => {
  const source = unwrapResponse(response);
  if (typeof source === "number" || typeof source === "string") {
    return normalizePercent(source);
  }
  if (!source || typeof source !== "object") return null;
  for (const field of COMPLIANCE_FIELDS) {
    if (source[field] !== undefined && source[field] !== null) {
      const normalizedValue = normalizePercent(source[field]);
      if (normalizedValue !== null) return normalizedValue;
    }
  }
  for (const value of Object.values(source)) {
    const normalizedValue = normalizePercent(value);
    if (normalizedValue !== null) return normalizedValue;
  }
  return null;
};

const extractTaskCounts = (response) => {
  const source = unwrapResponse(response);
  if (!source || typeof source !== "object")
    return { completed: null, assigned: null };

  const parseCountsFromDetails = (detailsText) => {
    const text = String(detailsText ?? "");
    if (!text) return { completed: null, assigned: null };

    // Examples: "9 / 9 tareas", "8/10 tasks"
    const slashMatch = text.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (slashMatch) {
      const completedValue = toNumber(slashMatch[1]);
      const assignedValue = toNumber(slashMatch[2]);

      if (
        completedValue !== null &&
        assignedValue !== null &&
        assignedValue >= completedValue
      ) {
        return {
          completed: Math.round(completedValue),
          assigned: Math.round(assignedValue),
        };
      }
    }

    return { completed: null, assigned: null };
  };

  const rawCompleted = extractField(source, COMPLETED_FIELDS);
  const rawAssigned = extractField(source, ASSIGNED_FIELDS);
  const rawDetails = extractField(source, DETAILS_FIELDS);

  const completed = toNumber(rawCompleted);
  const assigned = toNumber(rawAssigned);
  const parsedFromDetails = parseCountsFromDetails(rawDetails);

  if (
    parsedFromDetails.completed !== null &&
    parsedFromDetails.assigned !== null
  ) {
    return parsedFromDetails;
  }

  // If both are present and consistent, return them
  if (completed !== null && assigned !== null && assigned >= completed) {
    return { completed, assigned };
  }

  // Try to derive counts from percentage if one side is known
  const percent = extractMetricValue(response);
  if (completed !== null && percent !== null && percent > 0) {
    const derivedAssigned = Math.round((completed / percent) * 100);
    return { completed, assigned: derivedAssigned };
  }
  if (assigned !== null && percent !== null) {
    const derivedCompleted = Math.round((assigned * percent) / 100);
    return { completed: derivedCompleted, assigned };
  }

  return { completed: completed ?? null, assigned: assigned ?? null };
};

const buildUserName = (user) => {
  const fullName = [
    user?.nombre,
    user?.apellidoPaterno,
    user?.apellidoMaterno,
    user?.apellidos,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (
    fullName || user?.name || user?.email || `Usuario ${user?.id ?? ""}`.trim()
  );
};

export function useTaskComplianceByUser(sprintId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadCompliance() {
      if (!Number.isFinite(sprintId)) {
        setData([]);
        setLoading(false);
        setError(
          "No hay sprint activo para calcular cumplimiento por usuario.",
        );
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const users = await getActiveUsers();
        if (!Array.isArray(users) || users.length === 0) {
          if (isActive) {
            setData([]);
            setLoading(false);
          }
          return;
        }

        const complianceResults = await Promise.allSettled(
          users.map((user) => getSprintCompliance(user.id, sprintId)),
        );

        if (!isActive) return;

        const mapped = users
          .map((user, index) => {
            const result = complianceResults[index];
            if (result?.status !== "fulfilled") return null;

            const complianceValue = extractMetricValue(result.value);
            if (complianceValue === null) return null;

            const { completed, assigned } = extractTaskCounts(result.value);

            return {
              userId: user.id,
              label: buildUserName(user),
              value: complianceValue,
              // Task counts — may be null if the API doesn't return them
              completed,
              assigned,
            };
          })
          .filter(Boolean)
          .sort((left, right) => right.value - left.value);

        setData(mapped);
        if (mapped.length === 0) {
          setError("No hay datos de cumplimiento de tareas por usuario.");
        }
      } catch {
        if (!isActive) return;
        setData([]);
        setError("No se pudo cargar el cumplimiento de tareas por usuario.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadCompliance();
    return () => {
      isActive = false;
    };
  }, [sprintId]);

  return { data, loading, error };
}
