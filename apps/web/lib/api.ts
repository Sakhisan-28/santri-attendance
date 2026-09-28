const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const TOKEN_KEY = "access_token";
const USERNAME_KEY = "username";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function logout(redirectTo = "/") {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  window.location.replace(redirectTo);
}

function handleUnauthorized(): never {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    window.location.replace("/");
  }
  throw new Error("Sesi berakhir, silakan login kembali");
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    handleUnauthorized();
  }
  if (!res.ok) {
    let message = `Request gagal (status ${res.status})`;
    try {
      const data: unknown = await res.json();
      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data
      ) {
        const raw = (data as { message: unknown }).message;
        message = Array.isArray(raw)
          ? raw.map(String).join(", ")
          : String(raw);
      }
    } catch {
      // biarkan message default
    }
    throw new Error(message);
  }
  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}
