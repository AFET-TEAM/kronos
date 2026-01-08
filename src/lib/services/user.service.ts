import { API_URL, API_HEADERS } from "./api.config.js";
import { getAuthToken } from "./auth.service.js";
import { handleApiResponse } from "./errorHandler.js";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  squad?: string;
  department?: string;
  avatarUrl?: string;
  role: string;
  startDate?: string;
  projects?: string[];
  trainings?: string[];
  awards?: string[];
  certifications?: string[];
}

export interface UpdateProfileData {
  title?: string;
  squad?: string;
  department?: string;
  avatarUrl?: string;
  startDate?: string;
  projects?: string[];
  trainings?: string[];
  awards?: string[];
  certifications?: string[];
}

/**
 * Kullanıcının kendi profilini getir
 */
export async function getMyProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<UserProfile>(response);
}

/**
 * Kullanıcının kendi profilini güncelle
 */
export async function updateMyProfile(data: UpdateProfileData): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/api/users/me`, {
    method: "PUT",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await handleApiResponse<{ user: UserProfile } | UserProfile>(response);
  return 'user' in result ? result.user : result;
}

/**
 * Avatar yükle (Base64)
 */
export async function uploadAvatar(base64Image: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/users/me/avatar`, {
    method: "POST",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ avatar: base64Image }),
  });

  const result = await handleApiResponse<{ avatarUrl: string }>(response);
  return result.avatarUrl;
}
