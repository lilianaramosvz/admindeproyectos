// frontend/src/hooks/useBacklogTasks.js
import { useEffect, useState } from "react";
import { getActiveSprints, getTasksBySprint, getActiveUsers, getTasksByUser } from "../services/api";

const normalizePriority = (id) => {
  if (id === 1) return "low";
  if (id === 3) return "high";
  return "medium";
};

const buildAssigneeName = (user) => {
  if (!user) return "Equipo";
  return (
    [user.nombre, user.apellidoPaterno, user.apellidoMaterno]
      .filter(Boolean)
      .join(" ") || (user.name ?? user.email ?? "Equipo ")
  );
};

const getInitials = (name) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";

const normalizeTask = (task, sprintName, taskOwnerMap) => {
  if (!task || typeof task !== "object") return null;
  const owner = taskOwnerMap[task.idTarea];
  return {
    id: task.idTarea ? `TSK-${task.idTarea}` : "TSK-?",
    title: task.titulo ?? "Sin título",
    description: task.descripcion ?? null,
    priority: normalizePriority(task.idPrioridad),
    complexity: Math.min(Math.max(Number(task.complejidad) || 1, 1), 5),
    hours: task.tiempoEstimado != null ? `${task.tiempoEstimado}h` : "—",
    tiempoReal: task.tiempoReal ?? null,          
    fechaLimite: task.fechaLimite ?? null,        
    fechaFin: task.fechaFin ?? null,              
    assignee: owner?.initials ?? "Eq",
    name: owner?.name ?? "Equipo 44",
    sprint: sprintName,
  };
};

export function useBacklogTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);

        // 1. Sprints y usuarios en paralelo
        const [sprints, users] = await Promise.all([
          getActiveSprints(),
          getActiveUsers(),
        ]);

        if (!Array.isArray(sprints) || sprints.length === 0) {
          if (isActive) { setTasks([]); setLoading(false); }
          return;
        }

        // 2. Tareas por sprint y tareas por usuario en paralelo
        const [taskResults, userTaskResults] = await Promise.all([
          Promise.allSettled(sprints.map((s) => getTasksBySprint(s.id))),
          Promise.allSettled(
            (users ?? []).map((u) =>
              getTasksByUser(u.id).then((tasks) => ({ user: u, tasks: tasks ?? [] }))
            )
          ),
        ]);

        if (!isActive) return;

        // 3. Construir mapa idTarea -> propietario
        const taskOwnerMap = {};
        userTaskResults
          .filter((r) => r.status === "fulfilled")
          .forEach(({ value: { user, tasks } }) => {
            const name = buildAssigneeName(user);
            tasks.forEach((t) => {
              taskOwnerMap[t.idTarea] = { name, initials: getInitials(name) };
            });
          });

        // 4. Normalizar tareas
        const normalized = sprints.flatMap((sprint, index) => {
          const result = taskResults[index];
          if (result?.status !== "fulfilled" || !Array.isArray(result.value)) return [];
          const sprintName = sprint.nombre ?? sprint.name ?? `Sprint ${sprint.id}`;
          return result.value
            .map((task) => normalizeTask(task, sprintName, taskOwnerMap))
            .filter(Boolean);
        }).reverse(); // Mostrar las tareas del sprint más reciente primero

        setTasks(normalized);
        if (normalized.length === 0) {
          setError("No hay tareas en los sprints activos.");
        }
      } catch {
        if (!isActive) return;
        setTasks([]);
        setError("No se pudieron cargar las tareas del backlog.");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadTasks();
    return () => { isActive = false; };
  }, []);

  return { tasks, loading, error };
}