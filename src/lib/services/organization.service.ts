import { API_URL, API_HEADERS } from "./api.config.js";
import { getAuthToken } from "./auth.service.js";
import { handleApiResponse } from "./errorHandler.js";
import type {
  OrganizationChart,
  OrganizationHierarchy,
  OrganizationMember,
  DepartmentStats
} from "./organization.types.js";

export * from "./organization.types.js";

/**
 * Organizasyon şemasını getir
 * Tüm departmanlar ve üyelerini içerir
 */
export async function getOrganizationChart(): Promise<OrganizationChart> {
  const response = await fetch(`${API_URL}/api/manager/organization`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<OrganizationChart>(response);
}

/**
 * Belirli bir departmanın üyelerini getir
 */
export async function getDepartmentMembers(department: string): Promise<OrganizationMember[]> {
  const response = await fetch(`${API_URL}/api/manager/organization/departments/${encodeURIComponent(department)}`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<OrganizationMember[]>(response);
}

/**
 * Bir yöneticinin altındaki çalışanları getir (Hiyerarşi)
 */
export async function getManagerSubordinates(managerId: string): Promise<OrganizationHierarchy> {
  const response = await fetch(`${API_URL}/api/manager/organization/hierarchy/${managerId}`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<OrganizationHierarchy>(response);
}

/**
 * Tüm departmanları listele
 */
export async function getDepartments(): Promise<string[]> {
  const chart = await getOrganizationChart();
  return chart.departments.map(d => d.department);
}

/**
 * Departman istatistiklerini getir
 */
export async function getDepartmentStats(): Promise<DepartmentStats[]> {
  const response = await fetch(`${API_URL}/api/manager/organization/stats`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<DepartmentStats[]>(response);
}

/**
 * Kullanıcıyı başka bir departmana taşı
 */
export async function moveUserToDepartment(
  userId: string,
  department: string
): Promise<OrganizationMember> {
  const response = await fetch(`${API_URL}/api/manager/organization/users/${userId}/department`, {
    method: "PUT",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ department }),
  });

  return await handleApiResponse<OrganizationMember>(response);
}

/**
 * Kullanıcının yöneticisini değiştir
 */
export async function updateUserManager(
  userId: string,
  managerId: string | null
): Promise<OrganizationMember> {
  const response = await fetch(`${API_URL}/api/manager/organization/users/${userId}/manager`, {
    method: "PUT",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ managerId }),
  });

  return await handleApiResponse<OrganizationMember>(response);
}

/**
 * Organizasyon ağacını getir (tüm hiyerarşi)
 */
export async function getOrganizationTree(): Promise<OrganizationHierarchy[]> {
  const response = await fetch(`${API_URL}/api/manager/organization/tree`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<OrganizationHierarchy[]>(response);
}

/**
 * Departmandaki yöneticileri getir
 */
export async function getDepartmentManagers(department: string): Promise<OrganizationMember[]> {
  const members = await getDepartmentMembers(department);
  return members.filter(m => m.role === 'admin' || m.role === 'manager');
}

/**
 * Tüm yöneticileri listele
 */
export async function getAllManagers(): Promise<OrganizationMember[]> {
  const chart = await getOrganizationChart();
  const allMembers = chart.departments.flatMap(d => d.members);
  return allMembers.filter(m => m.role === 'admin' || m.role === 'manager');
}
