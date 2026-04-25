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

async function getJsonOrNull(path) {
  const res = await fetch(`${BASE_URL}${path}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${path}`);
  }

  return res.json();
}

export function getUserPrecisionEstimation(userId) {
  return getJsonOrNull(`/api/kpis/usuario/${userId}/precision-estimacion`);
}

export function getProjectHistory(projectId) {
  return getJson(`/api/kpis/proyecto/${projectId}/history`);
}

export function getSprintCompliance(userId, sprintId) {
  return getJsonOrNull(
    `/api/kpis/usuario/${userId}/sprint/${sprintId}/cumplimiento`,
  );
}

export function getSprintDuration(userId, sprintId) {
  return getJsonOrNull(`/api/kpis/usuario/${userId}/sprint/${sprintId}/duracion`);
}

export function getProjectCycleTime(userId, projectId) {
  return getJsonOrNull(
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
