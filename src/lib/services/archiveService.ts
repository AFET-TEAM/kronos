import { API_URL, API_HEADERS } from "./api.config.js";
import { getAuthToken } from "./auth.service.js";
import type { ReportDetails } from "./reportService.js";
import { handleApiResponse } from "./errorHandler.js";

/**
 * Archive Service
 * 
 * Bu servis, Archive sayfası için backend API entegrasyonunu sağlar.
 * Şu an mock data kullanıyor, backend hazır olduğunda
 * sadece bu dosyadaki fonksiyonları güncellemek yeterli.
 */

export interface ArchiveReport {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  taskCount: number;
  totalHours: number;
  status: "recent" | "archived";
}

export interface ArchiveStats {
  totalReports: number;
  totalTasks: number;
  totalHours: number;
  avgTasksPerReport?: number;
  avgHoursPerReport?: number;
}

export interface WeekGroup {
  weekNumber: number;
  weekLabel: string;
  reports: ArchiveReport[];
}

export interface MonthGroup {
  monthNumber: number;
  monthLabel: string;
  weeks: WeekGroup[];
}

export interface YearGroup {
  year: number;
  months: MonthGroup[];
}

export interface GroupedArchiveData {
  years: YearGroup[];
  stats: ArchiveStats;
}

export interface ArchivePagination {
  currentPage: number;
  totalPages: number;
  totalReports: number;
  itemsPerPage: number;
  hasMore: boolean;
}

export interface ArchiveParams {
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface ArchiveResponse {
  reports: ArchiveReport[];
  pagination: ArchivePagination;
}

/**
 * Backend API'den arşiv raporlarını getirir (pagination ile)
 * 
 * Backend Endpoint: GET /api/reports/archive/reports
 * Query Params: ?page=1&limit=10&sort=desc&search=...
 */
export async function getArchivedReports(
  params: ArchiveParams = {}
): Promise<ArchiveResponse> {
  const { page = 1, limit = 10, sort = "desc", search = "", startDate, endDate } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
    ...(search && { search }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate })
  });

  const response = await fetch(
    `${API_URL}/api/reports/archive/reports?${queryParams}`,
    {
      method: "GET",
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  return await handleApiResponse<ArchiveResponse>(response);
}

/**
 * Backend API'den arşiv istatistiklerini getirir
 * 
 * Backend Endpoint: GET /api/reports/archive/stats
 */
export async function getArchiveStats(): Promise<ArchiveStats> {
  const response = await fetch(`${API_URL}/api/reports/archive/stats`, {
    method: "GET",
    headers: {
      ...API_HEADERS,
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  return await handleApiResponse<ArchiveStats>(response);
}

/**
 * Export için tüm servisleri dışa aktar
 */
export { getReportDetails } from "./reportService.js";

/**
 * Arşiv raporlarını yıl > ay > hafta kırılımlarına göre grupla
 * Backend Endpoint: GET /api/reports/archive/reports
 */
export async function getGroupedArchiveReports(
  search: string = ""
): Promise<GroupedArchiveData> {
  // Tüm raporları çek (limit=1000 ile)
  const response = await getArchivedReports({ 
    page: 1, 
    limit: 1000, 
    sort: "desc",
    search 
  });

  const filteredReports = response.reports;

  // Yıl > Ay > Hafta gruplandırması
  const yearMap = new Map<number, Map<number, Map<number, ArchiveReport[]>>>();

  filteredReports.forEach((report) => {
    // endDate'i parse et (DD.MM.YYYY formatında)
    const [day, month, year] = report.endDate.split('.');
    const reportDate = new Date(
      parseInt(year),
      parseInt(month) - 1, // JavaScript months are 0-based
      parseInt(day)
    );
    
    const reportYear = reportDate.getFullYear();
    const reportMonth = reportDate.getMonth() + 1; // 1-12
    const weekOfMonth = getWeekOfMonth(reportDate);

    if (!yearMap.has(reportYear)) {
      yearMap.set(reportYear, new Map());
    }

    const monthMap = yearMap.get(reportYear)!;
    if (!monthMap.has(reportMonth)) {
      monthMap.set(reportMonth, new Map());
    }

    const weekMap = monthMap.get(reportMonth)!;
    if (!weekMap.has(weekOfMonth)) {
      weekMap.set(weekOfMonth, []);
    }

    weekMap.get(weekOfMonth)!.push(report);
  });

  // Map'leri YearGroup yapısına dönüştür
  const years: YearGroup[] = [];

  Array.from(yearMap.entries())
    .sort(([a], [b]) => b - a) // En yeni yıl önce
    .forEach(([year, monthMap]) => {
      const months: MonthGroup[] = [];

      Array.from(monthMap.entries())
        .sort(([a], [b]) => b - a) // En yeni ay önce
        .forEach(([monthNum, weekMap]) => {
          const weeks: WeekGroup[] = [];

          Array.from(weekMap.entries())
            .sort(([a], [b]) => b - a) // En yeni hafta önce
            .forEach(([weekNum, reports]) => {
              weeks.push({
                weekNumber: weekNum,
                weekLabel: `${weekNum}. Hafta`,
                reports: reports.sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                ),
              });
            });

          months.push({
            monthNumber: monthNum,
            monthLabel: getMonthName(monthNum),
            weeks,
          });
        });

      years.push({
        year,
        months,
      });
    });

  // İstatistikleri API'den çek
  const stats = await getArchiveStats();

  return {
    years,
    stats,
  };
}

/**
 * Tarihin ayın kaçıncı haftasında olduğunu hesapla
 */
function getWeekOfMonth(date: Date): number {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const firstDayWeekday = firstDayOfMonth.getDay();

  // İlk haftanın kaç gün olduğunu hesapla
  const firstWeekDays = 7 - firstDayWeekday;

  if (dayOfMonth <= firstWeekDays) {
    return 1;
  }

  return Math.ceil((dayOfMonth - firstWeekDays) / 7) + 1;
}

/**
 * Ay numarasını Türkçe ay adına çevir
 */
function getMonthName(monthNumber: number): string {
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  return months[monthNumber - 1] || "";
}
