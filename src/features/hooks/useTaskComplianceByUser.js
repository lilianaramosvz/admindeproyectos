//frontend\src\features\hooks\useTaskComplianceByUser.js
import { useEffect, useState } from "react";
import { getActiveUsers, getSprintCompliance } from "../../services/api";

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
  if (numericValue === null) {
    return null;
  }

  return Math.abs(numericValue) <= 1 ? numericValue * 100 : numericValue;
};

const extractMetricValue = (response) => {
  const source = unwrapResponse(response);

  if (typeof source === "number" || typeof source === "string") {
    return normalizePercent(source);
  }

  if (!source || typeof source !== "object") {
    return null;
  }

  for (const field of COMPLIANCE_FIELDS) {
    if (source[field] !== undefined && source[field] !== null) {
      const normalizedValue = normalizePercent(source[field]);
      if (normalizedValue !== null) {
        return normalizedValue;
      }
    }
  }

  for (const value of Object.values(source)) {
    const normalizedValue = normalizePercent(value);
    if (normalizedValue !== null) {
      return normalizedValue;
    }
  }

  return null;
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

        if (!isActive) {
          return;
        }

        const mapped = users
          .map((user, index) => {
            const result = complianceResults[index];
            if (result?.status !== "fulfilled") {
              return null;
            }

            const complianceValue = extractMetricValue(result.value);
            if (complianceValue === null) {
              return null;
            }

            return {
              userId: user.id,
              label: buildUserName(user),
              value: complianceValue,
            };
          })
          .filter(Boolean)
          .sort((left, right) => right.value - left.value);

        setData(mapped);

        if (mapped.length === 0) {
          setError("No hay datos de cumplimiento de tareas por usuario.");
        }
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setData([]);
        setError("No se pudo cargar el cumplimiento de tareas por usuario.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadCompliance();

    return () => {
      isActive = false;
    };
  }, [sprintId]);

  return { data, loading, error };
}
