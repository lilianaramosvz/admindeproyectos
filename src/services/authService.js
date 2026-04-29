const BASE_URL = "https://sammy-ulfh.dev";

export async function login(correo, password) {
  try {
    const url = `${BASE_URL}/api/v1/auth/login`;
    const body = JSON.stringify({ correo, password });

    console.log("Sending login:", { correo, password });
    console.log("[authService.login] URL usada:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      const message =
        data?.message || data?.error || `Error ${response.status}`;
      throw new Error(message);
    }

    const token =
      data?.token ||
      data?.accessToken ||
      data?.access_token ||
      data?.data?.token;
    if (!token) throw new Error("Respuesta inválida: falta token");

    return token;
  } catch (err) {
    throw err;
  }
}

export async function register(payload) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data?.message || data?.error || `Error ${res.status}`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function validateToken() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    const res = await fetch(`${BASE_URL}/api/v1/auth/validate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.ok;
  } catch (err) {
    return false;
  }
}

export default { login, register, validateToken };
