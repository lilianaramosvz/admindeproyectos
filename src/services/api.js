//frontend\src\services\api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sammy-ulfh.dev";

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${path}`);
  }

  return res.json();
}

export function getUserWorkload(userId) {
  return getJson(`/api/kpis/usuario/${userId}/workload`);
}

export function getProjectEfficiency(projectId) {
  return getJson(`/api/kpis/proyecto/${projectId}/efficiency`);
}

export function getProjectDeadlineCompliance(projectId) {
  return getJson(`/api/kpis/proyecto/${projectId}/deadline-compliance`);
}

export function getProjectProductivity(projectId) {
  return getJson(`/api/kpis/proyecto/${projectId}/productivity`);
}
