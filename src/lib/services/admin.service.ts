import type {
  AdminUser,
  SystemStats,
  RecentActivity,
  AdminReport,
  UserWithReports,
  UpdateUserPayload,
} from "./admin.types.js";

export type {
  AdminUser,
  SystemStats,
  RecentActivity,
  AdminReport,
  UserWithReports,
  UpdateUserPayload,
};

// Mock data storage
function loadAdminData() {
  if (typeof window === "undefined") return getDefaultAdminData();

  try {
    const stored = localStorage.getItem("kronos_admin_data");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Admin data yüklenirken hata:", error);
  }

  return getDefaultAdminData();
}

function saveAdminData(data: any) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("kronos_admin_data", JSON.stringify(data));
  } catch (error) {
    console.error("Admin data kaydedilirken hata:", error);
  }
}

function getDefaultAdminData() {
  return {
    users: [
      {
        id: "user-1",
        email: "ahmet.yilmaz@atmosware.turkcell.com.tr",
        firstName: "Ahmet",
        lastName: "Yılmaz",
        title: "Senior Frontend Developer",
        squad: "Platform Team",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=4f46e5&color=fff",
        role: "admin" as const,
        status: "active" as const,
        startDate: "2024-01-15",
        lastLogin: "2025-10-30T10:30:00Z",
        reportCount: 42,
        createdAt: "2024-01-15T08:00:00Z",
      },
      {
        id: "user-2",
        email: "ayse.demir@atmosware.turkcell.com.tr",
        firstName: "Ayşe",
        lastName: "Demir",
        title: "Frontend Developer",
        squad: "UI/UX Team",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Ayse+Demir&background=ec4899&color=fff",
        role: "user" as const,
        status: "active" as const,
        startDate: "2024-03-10",
        lastLogin: "2025-10-29T16:45:00Z",
        reportCount: 28,
        createdAt: "2024-03-10T09:00:00Z",
      },
      {
        id: "user-3",
        email: "mehmet.kaya@atmosware.turkcell.com.tr",
        firstName: "Mehmet",
        lastName: "Kaya",
        title: "Team Lead",
        squad: "Platform Team",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Mehmet+Kaya&background=10b981&color=fff",
        role: "manager" as const,
        status: "active" as const,
        startDate: "2023-11-20",
        lastLogin: "2025-10-30T09:15:00Z",
        reportCount: 58,
        createdAt: "2023-11-20T08:00:00Z",
      },
      {
        id: "user-4",
        email: "zeynep.arslan@atmosware.turkcell.com.tr",
        firstName: "Zeynep",
        lastName: "Arslan",
        title: "Backend Developer",
        squad: "API Team",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Zeynep+Arslan&background=f59e0b&color=fff",
        role: "user" as const,
        status: "active" as const,
        startDate: "2024-05-12",
        lastLogin: "2025-10-30T08:00:00Z",
        reportCount: 35,
        createdAt: "2024-05-12T08:00:00Z",
      },
      {
        id: "user-5",
        email: "can.ozturk@atmosware.turkcell.com.tr",
        firstName: "Can",
        lastName: "Öztürk",
        title: "Junior Developer",
        squad: "UI/UX Team",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Can+Ozturk&background=6366f1&color=fff",
        role: "user" as const,
        status: "inactive" as const,
        startDate: "2024-08-01",
        lastLogin: "2025-10-15T17:30:00Z",
        reportCount: 12,
        createdAt: "2024-08-01T08:00:00Z",
      },
    ],
    activities: [
      {
        id: "act-1",
        type: "report_submitted" as const,
        user: {
          id: "user-2",
          firstName: "Ayşe",
          lastName: "Demir",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Ayse+Demir&background=ec4899&color=fff",
        },
        description: "Haftalık rapor gönderdi",
        timestamp: "2025-10-30T10:15:00Z",
      },
      {
        id: "act-2",
        type: "user_login" as const,
        user: {
          id: "user-1",
          firstName: "Ahmet",
          lastName: "Yılmaz",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=4f46e5&color=fff",
        },
        description: "Sisteme giriş yaptı",
        timestamp: "2025-10-30T10:30:00Z",
      },
      {
        id: "act-3",
        type: "role_changed" as const,
        user: {
          id: "user-3",
          firstName: "Mehmet",
          lastName: "Kaya",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Mehmet+Kaya&background=10b981&color=fff",
        },
        description: "Rolü 'manager' olarak güncellendi",
        timestamp: "2025-10-29T14:20:00Z",
      },
      {
        id: "act-4",
        type: "report_submitted" as const,
        user: {
          id: "user-4",
          firstName: "Zeynep",
          lastName: "Arslan",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Zeynep+Arslan&background=f59e0b&color=fff",
        },
        description: "Haftalık rapor gönderdi",
        timestamp: "2025-10-29T16:00:00Z",
      },
      {
        id: "act-5",
        type: "user_created" as const,
        user: {
          id: "user-5",
          firstName: "Can",
          lastName: "Öztürk",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Can+Ozturk&background=6366f1&color=fff",
        },
        description: "Sisteme yeni kullanıcı eklendi",
        timestamp: "2025-10-28T09:00:00Z",
      },
    ],
  };
}

let ADMIN_DATA = loadAdminData();

// System Statistics
export async function getSystemStats(): Promise<SystemStats> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = ADMIN_DATA.users;
      const activeUsers = users.filter(
        (u: AdminUser) => u.status === "active"
      ).length;
      const totalReports = users.reduce(
        (sum: number, u: AdminUser) => sum + u.reportCount,
        0
      );

      resolve({
        totalUsers: users.length,
        activeUsers: activeUsers,
        totalReports: totalReports,
        reportsThisWeek: 24,
        reportsThisMonth: 156,
        avgReportsPerUser: Math.round(totalReports / users.length),
        totalTasks: 487,
        completionRate: 87.5,
      });
    }, 300);
  });
}

// Get all users
export async function getAllUsers(): Promise<AdminUser[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ADMIN_DATA.users);
    }, 400);
  });
}

// Get user by ID
export async function getUserById(
  userId: string
): Promise<UserWithReports | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = ADMIN_DATA.users.find((u: AdminUser) => u.id === userId);
      if (!user) {
        resolve(null);
        return;
      }

      // Mock recent reports
      const recentReports: AdminReport[] = [
        {
          id: "report-1",
          title: "Haftalık Rapor",
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          startDate: "21.10.2024",
          endDate: "25.10.2024",
          taskCount: 12,
          createdAt: "2024-10-28T10:30:00Z",
          status: "completed",
        },
      ];

      resolve({
        ...user,
        recentReports,
      });
    }, 400);
  });
}

// Update user
export async function updateUser(
  userId: string,
  payload: UpdateUserPayload
): Promise<AdminUser> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = ADMIN_DATA.users.findIndex(
        (u: AdminUser) => u.id === userId
      );

      if (userIndex === -1) {
        reject(new Error("User not found"));
        return;
      }

      ADMIN_DATA.users[userIndex] = {
        ...ADMIN_DATA.users[userIndex],
        ...payload,
      };

      saveAdminData(ADMIN_DATA);

      // Add activity log if role changed
      if (payload.role) {
        ADMIN_DATA.activities.unshift({
          id: `act-${Date.now()}`,
          type: "role_changed",
          user: {
            id: ADMIN_DATA.users[userIndex].id,
            firstName: ADMIN_DATA.users[userIndex].firstName,
            lastName: ADMIN_DATA.users[userIndex].lastName,
            avatarUrl: ADMIN_DATA.users[userIndex].avatarUrl,
          },
          description: `Rolü '${payload.role}' olarak güncellendi`,
          timestamp: new Date().toISOString(),
        });
        saveAdminData(ADMIN_DATA);
      }

      resolve(ADMIN_DATA.users[userIndex]);
    }, 500);
  });
}

// Get recent activities
export async function getRecentActivities(): Promise<RecentActivity[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ADMIN_DATA.activities.slice(0, 10));
    }, 300);
  });
}

// Get all reports (admin view)
export async function getAllReports(): Promise<AdminReport[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockReports: AdminReport[] = ADMIN_DATA.users.flatMap(
        (user: AdminUser) =>
          Array.from({ length: 3 }, (_, index) => ({
            id: `report-${user.id}-${index}`,
            title: "Haftalık Rapor",
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              avatarUrl: user.avatarUrl,
            },
            startDate: "21.10.2024",
            endDate: "25.10.2024",
            taskCount: Math.floor(Math.random() * 15) + 5,
            createdAt: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed" as const,
          }))
      );

      resolve(
        mockReports.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      );
    }, 500);
  });
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = ADMIN_DATA.users.findIndex(
        (u: AdminUser) => u.id === userId
      );

      if (userIndex === -1) {
        reject(new Error("User not found"));
        return;
      }

      ADMIN_DATA.users.splice(userIndex, 1);
      saveAdminData(ADMIN_DATA);
      resolve();
    }, 400);
  });
}

// Search users
export async function searchUsers(query: string): Promise<AdminUser[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const filtered = ADMIN_DATA.users.filter(
        (user: AdminUser) =>
          user.firstName.toLowerCase().includes(lowerQuery) ||
          user.lastName.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery) ||
          user.title.toLowerCase().includes(lowerQuery) ||
          user.squad.toLowerCase().includes(lowerQuery)
      );
      resolve(filtered);
    }, 300);
  });
}
