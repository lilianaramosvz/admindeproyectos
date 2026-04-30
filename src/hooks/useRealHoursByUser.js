import { useEffect, useState } from "react";
import { getActiveUsers, getSprintDuration } from "../services/api";

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

// El endpoint getSprintDuration devuelve actualValue = horas reales
// igual que en useSprintDurationByUser
const extractRealHours = (response) => {
  if (!response || typeof response !== "object") return null;

  // Intentar múltiples campos por si el backend varía
  const value =
    response.actualValue ??
    response.realHours ??
    response.horasReales ??
    null;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
};

const isWorkerUser = (user) => {
  const roleValue =
    user?.id_rol ?? user?.rol ?? user?.role ?? user?.idRol ?? user?.tipoRol ?? null;

  if (Number(roleValue) === 2) {
    return true;
  }

  const normalizedRole = String(roleValue ?? "").trim().toLowerCase();
  if (["2", "worker", "developer", "desarrollador", "dev"].includes(normalizedRole)) {
    return true;
  }

  const userId = Number(user?.id);
  if (Number.isFinite(userId) && userId >= 1 && userId <= 4) {
    return true;
  }

  return false;
};

export function useRealHoursByUser(sprintId) {
  const [data, setData] = useState([]);
  const [totalRealHours, setTotalRealHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadRealHours() {
      if (!Number.isFinite(sprintId)) {
        setData([]);
        setTotalRealHours(0);
        setLoading(false);
        setError("No hay sprint activo para calcular horas reales por usuario.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const users = await getActiveUsers();

        if (!Array.isArray(users) || users.length === 0) {
          if (isActive) {
            setData([]);
            setTotalRealHours(0);
            setLoading(false);
          }
          return;
        }

        const workers = users.filter(isWorkerUser);

        if (workers.length === 0) {
          if (isActive) {
            setData([]);
            setTotalRealHours(0);
            setLoading(false);
            setError("No hay trabajadores disponibles.");
          }
          return;
        }

        const durationResults = await Promise.allSettled(
          workers.map((user) => getSprintDuration(user.id, sprintId)),
        );

        if (!isActive) return;

        const mapped = workers
          .map((user, index) => {
            const result = durationResults[index];
            if (result?.status !== "fulfilled" || !result.value) return null;

            const realHours = extractRealHours(result.value);
            if (realHours === null) return null;

            return {
              userId: user.id,
              label: buildUserName(user),
              realHours,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.realHours - a.realHours);

        setData(mapped);
        setTotalRealHours(mapped.reduce((acc, item) => acc + item.realHours, 0));

        if (mapped.length === 0) {
          setTotalRealHours(0);
          setError("No hay datos de horas reales por usuario en este sprint.");
        }
      } catch (err) {
        if (!isActive) return;
        setData([]);
        setTotalRealHours(0);
        setError("No se pudo cargar las horas reales por usuario.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadRealHours();
    return () => {
      isActive = false;
    };
  }, [sprintId]);

  return { data, totalRealHours, loading, error };
}