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
  return data;
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

  const result = await response.json();
  return result;
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  return data;
}

export async function resetPassword(oobCode: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({ oobCode, newPassword }),
  });

  const data = await response.json();
  return data;
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
      }).catch(err => {
        // Backend hatası önemli değil, kullanıcıyı yine de çıkış yap
        console.warn('Backend logout başarısız oldu (normal):', err.message);
      });
    }
  } catch (error) {
    console.warn('Logout backend hatası (yok sayılıyor):', error);
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
    // Cookie olarak da sakla (server-side redirect için)
    document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;
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
