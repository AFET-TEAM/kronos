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
  isWeekly?: boolean; // Haftalık rapor mu?
}

export interface DailyArchiveReport {
  date: string; // DD.MM.YYYY formatında
  day: string; // Gün adı (Pazartesi, Salı, vb.)
  reports: ArchiveReport[]; // Bu gün için tüm raporlar (haftalık raporlardan çıkanlar + standalone günlük raporlar)
  taskCount: number; // Bu günün toplam task sayısı
  totalHours: number; // Bu günün toplam saat sayısı
  isOnLeave?: boolean; // İzinli gün mü?
}

export interface ArchiveStats {
  totalReports: number;
  totalTasks: number;
  totalHours: number;
  avgTasksPerReport?: number;
  avgHoursPerReport?: number;
}

export interface DayGroup {
  date: string; // DD.MM.YYYY formatında
  day: string; // Gün adı
  report: DailyArchiveReport; // Bu gün için birleştirilmiş rapor
}

export interface WeekGroup {
  weekNumber: number;
  weekLabel: string;
  days: DayGroup[]; // Gün bazında gruplanmış raporlar
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
 * Arşiv raporlarını yıl > ay > hafta > gün kırılımlarına göre grupla
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

  const filteredReports = response.reports || [];

  // Debug: Log the number of reports received
  console.log(`[Archive] Received ${filteredReports.length} reports from backend`);

  if (filteredReports.length === 0) {
    console.warn(`[Archive] No reports found from backend`);
    const stats = await getArchiveStats();
    return {
      years: [],
      stats,
    };
  }

  // Haftalık raporları açıp günlük raporları çıkar
  const allDailyReports: Map<string, DailyArchiveReport> = new Map(); // Key: date (DD.MM.YYYY)

  // Önce tüm haftalık raporları işle
  const weeklyReportIds: string[] = [];
  filteredReports.forEach((report) => {
    // Haftalık rapor mu kontrol et (startDate ve endDate farklıysa haftalık rapor)
    const isWeekly = report.startDate && report.endDate && report.startDate !== report.endDate;
    if (isWeekly) {
      weeklyReportIds.push(report.id);
      console.log(`[Archive] Found weekly report: ${report.id} (${report.startDate} - ${report.endDate})`);
    } else {
      // Standalone günlük rapor - direkt ekle
      const date = report.endDate; // DD.MM.YYYY formatında
      if (!date) {
        console.warn(`[Archive] Report ${report.id} has no endDate, skipping`);
        return;
      }

      if (!allDailyReports.has(date)) {
        const [day, month, year] = date.split('.');
        if (!day || !month || !year) {
          console.warn(`[Archive] Invalid date format: ${date}, skipping`);
          return;
        }
        const reportDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (isNaN(reportDate.getTime())) {
          console.warn(`[Archive] Invalid date: ${date}, skipping`);
          return;
        }
        const dayName = getDayName(reportDate);
        
        allDailyReports.set(date, {
          date,
          day: dayName,
          reports: [],
          taskCount: 0,
          totalHours: 0,
        });
      }

      const dailyReport = allDailyReports.get(date)!;
      dailyReport.reports.push(report);
      dailyReport.taskCount += report.taskCount;
      dailyReport.totalHours += report.totalHours;
      console.log(`[Archive] Added standalone daily report for ${date}: ${report.taskCount} tasks, ${report.totalHours}h`);
    }
  });

  console.log(`[Archive] Found ${weeklyReportIds.length} weekly reports and ${allDailyReports.size} standalone daily reports`);

  // Haftalık raporların detaylarını çek ve günlük raporları çıkar
  const { getReportDetails } = await import("./reportService.js");
  
  console.log(`[Archive] Loading details for ${weeklyReportIds.length} weekly reports...`);
  
  for (const reportId of weeklyReportIds) {
    try {
      console.log(`[Archive] Loading weekly report details: ${reportId}`);
      const reportDetails = await getReportDetails(reportId);
      if (!reportDetails) {
        console.warn(`[Archive] Report details not found for ${reportId}`);
        continue;
      }
      if (!reportDetails.dailyReports || reportDetails.dailyReports.length === 0) {
        console.warn(`[Archive] Report ${reportId} has no daily reports`);
        continue;
      }

      console.log(`[Archive] Report ${reportId} has ${reportDetails.dailyReports.length} daily reports`);

      reportDetails.dailyReports.forEach((daily: any) => {
        const date = daily.date; // DD.MM.YYYY formatında
        if (!date) {
          console.warn(`[Archive] Daily report in ${reportId} has no date, skipping`);
          return;
        }

        if (!allDailyReports.has(date)) {
          allDailyReports.set(date, {
            date,
            day: daily.day || getDayNameFromDate(date),
            reports: [],
            taskCount: 0,
            totalHours: 0,
            isOnLeave: daily.isOnLeave || false,
          });
        }

        const dailyReport = allDailyReports.get(date)!;
        
        // Bu günlük raporu haftalık rapor olarak ekle
        const taskCount = daily.isOnLeave ? 0 : (daily.tasks || []).length;
        const totalHours = daily.isOnLeave ? 0 : calculateDailyHours(daily);
        
        dailyReport.reports.push({
          id: reportId,
          title: reportDetails.title,
          startDate: date,
          endDate: date,
          createdAt: reportDetails.createdAt,
          taskCount,
          totalHours,
          status: "archived" as const,
          isWeekly: true,
        });

        // İzinli günlerde task sayma
        if (!daily.isOnLeave) {
          dailyReport.taskCount += taskCount;
          dailyReport.totalHours += totalHours;
        }
        dailyReport.isOnLeave = daily.isOnLeave || false;
        
        console.log(`[Archive] Added daily report from weekly ${reportId} for ${date}: ${taskCount} tasks, ${totalHours}h`);
      });
    } catch (error) {
      console.error(`[Archive] Error loading weekly report ${reportId}:`, error);
    }
  }

  console.log(`[Archive] Total daily reports after processing: ${allDailyReports.size}`);

  // Gün bazında gruplama: Yıl > Ay > Hafta > Gün
  const yearMap = new Map<number, Map<number, Map<number, Map<string, DailyArchiveReport>>>>();

  if (allDailyReports.size === 0) {
    console.warn(`[Archive] No daily reports to group, returning empty result`);
    const stats = await getArchiveStats();
    return {
      years: [],
      stats,
    };
  }

  allDailyReports.forEach((dailyReport, date) => {
    try {
      const [day, month, year] = date.split('.');
      if (!day || !month || !year) return;

      const reportDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      if (isNaN(reportDate.getTime())) return;

      const reportYear = reportDate.getFullYear();
      const reportMonth = reportDate.getMonth() + 1;
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
        weekMap.set(weekOfMonth, new Map());
      }

      weekMap.get(weekOfMonth)!.set(date, dailyReport);
    } catch (error) {
      console.error(`[Archive] Error processing daily report ${date}:`, error);
    }
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
            .forEach(([weekNum, dayMap]) => {
              const days: DayGroup[] = Array.from(dayMap.entries())
                .sort(([a], [b]) => {
                  // Tarihe göre sırala
                  const [dayA, monthA, yearA] = a.split('.');
                  const [dayB, monthB, yearB] = b.split('.');
                  const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, parseInt(dayA));
                  const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, parseInt(dayB));
                  return dateB.getTime() - dateA.getTime(); // En yeni gün önce
                })
                .map(([date, report]) => ({
                  date,
                  day: report.day,
                  report,
                }));

              weeks.push({
                weekNumber: weekNum,
                weekLabel: `${weekNum}. Hafta`,
                days,
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
 * Günlük raporun toplam saatini hesapla
 */
function calculateDailyHours(daily: any): number {
  let total = 0;
  if (daily.tasks && Array.isArray(daily.tasks)) {
    total += daily.tasks.reduce(
      (sum: number, t: any) => sum + (Number(t.estimatedHours) || 0),
      0
    );
  }
  if (daily.meetings && Array.isArray(daily.meetings)) {
    total += daily.meetings.reduce(
      (sum: number, m: any) => sum + (Number(m.estimatedHours || m.duration) || 0),
      0
    );
  }
  return Math.round(total * 10) / 10;
}

/**
 * Date objesinden gün adını al
 */
function getDayName(date: Date): string {
  const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  return days[date.getDay()];
}

/**
 * Tarih string'inden gün adını al
 */
function getDayNameFromDate(dateStr: string): string {
  try {
    const [day, month, year] = dateStr.split('.');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return getDayName(date);
  } catch {
    return "";
  }
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
