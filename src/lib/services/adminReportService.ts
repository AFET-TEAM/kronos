import { API_URL, API_HEADERS } from "./api.config.js";
import { getAuthToken } from "./auth.service.js";
import { handleApiResponse } from "./errorHandler.js";

export interface AdminReport {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  taskCount: number;
  totalHours: number;
  isReviewed: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    squad: string;
    department?: string;
  };
}

export interface AdminStats {
  totalReports: number;
  reviewedReports: number;
  pendingReports: number;
  totalUsers: number;
  totalTasks: number;
  totalHours: number;
}

export interface AdminReportParams {
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  search?: string;
  userId?: string;
  squad?: string;
  reviewed?: boolean;
}

export interface AdminReportResponse {
  reports: AdminReport[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReports: number;
    itemsPerPage: number;
  };
}

export async function getAdminReports(
  params: AdminReportParams = {}
): Promise<AdminReportResponse> {
  const { page = 1, limit = 10, sort = "desc", search = "", reviewed } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
    ...(search && { search }),
    ...(params.userId && { userId: params.userId }),
    ...(params.squad && { squad: params.squad }),
    ...(reviewed !== undefined && { reviewed: reviewed.toString() })
  });

  const response = await fetch(
    `${API_URL}/api/manager/reports?${queryParams}`,
    {
      method: "GET",
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  return await handleApiResponse<AdminReportResponse>(response);
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await fetch(`${API_URL}/api/manager/stats`, {
    method: "GET",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  const data = await handleApiResponse<any>(response);
  
  return {
    totalReports: data.totalReports || 0,
    reviewedReports: 0,
    pendingReports: 0,
    totalUsers: data.totalUsers || 0,
    totalTasks: data.totalTasks || 0,
    totalHours: 0
  };
}

export async function markReportAsReviewed(reportId: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/manager/reports/${reportId}/review`,
    {
      method: "PATCH",
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ isReviewed: true }),
    }
  );

  await handleApiResponse<void>(response);
}

export async function markReportAsUnreviewed(reportId: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/manager/reports/${reportId}/review`,
    {
      method: "PATCH",
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ isReviewed: false }),
    }
  );

  await handleApiResponse<void>(response);
}

export interface ReportDetail extends AdminReport {
  tasks: Array<{
    id?: string;
    description: string;
    hours: number;
    status: string;
    date?: string;
    project?: string;
  }>;
  totalOvertime?: number;
  notes?: string;
}

export async function getReportDetails(reportId: string): Promise<ReportDetail> {
  const response = await fetch(
    `${API_URL}/api/reports/${reportId}`,
    {
      method: "GET",
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  return await handleApiResponse<ReportDetail>(response);
}
