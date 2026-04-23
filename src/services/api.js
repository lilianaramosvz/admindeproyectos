//frontend\src\services\api.js
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "https://sammy-ulfh.dev");

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${path}`);
  }

  return res.json();
}

async function getJsonWithFallback(paths) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await getJson(path);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No se pudo consultar la API.");
}

export function getUserPrecisionEstimation(userId) {
  return getJson(`/api/kpis/usuario/${userId}/precision-estimacion`);
}

export function getProjectHistory(projectId) {
  return getJson(`/api/kpis/proyecto/${projectId}/history`);
}

export function getSprintCompliance(userId, sprintId) {
  return getJson(`/api/kpis/usuario/${userId}/sprint/${sprintId}/cumplimiento`);
}

export function getSprintDuration(userId, sprintId) {
  return getJson(`/api/kpis/usuario/${userId}/sprint/${sprintId}/duracion`);
}

export function getProjectCycleTime(userId, projectId) {
  return getJson(
    `/api/kpis/usuario/${userId}/proyecto/${projectId}/tiempo-ciclo`,
  );
}

export function getUserKPIHistory(userId, sprintId, tipoKPI) {
  return getJson(
    `/api/kpis/usuario/${userId}/sprint/${sprintId}/history/tipo/${tipoKPI}`,
  );
}

export function getActiveUsers() {
  return getJson(`/api/kpis/usuarios/activos`);
}

export function getActiveProjects() {
  return getJson(`/api/kpis/proyectos/activos`);
}

export function getActiveSprints() {
  return getJson(`/api/kpis/sprints/activos`);
}
