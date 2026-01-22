import { API_URL, API_HEADERS } from "./api.config.js";
import { getAuthToken } from "./auth.service.js";
import { handleApiResponse } from "./errorHandler.js";

export type DashboardStats = {
  reportsSent: number;
  tasksCompleted: number;
  avgCompletionRate: number;
  weeklySummary: WeeklyDay[];
  recentReports: RecentReport[];
};

export type WeeklyDay = {
  day: string;
  date: string;
  hasReport: boolean;
  taskCount: number;
};

export type RecentReport = {
  id: string;
  title: string;
  date: string;
  startDate: string;
  endDate: string;
  tasks: string[];
};

export type UserInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  title: string;
  squad: string;
};

export type DayTask = {
  taskName: string;
  taskNumber: string;
  estimatedHours: number;
  description: string;
  status?: "Analiz" | "Devam Ediyor" | "Tamamlandı" | "IN_PROGRESS" | "DONE" | "TODO";
};

export type Meeting = {
  name: string;
  duration: number; // Saat cinsinden
};

export type BackendMeeting = {
  meetName: string;
  estimatedHours: number;
  description: string;
};

export type DailyReport = {
  id?: string;
  day: string;
  date: string;
  tasks: DayTask[];
  blockers: string | string[];
  meetings: string | string[] | Meeting[];
  untrackedWork: string;
  isOnLeave?: boolean;
};

export type ReportDetails = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  user: UserInfo;
  dailyReports: DailyReport[];
  createdAt: string;
  originalId?: string; // Original report ID (for daily reports, this is the daily report ID)
};

// -- API CALLS --

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_URL}/api/reports/dashboard-stats`, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<DashboardStats>(response);
}

export async function getReportById(id: string): Promise<RecentReport | null> {
  try {
    const details = await getReportDetails(id);
    if (!details) return null;

    return {
      id: details.id,
      title: details.title,
      date: details.createdAt.split('T')[0], // Simplified date
      startDate: details.startDate,
      endDate: details.endDate,
      tasks: details.dailyReports.flatMap(d => d.tasks.map(t => t.taskName))
    };
  } catch (e) {
    return null;
  }
}

export async function getReportDetails(reportId: string): Promise<ReportDetails | null> {
  // Check if it's a daily report (starts with "daily-")
  const isDailyReport = reportId.startsWith('daily-');
  const endpoint = isDailyReport 
    ? `${API_URL}/api/reports/daily/${reportId}`
    : `${API_URL}/api/reports/${reportId}`;
  
  const response = await fetch(endpoint, {
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (response.status === 404) return null;
  
  const data = await handleApiResponse<any>(response);
  
  // If it's a daily report, transform it to match ReportDetails format
  if (isDailyReport) {
    // Keep original daily report ID for reference
    const originalDailyReportId = data.id;
    // Use weeklyReportId if available, otherwise use daily report ID
    const reportId = data.weeklyReportId || data.id;
    return {
      id: reportId, // Use weekly report ID for editing if available
      originalId: originalDailyReportId, // Keep original ID for reference
      title: `${data.user?.firstName || ''} ${data.user?.lastName || ''} - Günlük Rapor (${data.date})`.trim(),
      startDate: data.date,
      endDate: data.date,
      createdAt: data.createdAt || data.date,
      user: data.user || {
        id: data.userId || '',
        firstName: '',
        lastName: '',
        email: '',
        avatarUrl: '',
        title: '',
        squad: '',
      },
      dailyReports: [{
        id: originalDailyReportId, // Keep daily report ID in dailyReports
        day: data.day,
        date: data.date,
        tasks: data.tasks || [],
        meetings: data.meetings || [],
        blockers: data.blockers || [],
        untrackedWork: data.untrackedWork || '',
        isOnLeave: data.isOnLeave || false,
      }],
    };
  }
  
  return data as ReportDetails;
}

export async function downloadReportPdf(reportId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/reports/pdf/${reportId}`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'PDF indirilemedi');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${reportId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function createWeeklyReport(
  startDate: string,
  endDate: string,
  dailyReports: DailyReport[]
): Promise<RecentReport> {
  // Daily reports'ları backend formatına çevir
  const formattedDailyReports = dailyReports.map(dayReport => {
    // Meetings'i backend formatına çevir
    const backendMeetings: BackendMeeting[] = Array.isArray(dayReport.meetings)
      ? dayReport.meetings.map((m: any) => ({
          meetName: m.name || m.meetName || "",
          estimatedHours: m.duration || m.estimatedHours || 0,
          description: m.description || ""
        }))
      : [];

    // Tasks'ları backend formatına çevir (status mapping)
    const backendTasks = dayReport.tasks.map(task => ({
      taskName: task.taskName,
      taskNumber: task.taskNumber,
      estimatedHours: task.estimatedHours,
      description: task.description,
      status: mapStatusToBackend(task.status || "Devam Ediyor")
    }));

    return {
      ...dayReport,
      tasks: backendTasks,
      meetings: backendMeetings,
      blockers: Array.isArray(dayReport.blockers) ? dayReport.blockers : (dayReport.blockers ? [dayReport.blockers] : [])
    };
  });

  const response = await fetch(`${API_URL}/api/reports`, {
    method: "POST",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dailyReports: formattedDailyReports
    }),
  });

  const result = await handleApiResponse<any>(response);

  return {
    id: result.id,
    title: result.title,
    date: result.createdAt,
    startDate: result.startDate,
    endDate: result.endDate,
    tasks: [] // Backend response might not return full tasks array in create response, adjusted as needed
  };
}

export async function updateWeeklyReport(
  reportId: string,
  startDate: string,
  endDate: string,
  dailyReports: DailyReport[]
): Promise<RecentReport> {
  // Daily reports'ları backend formatına çevir
  const formattedDailyReports = dailyReports.map(dayReport => {
    // Meetings'i backend formatına çevir
    const backendMeetings: BackendMeeting[] = Array.isArray(dayReport.meetings)
      ? dayReport.meetings.map((m: any) => ({
          meetName: m.name || m.meetName || "",
          estimatedHours: m.duration || m.estimatedHours || 0,
          description: m.description || ""
        }))
      : [];

    // Tasks'ları backend formatına çevir (status mapping)
    const backendTasks = dayReport.tasks.map(task => ({
      taskName: task.taskName,
      taskNumber: task.taskNumber,
      estimatedHours: task.estimatedHours,
      description: task.description,
      status: mapStatusToBackend(task.status || "Devam Ediyor")
    }));

    return {
      ...dayReport,
      tasks: backendTasks,
      meetings: backendMeetings,
      blockers: Array.isArray(dayReport.blockers) ? dayReport.blockers : (dayReport.blockers ? [dayReport.blockers] : [])
    };
  });

  const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
    method: "PUT",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dailyReports: formattedDailyReports
    }),
  });

  const result = await handleApiResponse<any>(response);

  return {
    id: result.report?.id || reportId,
    title: result.report?.title || "",
    date: result.report?.createdAt || "",
    startDate: result.report?.startDate || startDate,
    endDate: result.report?.endDate || endDate,
    tasks: []
  };
}

/**
 * Frontend status değerlerini backend enum değerlerine çevir
 */
function mapStatusToBackend(status: string): string {
  const statusMap: Record<string, string> = {
    "Analiz": "TODO",
    "Devam Ediyor": "IN_PROGRESS",
    "Tamamlandı": "DONE",
    "Beklemede": "WAITING",
    "Bloklu": "XL_BLOCK"
  };
  return statusMap[status] || "IN_PROGRESS";
}

/**
 * Günlük rapor oluştur
 */
export async function createDailyReport(
  date: string,
  dailyReport: DailyReport
): Promise<{ id: string; message: string }> {
  // Meetings'i backend formatına çevir
  const backendMeetings: BackendMeeting[] = Array.isArray(dailyReport.meetings)
    ? dailyReport.meetings.map((m: any) => ({
        meetName: m.name || m.meetName || "",
        estimatedHours: m.duration || m.estimatedHours || 0,
        description: m.description || ""
      }))
    : [];

  // Tasks'ları backend formatına çevir (status mapping)
  const backendTasks = dailyReport.tasks.map(task => ({
    ...task,
    status: mapStatusToBackend(task.status || "Devam Ediyor")
  }));

  const response = await fetch(`${API_URL}/api/reports/daily`, {
    method: "POST",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      date,
      day: dailyReport.day,
      tasks: backendTasks,
      blockers: dailyReport.blockers,
      meetings: backendMeetings,
      untrackedWork: dailyReport.untrackedWork,
      isOnLeave: dailyReport.isOnLeave
    }),
  });

  return await handleApiResponse<{ id: string; message: string }>(response);
}

/**
 * Günlük rapor güncelle
 */
export async function updateDailyReport(
  reportId: string,
  date: string,
  dailyReport: DailyReport
): Promise<{ message: string }> {
  // Meetings'i backend formatına çevir
  const backendMeetings: BackendMeeting[] = Array.isArray(dailyReport.meetings)
    ? dailyReport.meetings.map((m: any) => ({
        meetName: m.name || m.meetName || "",
        estimatedHours: m.duration || m.estimatedHours || 0,
        description: m.description || ""
      }))
    : [];

  // Tasks'ları backend formatına çevir (status mapping)
  const backendTasks = dailyReport.tasks.map(task => ({
    ...task,
    status: mapStatusToBackend(task.status || "Devam Ediyor")
  }));

  const response = await fetch(`${API_URL}/api/reports/daily/${reportId}`, {
    method: "PUT",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      date,
      day: dailyReport.day,
      tasks: backendTasks,
      blockers: dailyReport.blockers,
      meetings: backendMeetings,
      untrackedWork: dailyReport.untrackedWork,
      isOnLeave: dailyReport.isOnLeave
    }),
  });

  return await handleApiResponse<{ message: string }>(response);
}

/**
 * Tarih aralığındaki günlük raporları getir
 */
export async function getDailyReportsByDateRange(
  startDate: string,
  endDate: string
): Promise<DailyReport[]> {
  const response = await fetch(
    `${API_URL}/api/reports/daily-range/search?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    {
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  const result = await handleApiResponse<{ reports: DailyReport[] }>(response);
  return result.reports || [];
}

/**
 * Belirli bir tarih için günlük rapor getir
 */
export async function getDailyReportByDate(date: string): Promise<DailyReport | null> {
  // DD.MM.YYYY formatını kullan
  const reports = await getDailyReportsByDateRange(date, date);
  return reports.length > 0 ? reports[0] : null;
}
