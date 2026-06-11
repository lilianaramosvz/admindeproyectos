//frontend\src\hooks\useSprintDurationByUser.js
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

const isAdminUser = (user) => {
  const fullName = buildUserName(user);
  const normalizedName = String(fullName ?? "")
    .trim()
    .toLowerCase();

  if (normalizedName === "admin sistema" || normalizedName === "admin") {
    return true;
  }

  const roleValue =
    user?.id_rol ??
    user?.rol ??
    user?.role ??
    user?.idRol ??
    user?.tipoRol ??
    null;

  const normalizedRole = String(roleValue ?? "")
    .trim()
    .toLowerCase();

  return ["1", "admin", "administrator", "administrador"].includes(
    normalizedRole,
  );
};

const extractRealHours = (response) => {
  if (!response || typeof response !== "object") return null;

  const actualValue = response.actualValue;
  if (typeof actualValue === "number") {
    return actualValue;
  }

  return null;
};

const extractPlannedHours = (response) => {
  if (!response || typeof response !== "object") return null;

  const expectedValue = response.expectedValue;
  if (typeof expectedValue === "number") {
    return expectedValue;
  }

  return null;
};

export function useSprintDurationByUser(sprintId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadSprintDuration() {
      if (!Number.isFinite(sprintId)) {
        setData([]);
        setLoading(false);
        setError("No hay sprint activo para calcular duración por usuario.");
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

        const filteredUsers = users.filter((user) => !isAdminUser(user));

        const durationResults = await Promise.allSettled(
          filteredUsers.map((user) => getSprintDuration(user.id, sprintId)),
        );

        if (!isActive) return;

        const mapped = filteredUsers
          .map((user, index) => {
            const result = durationResults[index];
            if (result?.status !== "fulfilled" || !result.value) return null;

            const realHours = extractRealHours(result.value);
            const plannedHours = extractPlannedHours(result.value);
            if (realHours === null && plannedHours === null) return null;

            return {
              userId: user.id,
              label: buildUserName(user),
              realHours: realHours || 0,
              plannedHours: plannedHours || 0,
            };
          })
          .filter(Boolean)
          .sort((left, right) => right.realHours - left.realHours);

        setData(mapped);
        if (mapped.length === 0) {
          setError("No hay datos de duración del sprint por usuario.");
        }
      } catch {
        if (!isActive) return;
        setData([]);
        setError("No se pudo cargar la duración del sprint por usuario.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadSprintDuration();
    return () => {
      isActive = false;
    };
  }, [sprintId]);

  return { data, loading, error };
}
