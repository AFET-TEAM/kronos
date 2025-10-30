import { API_URL, API_HEADERS } from "./api.config.js";
import type { LoginResponse, LoginCredentials } from "./auth.types.js";

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Giriş başarısız");
  }

  return data;
}

export function setAuthToken(token: string): void {
  localStorage.setItem("token", token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export function removeAuthToken(): void {
  localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
