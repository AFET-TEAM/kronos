/**
 * Organizasyon üyesi bilgileri
 */
export interface OrganizationMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position?: string;
  role: 'admin' | 'manager' | 'user';
  managerId?: string;
  managerName?: string;
  avatar?: string;
  phone?: string;
  hireDate?: string;
  isActive: boolean;
}

/**
 * Departman bilgileri
 */
export interface Department {
  department: string;
  members: OrganizationMember[];
  memberCount: number;
  managerCount: number;
}

/**
 * Organizasyon şeması
 */
export interface OrganizationChart {
  totalEmployees: number;
  totalDepartments: number;
  departments: Department[];
  lastUpdated: string;
}

/**
 * Hiyerarşik organizasyon yapısı
 */
export interface OrganizationHierarchy {
  manager: OrganizationMember;
  subordinates: OrganizationHierarchy[];
  directReportCount: number;
  totalReportCount: number;
}

/**
 * Departman istatistikleri
 */
export interface DepartmentStats {
  department: string;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  managers: number;
  users: number;
  avgTenure?: number;
  newestMember?: OrganizationMember;
  departments?: string[];
}

/**
 * Departman değişikliği request
 */
export interface UpdateDepartmentRequest {
  department: string;
}

/**
 * Yönetici değişikliği request
 */
export interface UpdateManagerRequest {
  managerId: string | null;
}

/**
 * Organizasyon özet bilgileri
 */
export interface OrganizationSummary {
  totalEmployees: number;
  totalDepartments: number;
  totalManagers: number;
  averageTeamSize: number;
  largestDepartment: string;
  smallestDepartment: string;
}
