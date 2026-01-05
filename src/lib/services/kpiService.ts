import { API_URL, API_HEADERS } from './api.config.js';
import { handleApiResponse } from './errorHandler.js';
import { getAuthToken } from './auth.service.js';

export interface KPISummary {
  totalReports: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalHours: number;
  totalMeetingHours: number;
  workingDays: number;
  leaveDays: number;
  productivityScore: number;
}

export interface KPIAverages {
  tasksPerDay: number;
  hoursPerDay: number;
  completionRatePerDay: number;
}

export interface DailyKPIData {
  date: string;
  tasks: number;
  hours: number;
  completed: number;
}

export interface TasksByStatus {
  DONE: number;
  IN_PROGRESS: number;
  WAITING: number;
  XL_BLOCK: number;
  TODO: number;
}

export interface UserKPIData {
  summary: KPISummary;
  averages: KPIAverages;
  tasksByStatus: TasksByStatus;
  dailyData: DailyKPIData[];
}

export interface TeamMemberKPI {
  userId: string;
  userName: string;
  squad: string;
  email: string;
  avatarUrl: string | null;
  summary: KPISummary;
  averages: KPIAverages;
  tasksByStatus: TasksByStatus;
  dailyData: DailyKPIData[];
}

export interface TeamKPIData {
  members: TeamMemberKPI[];
  average: KPISummary | null;
}

export interface KPIPeriod {
  startDate: string;
  endDate: string;
}

/**
 * Kullanıcının KPI verilerini getir
 */
export async function getUserKPIs(
  startDate?: string,
  endDate?: string,
  period: 'week' | 'month' | 'quarter' = 'month'
): Promise<{ data: UserKPIData; period: KPIPeriod }> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  params.append('period', period);

  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/kpi/user?${params.toString()}`, {
    method: 'GET',
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });

  return await handleApiResponse(response);
}

/**
 * Ekip KPI verilerini getir (Admin)
 */
export async function getTeamKPIs(
  squad?: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: TeamKPIData; period: KPIPeriod }> {
  const params = new URLSearchParams();
  if (squad) params.append('squad', squad);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const token = getAuthToken();
  const response = await fetch(`${API_URL}/api/kpi/team?${params.toString()}`, {
    method: 'GET',
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });

  return await handleApiResponse(response);
}

/**
 * Productivity score'a göre renk döndür
 */
export function getProductivityScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
}

/**
 * Productivity score'a göre emoji döndür
 */
export function getProductivityScoreEmoji(score: number): string {
  if (score >= 80) return '🚀';
  if (score >= 60) return '✨';
  if (score >= 40) return '💪';
  if (score >= 20) return '📈';
  return '⚠️';
}

/**
 * Task status'a göre Türkçe label döndür
 */
export function getTaskStatusLabel(status: keyof TasksByStatus): string {
  const labels: Record<keyof TasksByStatus, string> = {
    DONE: 'Tamamlandı',
    IN_PROGRESS: 'Devam Ediyor',
    WAITING: 'Beklemede',
    XL_BLOCK: 'Bloklu',
    TODO: 'Yapılacak',
  };
  return labels[status];
}

/**
 * Task status'a göre renk döndür
 */
export function getTaskStatusColor(status: keyof TasksByStatus): string {
  const colors: Record<keyof TasksByStatus, string> = {
    DONE: 'green',
    IN_PROGRESS: 'blue',
    WAITING: 'yellow',
    XL_BLOCK: 'red',
    TODO: 'gray',
  };
  return colors[status];
}
