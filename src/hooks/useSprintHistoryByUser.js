import { useEffect, useState } from "react";
import {
  getActiveSprints,
  getActiveUsers,
  getSprintCompliance,
  getSprintDuration,
} from "../services/api";

const COMPLETED_FIELDS = [
  "actualValue",
  "tareasCompletadas",
  "completedTasks",
  "completed",
  "completadas",
  "done",
  "tareasTerminadas",
  "finalizadas",
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

const extractField = (source, fields) => {
  if (!source || typeof source !== "object") return null;
  for (const field of fields) {
    if (source[field] !== undefined && source[field] !== null) {
      return source[field];
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

const toFirstName = (fullName) => {
  const text = String(fullName ?? "").trim();
  return text.split(/\s+/)[0] || text || "Usuario";
};

const extractRealHours = (response) => {
  const source = unwrapResponse(response);
  if (!source || typeof source !== "object") return 0;

  const value =
    source.actualValue ?? source.realHours ?? source.horasReales ?? source.value;

  const numericValue = toNumber(value);
  return numericValue !== null ? numericValue : 0;
};

const extractCompletedTasks = (response) => {
  const source = unwrapResponse(response);
  if (!source || typeof source !== "object") return 0;

  const directValue = toNumber(extractField(source, COMPLETED_FIELDS));
  if (directValue !== null) return Math.max(0, Math.round(directValue));

  const details = String(extractField(source, DETAILS_FIELDS) ?? "");
  const slashMatch = details.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (!slashMatch) return 0;

  const completed = toNumber(slashMatch[1]);
  return completed !== null ? Math.max(0, Math.round(completed)) : 0;
};

export function useSprintHistoryByUser(metric = "tasks") {
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setError(null);

        const [usersResponse, sprintsResponse] = await Promise.all([
          getActiveUsers(),
          getActiveSprints(),
        ]);

        const activeUsers = Array.isArray(usersResponse) ? usersResponse : [];
        const activeSprints = Array.isArray(sprintsResponse) ? sprintsResponse : [];

        if (!activeUsers.length || !activeSprints.length) {
          if (!isActive) return;
          setUsers([]);
          setSprints([]);
          setError("No hay datos históricos para mostrar.");
          return;
        }

        const normalizedUsers = activeUsers
          .map((user) => {
            const fullName = buildUserName(user);
            return {
              id: user?.id,
              label: fullName,
              firstName: toFirstName(fullName),
            };
          })
          .filter((user) => user.id !== undefined && user.id !== null)
          .filter((user) => user.label.trim() !== "Admin Sistema");

        if (!normalizedUsers.length) {
          if (!isActive) return;
          setUsers([]);
          setSprints([]);
          setError("No hay usuarios para mostrar.");
          return;
        }

        const sortedSprints = [...activeSprints].sort((left, right) => {
          const leftId = Number(left?.id);
          const rightId = Number(right?.id);
          if (Number.isFinite(leftId) && Number.isFinite(rightId)) {
            return leftId - rightId;
          }
          return String(left?.nombre ?? "").localeCompare(String(right?.nombre ?? ""));
        });

        const userHistory = await Promise.all(
          normalizedUsers.map(async (user) => {
            const perSprint = await Promise.all(
              sortedSprints.map(async (sprint) => {
                const sprintId = sprint?.id;
                const [durationResult, complianceResult] = await Promise.allSettled([
                  getSprintDuration(user.id, sprintId),
                  getSprintCompliance(user.id, sprintId),
                ]);

                const realHours =
                  durationResult.status === "fulfilled"
                    ? extractRealHours(durationResult.value)
                    : 0;

                const completedTasks =
                  complianceResult.status === "fulfilled"
                    ? extractCompletedTasks(complianceResult.value)
                    : 0;

                return {
                  sprintId,
                  realHours,
                  completedTasks,
                };
              }),
            );

            return { user, perSprint };
          }),
        );

        if (!isActive) return;

        const sprintRows = sortedSprints.map((sprint, sprintIndex) => {
          const sprintId = sprint?.id;
          const sprintName = sprint?.nombre || `Sprint ${sprintId}`;
          const row = {
            sprintName,
            sprintId,
          };

          userHistory.forEach(({ user, perSprint }) => {
            const historyPoint = perSprint[sprintIndex];
            const value =
              metric === "hours"
                ? Number(historyPoint?.realHours ?? 0)
                : Number(historyPoint?.completedTasks ?? 0);

            row[user.firstName] = Number.isFinite(value) ? value : 0;
          });

          return row;
        });

        setUsers(normalizedUsers.map((user) => user.firstName));
        setSprints(sprintRows);

        if (!sprintRows.length) {
          setError("No hay datos históricos para mostrar.");
        }
      } catch {
        if (!isActive) return;
        setUsers([]);
        setSprints([]);
        setError("No se pudo cargar el histórico por sprint.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      isActive = false;
    };
  }, [metric]);

  return { sprints, users, loading, error };
}
