//frontend\src\hooks\usePrecisionEstimationByUser.js
import { useEffect, useState } from "react";
import { getActiveUsers, getUserPrecisionEstimation } from "../services/api";

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

const ESTIMATED_FIELDS = [
  "actualValue",
  "targetValue",
  "plannedHours",
  "horasPlanificadas",
  "tiempoPlanificado",
  "planificado",
  "estimatedHours",
  "horasEstimadas",
  "tiempoEstimado",
  "estimatedTime",
  "estimado",
];

const REAL_FIELDS = [
  "expectedValue",
  "actualHours",
  "realHours",
  "horasReales",
  "tiempoReal",
  "currentValue",
  "actualTime",
  "real",
];

const DETAILS_FIELDS = [
  "calculationDetails",
  "calculoDetalles",
  "details",
  "detalle",
];

const STATUS_FIELDS = [
  "statusMessage",
  "statusMesagge",
  "message",
  "mensaje",
  "descripcion",
  "status",
];

const selectValueFromObject = (source, fields) => {
  if (!source || typeof source !== "object") return null;

  for (const field of fields) {
    if (source[field] !== undefined && source[field] !== null) {
      return source[field];
    }
  }

  return null;
};

const extractStatusMessage = (source) => {
  const rawStatus = selectValueFromObject(source, STATUS_FIELDS);
  if (rawStatus === null || rawStatus === undefined) return "";
  return String(rawStatus).trim();
};

const normalizeHoursByStatus = ({ estimatedHours, realHours, statusMessage }) => {
  if (!Number.isFinite(estimatedHours) || !Number.isFinite(realHours)) {
    return { estimatedHours, realHours };
  }

  const status = String(statusMessage ?? "").toLowerCase();
  const mentionsOverestimation = /sobreestima|sobreestimo|termina\s+antes/.test(
    status,
  );
  const mentionsUnderestimation = /subestima|subestimo|termina\s+despues|termina\s+después/.test(
    status,
  );

  if (mentionsOverestimation && estimatedHours < realHours) {
    return { estimatedHours: realHours, realHours: estimatedHours };
  }

  if (mentionsUnderestimation && estimatedHours > realHours) {
    return { estimatedHours: realHours, realHours: estimatedHours };
  }

  return { estimatedHours, realHours };
};

const extractEstimationHours = (response) => {
  const source = unwrapResponse(response);
  if (!source || typeof source !== "object") {
    return { estimatedHours: null, realHours: null };
  }

  const statusMessage = extractStatusMessage(source);

  const estimatedRaw = selectValueFromObject(source, ESTIMATED_FIELDS);
  const realRaw = selectValueFromObject(source, REAL_FIELDS);

  const estimatedHours = toNumber(estimatedRaw);
  const realHours = toNumber(realRaw);

  if (estimatedHours !== null && realHours !== null) {
    return normalizeHoursByStatus({
      estimatedHours,
      realHours,
      statusMessage,
    });
  }

  const details = selectValueFromObject(source, DETAILS_FIELDS);
  if (!details) {
    return { estimatedHours, realHours };
  }

  // Precision details come as "estimado / real".
  const pairMatch = String(details).match(
    /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/,
  );

  if (!pairMatch) {
    return { estimatedHours, realHours };
  }

  const parsedEstimated = toNumber(pairMatch[1]);
  const parsedReal = toNumber(pairMatch[2]);

  return normalizeHoursByStatus({
    estimatedHours: estimatedHours ?? parsedEstimated,
    realHours: realHours ?? parsedReal,
    statusMessage,
  });
};

const extractPrecisionPercent = (response) => {
  const source = unwrapResponse(response);
  if (!source || typeof source !== "object") return null;

  const precisionRaw =
    source.efficiencyPercentage ??
    source.efficiencypercentage ??
    source.precisionEstimacion ??
    source.precision ??
    source.value ??
    source.valor;

  const numericValue = toNumber(precisionRaw);
  if (numericValue === null) return null;
  return Math.abs(numericValue) <= 1 ? numericValue * 100 : numericValue;
};

const derivePrecision = (estimatedHours, realHours) => {
  if (
    !Number.isFinite(estimatedHours) ||
    !Number.isFinite(realHours) ||
    estimatedHours <= 0
  ) {
    return null;
  }

  const deviation = Math.abs(estimatedHours - realHours) / estimatedHours;
  return Math.max(0, (1 - deviation) * 100);
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

export function usePrecisionEstimationByUser(sprintId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadPrecisionByUser() {
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

        const precisionResults = await Promise.allSettled(
          users.map((user) => getUserPrecisionEstimation(user.id)),
        );

        if (!isActive) return;

        const mapped = users
          .map((user, index) => {
            const result = precisionResults[index];
            if (result?.status !== "fulfilled") return null;

            const { estimatedHours, realHours } = extractEstimationHours(
              result.value,
            );

            if (
              !Number.isFinite(estimatedHours) ||
              !Number.isFinite(realHours)
            ) {
              return null;
            }

            const precisionFromSnapshot = extractPrecisionPercent(result.value);
            const precision =
              precisionFromSnapshot ??
              derivePrecision(estimatedHours, realHours);

            return {
              userId: user.id,
              label: buildUserName(user),
              estimatedHours,
              realHours,
              precision,
            };
          })
          .filter(Boolean)
          .sort((left, right) => {
            const leftValue = Number(left?.precision);
            const rightValue = Number(right?.precision);
            if (Number.isFinite(leftValue) && Number.isFinite(rightValue)) {
              return rightValue - leftValue;
            }
            return String(left.label).localeCompare(String(right.label), "es");
          });

        setData(mapped);
        if (mapped.length === 0) {
          setError(
            "No hay datos de horas estimadas vs reales por usuario.",
          );
        }
      } catch {
        if (!isActive) return;
        setData([]);
        setError(
          "No se pudo cargar la comparación de horas por usuario.",
        );
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadPrecisionByUser();

    return () => {
      isActive = false;
    };
  }, [sprintId]);

  return { data, loading, error };
}
