import { API_URL, API_HEADERS } from "./api.config.js";
import { getAuthToken } from "./auth.service.js";
import type { ReportDetails } from "./reportService.js";

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
 * Backend Endpoint: GET /api/archive/reports
 * Query Params: ?page=1&limit=10&sort=desc&search=...
 */
export async function getArchivedReports(
  params: ArchiveParams = {}
): Promise<ArchiveResponse> {
  const { page = 1, limit = 10, sort = "desc", search = "" } = params;

  // TODO: Backend hazır olduğunda bu kısmı uncomment et
  /*
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      ...(search && { search })
    });

    const response = await fetch(
      `${API_URL}/api/archive/reports?${queryParams}`,
      {
        method: "GET",
        headers: {
          ...API_HEADERS,
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Arşiv raporları yüklenemedi");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Archive reports fetch error:", error);
    throw error;
  }
  */

  // Mock data - Backend hazır olana kadar
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockReports = generateMockArchiveReports();

      // Arama filtresi
      let filteredReports = mockReports;
      if (search) {
        const query = search.toLowerCase();
        filteredReports = mockReports.filter(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.startDate.includes(query) ||
            r.endDate.includes(query)
        );
      }

      // Sıralama
      const sortedReports = [...filteredReports].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sort === "desc" ? dateB - dateA : dateA - dateB;
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedReports = sortedReports.slice(startIndex, endIndex);

      resolve({
        reports: paginatedReports,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(sortedReports.length / limit),
          totalReports: sortedReports.length,
          itemsPerPage: limit,
          hasMore: endIndex < sortedReports.length,
        },
      });
    }, 500);
  });
}

/**
 * Backend API'den arşiv istatistiklerini getirir
 * 
 * Backend Endpoint: GET /api/archive/stats
 */
export async function getArchiveStats(): Promise<ArchiveStats> {
  // TODO: Backend hazır olduğunda bu kısmı uncomment et
  /*
  try {
    const response = await fetch(`${API_URL}/api/archive/stats`, {
      method: "GET",
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Arşiv istatistikleri yüklenemedi");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Archive stats fetch error:", error);
    throw error;
  }
  */

  // Mock data - Backend hazır olana kadar
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockReports = generateMockArchiveReports();

      const stats: ArchiveStats = {
        totalReports: mockReports.length,
        totalTasks: mockReports.reduce((sum, r) => sum + r.taskCount, 0),
        totalHours: mockReports.reduce((sum, r) => sum + r.totalHours, 0),
      };

      stats.avgTasksPerReport =
        stats.totalReports > 0 ? stats.totalTasks / stats.totalReports : 0;
      stats.avgHoursPerReport =
        stats.totalReports > 0 ? stats.totalHours / stats.totalReports : 0;

      resolve(stats);
    }, 300);
  });
}

/**
 * Mock archive reports generator
 * Backend entegrasyonu sonrası silinecek
 */
function generateMockArchiveReports(): ArchiveReport[] {
  const reports: ArchiveReport[] = [];
  const currentDate = new Date();

  // Son 6 ayın raporlarını oluştur (24 hafta)
  for (let i = 0; i < 24; i++) {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Pazartesi-Cuma

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    // Son 2 haftalık raporlar "recent" olarak işaretleniyor
    const status = i < 2 ? "recent" : "archived";

    reports.push({
      id: `report-${i + 1}`,
      title: "Haftalık Rapor",
      startDate: formatDate(weekStart),
      endDate: formatDate(weekEnd),
      createdAt: weekEnd.toISOString(),
      taskCount: Math.floor(Math.random() * 15) + 5,
      totalHours: Math.floor(Math.random() * 30) + 10,
      status,
    });
  }

  return reports;
}

/**
 * Export için tüm servisleri dışa aktar
 */
export { getReportDetails } from "./reportService.js";
