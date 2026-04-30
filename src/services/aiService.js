//frontend\src\services\aiService.js
const AI_BASE =
  import.meta.env.VITE_AI_BASE_URL || import.meta.env.VITE_API_BASE_URL || "";

async function request(path, { body, queryParams } = {}) {
  const query = queryParams
    ? "?" + new URLSearchParams(queryParams).toString()
    : "";
  const url = `${AI_BASE.replace(/\/$/, "")}${path}${query}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} – ${text}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json"))
    return res.json().catch(() => ({}));
  const text = await res.text().catch(() => "");
  return text ? { message: text } : {};
}

/**
 * POST /ai/chat?userId=X&sprintId=Y  { message }
 */
export function chat(userId, sprintId, message) {
  return request("/api/ai/chat", {
    body: { message },
    queryParams: { userId, sprintId },
  });
}

/**
 * POST /ai/analyze-from-db   (sin body)
 */
export function analyzeFromDb() {
  return request("/api/ai/analyze-from-db");
}

/**
 * POST /ai/analyze-dashboard  { activeTasks, users }
 */
export function analyzeDashboard({ activeTasks = [], users = [] } = {}) {
  return request("/api/ai/analyze-dashboard", {
    body: { activeTasks, users },
  });
}

/**
 * GET /ai/health
 */
export async function healthCheck() {
  const res = await fetch(`${AI_BASE.replace(/\/$/, "")}/api/ai/health`);
  return res.ok;
}

export default { chat, analyzeFromDb, analyzeDashboard, healthCheck };
