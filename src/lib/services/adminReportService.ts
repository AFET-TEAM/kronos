import { API_URL, API_HEADERS } from "./api.config.js";
import { getAuthToken } from "./auth.service.js";

/**
 * Admin Report Service
 * 
 * Yöneticilerin tüm kullanıcıların raporlarını görüntülemesi ve yönetmesi için servis
 */

export interface AdminReport {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  taskCount: number;
  totalHours: number;
  isReviewed: boolean; // Yönetici tarafından incelendi mi?
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    squad: string;
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
  reviewed?: boolean; // true = incelenmiş, false = incelenmemiş, undefined = hepsi
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

/**
 * Tüm kullanıcıların raporlarını getir (Admin)
 * Backend Endpoint: GET /api/admin/reports
 */
export async function getAdminReports(
  params: AdminReportParams = {}
): Promise<AdminReportResponse> {
  const { page = 1, limit = 10, sort = "desc", search = "", reviewed } = params;

  // TODO: Backend hazır olduğunda bu kısmı uncomment et
  /*
  try {
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
      `${API_URL}/api/admin/reports?${queryParams}`,
      {
        method: "GET",
        headers: {
          ...API_HEADERS,
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Raporlar yüklenemedi");
    }

    return await response.json();
  } catch (error) {
    console.error("Admin reports fetch error:", error);
    throw error;
  }
  */

  // Mock data - Backend hazır olana kadar
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockReports: AdminReport[] = [
        {
          id: "1",
          title: "Haftalık Rapor - 18-22 Kasım 2025",
          startDate: "18.11.2025",
          endDate: "22.11.2025",
          createdAt: "2025-11-22T18:30:00",
          taskCount: 8,
          totalHours: 40,
          isReviewed: false,
          user: {
            id: "user-1",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            email: "ahmet.yilmaz@atmosware.turkcell.com.tr",
            squad: "Platform Team",
          },
        },
        {
          id: "2",
          title: "Haftalık Rapor - 18-22 Kasım 2025",
          startDate: "18.11.2025",
          endDate: "22.11.2025",
          createdAt: "2025-11-22T17:45:00",
          taskCount: 6,
          totalHours: 35,
          isReviewed: true,
          user: {
            id: "user-4",
            firstName: "Zeynep",
            lastName: "Arslan",
            email: "zeynep.arslan@atmosware.turkcell.com.tr",
            avatarUrl: "https://ui-avatars.com/api/?name=Zeynep+Arslan&background=f59e0b&color=fff",
            squad: "API Team",
          },
        },
        {
          id: "3",
          title: "Haftalık Rapor - 11-15 Kasım 2025",
          startDate: "11.11.2025",
          endDate: "15.11.2025",
          createdAt: "2025-11-15T19:00:00",
          taskCount: 10,
          totalHours: 42,
          isReviewed: true,
          user: {
            id: "user-3",
            firstName: "Mehmet",
            lastName: "Kaya",
            email: "mehmet.kaya@atmosware.turkcell.com.tr",
            squad: "Platform Team",
          },
        },
        {
          id: "4",
          title: "Haftalık Rapor - 11-15 Kasım 2025",
          startDate: "11.11.2025",
          endDate: "15.11.2025",
          createdAt: "2025-11-15T16:20:00",
          taskCount: 7,
          totalHours: 38,
          isReviewed: false,
          user: {
            id: "user-1",
            firstName: "Ahmet",
            lastName: "Yılmaz",
            email: "ahmet.yilmaz@atmosware.turkcell.com.tr",
            squad: "Platform Team",
          },
        },
        {
          id: "5",
          title: "Haftalık Rapor - 11-15 Kasım 2025",
          startDate: "11.11.2025",
          endDate: "15.11.2025",
          createdAt: "2025-11-15T18:30:00",
          taskCount: 9,
          totalHours: 41,
          isReviewed: true,
          user: {
            id: "user-2",
            firstName: "Ayşe",
            lastName: "Demir",
            email: "ayse.demir@atmosware.turkcell.com.tr",
            avatarUrl: "https://ui-avatars.com/api/?name=Ayse+Demir&background=ec4899&color=fff",
            squad: "UI/UX Team",
          },
        },
        {
          id: "6",
          title: "Haftalık Rapor - 4-8 Kasım 2025",
          startDate: "04.11.2025",
          endDate: "08.11.2025",
          createdAt: "2025-11-08T17:15:00",
          taskCount: 5,
          totalHours: 32,
          isReviewed: true,
          user: {
            id: "user-4",
            firstName: "Zeynep",
            lastName: "Arslan",
            email: "zeynep.arslan@atmosware.turkcell.com.tr",
            avatarUrl: "https://ui-avatars.com/api/?name=Zeynep+Arslan&background=f59e0b&color=fff",
            squad: "API Team",
          },
        },
        {
          id: "7",
          title: "Haftalık Rapor - 4-8 Kasım 2025",
          startDate: "04.11.2025",
          endDate: "08.11.2025",
          createdAt: "2025-11-08T19:45:00",
          taskCount: 11,
          totalHours: 45,
          isReviewed: false,
          user: {
            id: "user-5",
            firstName: "Can",
            lastName: "Öztürk",
            email: "can.ozturk@atmosware.turkcell.com.tr",
            squad: "UI/UX Team",
          },
        },
        {
          id: "8",
          title: "Haftalık Rapor - 28 Ekim - 1 Kasım 2025",
          startDate: "28.10.2025",
          endDate: "01.11.2025",
          createdAt: "2025-11-01T16:00:00",
          taskCount: 8,
          totalHours: 39,
          isReviewed: true,
          user: {
            id: "user-3",
            firstName: "Mehmet",
            lastName: "Kaya",
            email: "mehmet.kaya@atmosware.turkcell.com.tr",
            squad: "Platform Team",
          },
        },
      ];

      // Filtreleme
      let filteredReports = mockReports;

      if (reviewed !== undefined) {
        filteredReports = filteredReports.filter((r) => r.isReviewed === reviewed);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredReports = filteredReports.filter(
          (r) =>
            r.title.toLowerCase().includes(searchLower) ||
            r.user.firstName.toLowerCase().includes(searchLower) ||
            r.user.lastName.toLowerCase().includes(searchLower) ||
            r.user.squad.toLowerCase().includes(searchLower)
        );
      }

      if (params.squad) {
        filteredReports = filteredReports.filter((r) => r.user.squad === params.squad);
      }

      if (params.userId) {
        filteredReports = filteredReports.filter((r) => r.user.id === params.userId);
      }

      // Sıralama
      filteredReports.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sort === "desc" ? dateB - dateA : dateA - dateB;
      });

      // Pagination
      const totalReports = filteredReports.length;
      const totalPages = Math.ceil(totalReports / limit);
      const startIndex = (page - 1) * limit;
      const paginatedReports = filteredReports.slice(startIndex, startIndex + limit);

      resolve({
        reports: paginatedReports,
        pagination: {
          currentPage: page,
          totalPages,
          totalReports,
          itemsPerPage: limit,
        },
      });
    }, 300);
  });
}

/**
 * Admin istatistiklerini getir
 * Backend Endpoint: GET /api/admin/stats
 */
export async function getAdminStats(): Promise<AdminStats> {
  // TODO: Backend hazır olduğunda bu kısmı uncomment et
  /*
  try {
    const response = await fetch(`${API_URL}/api/admin/stats`, {
      method: "GET",
      headers: {
        ...API_HEADERS,
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("İstatistikler yüklenemedi");
    }

    return await response.json();
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    throw error;
  }
  */

  // Mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalReports: 48,
        reviewedReports: 32,
        pendingReports: 16,
        totalUsers: 12,
        totalTasks: 384,
        totalHours: 1920,
      });
    }, 200);
  });
}

/**
 * Raporu incelenmiş olarak işaretle
 * Backend Endpoint: PATCH /api/admin/reports/:reportId/review
 */
export async function markReportAsReviewed(reportId: string): Promise<void> {
  // TODO: Backend hazır olduğunda bu kısmı uncomment et
  /*
  try {
    const response = await fetch(
      `${API_URL}/api/admin/reports/${reportId}/review`,
      {
        method: "PATCH",
        headers: {
          ...API_HEADERS,
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ isReviewed: true }),
      }
    );

    if (!response.ok) {
      throw new Error("Rapor güncellenemedi");
    }
  } catch (error) {
    console.error("Mark report as reviewed error:", error);
    throw error;
  }
  */

  // Mock - Backend hazır olana kadar
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Rapor ${reportId} incelenmiş olarak işaretlendi`);
      resolve();
    }, 300);
  });
}

/**
 * Raporu incelenmemiş olarak işaretle
 * Backend Endpoint: PATCH /api/admin/reports/:reportId/review
 */
export async function markReportAsUnreviewed(reportId: string): Promise<void> {
  // TODO: Backend hazır olduğunda bu kısmı uncomment et
  /*
  try {
    const response = await fetch(
      `${API_URL}/api/admin/reports/${reportId}/review`,
      {
        method: "PATCH",
        headers: {
          ...API_HEADERS,
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ isReviewed: false }),
      }
    );

    if (!response.ok) {
      throw new Error("Rapor güncellenemedi");
    }
  } catch (error) {
    console.error("Mark report as unreviewed error:", error);
    throw error;
  }
  */

  // Mock - Backend hazır olana kadar
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Rapor ${reportId} incelenmemiş olarak işaretlendi`);
      resolve();
    }, 300);
  });
}

