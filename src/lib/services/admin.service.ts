import { API_URL, API_HEADERS } from "./api.config.js";
import { getAuthToken } from "./auth.service.js";
import type { AdminUser, AdminStats, RecentActivity } from "./admin.types.js";
import { handleApiResponse } from "./errorHandler.js";

export * from "./admin.types.js";

/**
 * Kullanıcı listesini getir (Admin)
 */
export async function getUsers(): Promise<AdminUser[]> {
  const response = await fetch(`${API_URL}/api/manager/users`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<AdminUser[]>(response);
}

export const getAllUsers = getUsers;

export async function searchUsers(query: string): Promise<AdminUser[]> {
  const allUsers = await getUsers();
  if (!query) return allUsers;

  const lowerQuery = query.toLowerCase();
  return allUsers.filter(u =>
    u.firstName.toLowerCase().includes(lowerQuery) ||
    u.lastName.toLowerCase().includes(lowerQuery) ||
    u.email.toLowerCase().includes(lowerQuery)
  );
}

/**
 * ID'ye göre kullanıcı getir
 */
export async function getUserById(userId: string): Promise<AdminUser> {
  const response = await fetch(`${API_URL}/api/manager/users/${userId}`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<AdminUser>(response);
}

/**
 * Kullanıcı güncelle
 */
export async function updateUser(
  userId: string,
  data: Partial<AdminUser>
): Promise<AdminUser> {
  const response = await fetch(`${API_URL}/api/manager/users/${userId}`, {
    method: "PUT",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });

  const result = await handleApiResponse<{ user: AdminUser } | AdminUser>(response);
  return 'user' in result ? result.user : result;
}

/**
 * Kullanıcı sil
 */
export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/manager/users/${userId}`, {
    method: "DELETE",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  await handleApiResponse<void>(response);
}

/**
 * Kullanıcının departmanını güncelle
 */
export async function updateUserDepartment(
  userId: string,
  department: string
): Promise<AdminUser> {
  const response = await fetch(`${API_URL}/api/manager/users/${userId}/department`, {
    method: "PUT",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ department }),
  });

  const result = await handleApiResponse<{ user: AdminUser } | AdminUser>(response);
  return 'user' in result ? result.user : result;
}

/**
 * Admin Dashboard istatistikleri
 */
export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch(`${API_URL}/api/manager/stats`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  const data = await handleApiResponse<any>(response);

  return {
    totalUsers: data.totalUsers || 0,
    activeUsers: data.activeUsers || 0,
    totalReports: data.totalReports || 0,
    reportsThisWeek: data.reportsThisWeek || 0,
    reportsThisMonth: data.reportsThisMonth || 0,
    avgReportsPerUser: data.avgReportsPerUser || 0,
    totalTasks: data.totalTasks || 0,
    completionRate: data.completionRate || 0,
  };
}

/**
 * Son aktiviteleri getir
 */
export async function getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
  const response = await fetch(`${API_URL}/api/manager/activities/recent?limit=${limit}`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<RecentActivity[]>(response);
}

/**
 * Admin Dashboard KPI (Tüm kullanıcıların istatistikleri)
 */
export async function getAdminDashboardKPI(): Promise<{
  summary: {
    totalUsers: number;
    totalReports: number;
    avgCompletionRate: number;
    totalWorkHours: number;
  };
  users: Array<{
    userId: string;
    userName: string;
    email: string;
    avatarUrl: string | null;
    department: string;
    title: string;
    totalReports: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    totalWorkHours: number;
    totalOvertime: number;
  }>;
}> {
  const response = await fetch(`${API_URL}/api/manager/dashboard/kpi`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse(response);
}

/**
 * Admin'in yönettiği kullanıcıları getir
 */
export async function getManagedUsers(filters?: {
  department?: string;
  search?: string;
}): Promise<AdminUser[]> {
  let url = `${API_URL}/api/manager/users/managed`;
  
  if (filters?.department || filters?.search) {
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.search) params.append('search', filters.search);
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<AdminUser[]>(response);
}

/**
 * Kullanıcıyı admin'e ata
 */
export async function assignUserToAdmin(userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/manager/users/${userId}/assign`, {
    method: 'POST',
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  await handleApiResponse(response);
}

/**
 * Kullanıcıyı admin'den çıkar
 */
export async function unassignUserFromAdmin(userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/manager/users/${userId}/unassign`, {
    method: 'DELETE',
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  await handleApiResponse(response);
}

/**
 * Kullanıcıyı yöneticiye ata
 */
export async function assignUserToManager(userId: string, managerId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/manager/users/${userId}/assign`, {
    method: 'POST',
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ managerId }),
  });

  await handleApiResponse(response);
}

/**
 * Kullanıcıyı yöneticiden çıkar
 */
export async function unassignUserFromManager(userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/manager/users/${userId}/unassign`, {
    method: 'DELETE',
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  await handleApiResponse(response);
}

/**
 * Kullanıcıyı yöneticiden çıkar (alias)
 */
export async function removeUserFromManager(userId: string): Promise<void> {
  return unassignUserFromManager(userId);
}

/**
 * Organizasyon şemasını getir
 */
export async function getOrganizationChart(): Promise<Array<{
  department: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    title: string;
    avatarUrl: string | null;
    role: string;
    managerId: string | null;
  }>;
  count: number;
}>> {
  const response = await fetch(`${API_URL}/api/manager/organization`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse(response);
}


