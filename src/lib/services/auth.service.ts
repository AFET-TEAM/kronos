import { API_URL, API_HEADERS } from "./api.config.js";
import type { LoginResponse, LoginCredentials } from "./auth.types.js";
import { handleApiResponse } from "./errorHandler.js";

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(credentials),
  });

  return await handleApiResponse<LoginResponse>(response);
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
}): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify(data),
  });

  return await handleApiResponse<LoginResponse>(response);
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({ email }),
  });

  return await handleApiResponse<{ success: boolean; message: string }>(response);
}

export async function resetPassword(oobCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({ oobCode, newPassword }),
  });

  return await handleApiResponse<{ success: boolean; message: string }>(response);
}

export async function logout(): Promise<void> {
  // Önce backend'e logout isteği at (başarısız olsa bile devam et)
  try {
    const token = getAuthToken();
    
    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          ...API_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {
        // Backend hatası önemli değil, kullanıcıyı yine de çıkış yap
      });
    }
  } catch (error) {
    // Logout backend hatası sessizce yoksay
  }
  
  // Her durumda local storage ve cookie'leri temizle
  removeAuthToken();
  if (typeof window !== 'undefined') {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem("token", token);
    // Cookie olarak da sakla (server-side redirect için) - 7 gün
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("token");
  }
  return null;
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
