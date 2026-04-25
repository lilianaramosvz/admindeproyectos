//frontend\src\hooks\useKpiContext.js
import { useEffect, useState } from "react";
import {
  getActiveProjects,
  getActiveSprints,
  getActiveUsers,
} from "../services/api";

const toNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getLatestSprint = (sprints) => {
  if (!Array.isArray(sprints) || sprints.length === 0) return null;

  return [...sprints].sort((left, right) => {
    const leftId = Number(left?.id);
    const rightId = Number(right?.id);

    if (Number.isFinite(leftId) && Number.isFinite(rightId)) {
      return rightId - leftId;
    }

    return 0;
  })[0];
};

export function useKpiContext() {
  const [context, setContext] = useState({
    userId: null,
    projectId: null,
    sprintId: null,
    userName: "",
    projectName: "",
    sprintName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContext() {
      try {
        setLoading(true);
        setError(null);

        const [users, projects, sprints] = await Promise.all([
          getActiveUsers(),
          getActiveProjects(),
          getActiveSprints(),
        ]);

        if (!isMounted) {
          return;
        }

        const selectedUserId =
          toNumberOrNull(import.meta.env.VITE_KPI_USER_ID) ??
          users?.[0]?.id ??
          null;
        const selectedProjectId =
          toNumberOrNull(import.meta.env.VITE_KPI_PROJECT_ID) ??
          projects?.[0]?.id ??
          null;
        const latestSprint = getLatestSprint(sprints);
        const selectedSprintId =
          toNumberOrNull(import.meta.env.VITE_KPI_SPRINT_ID) ??
          latestSprint?.id ??
          selectedProjectId;

        const selectedUser = users?.find((item) => item.id === selectedUserId);
        const selectedProject = projects?.find(
          (item) => item.id === selectedProjectId,
        );
        const selectedSprint = sprints?.find(
          (item) => item.id === selectedSprintId,
        );

        setContext({
          userId: selectedUserId,
          projectId: selectedProjectId,
          sprintId: selectedSprintId,
          userName: selectedUser?.nombre || "Usuario activo",
          projectName: selectedProject?.nombre || "Proyecto activo",
          sprintName: selectedSprint?.nombre || "Sprint activo",
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError("No se pudieron cargar usuarios/proyectos/sprints activos.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadContext();

    return () => {
      isMounted = false;
    };
  }, []);

  return { ...context, loading, error };
}
