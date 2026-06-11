import { useEffect, useState } from "react";
import { getTasksBySprint } from "../services/api";

export function useSprintCompletedTasks(sprintId) {
  const [completedTasks, setCompletedTasks] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(sprintId)) {
      setCompletedTasks(null);
      return;
    }

    let isActive = true;

    getTasksBySprint(sprintId)
      .then((data) => {
        if (!isActive) return;

        const tasks = Array.isArray(data) ? data : [];
        setCompletedTasks(tasks.filter((task) => task.idEstado === 3).length);
      })
      .catch(() => {
        if (isActive) setCompletedTasks(null);
      });

    return () => {
      isActive = false;
    };
  }, [sprintId]);

  return completedTasks;
}
