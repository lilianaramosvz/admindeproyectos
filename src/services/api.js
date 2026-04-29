//frontend\src\services\api.js
const BASE_URL = "https://sammy-ulfh.dev";

function getHeaders(additional = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...additional,
  };

  try {
    const token = localStorage.getItem("authToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch (e) {
  }

  return headers;
}

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${path}`);
  }

  return res.json();
}

async function getJsonOrNull(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
  });

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
  return getJsonOrNull(
    `/api/kpis/usuario/${userId}/sprint/${sprintId}/duracion`,
  );
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

async function postJson(path, body, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Error ${res.status}`);
  }

  return res.json();
}

export function loginUser(correo, password) {
  return postJson("/api/v1/auth/login", { correo, password });
}

export function validateToken(token) {
  return fetch(`${BASE_URL}/api/v1/auth/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => (res.ok ? res.json() : Promise.reject()));
}
