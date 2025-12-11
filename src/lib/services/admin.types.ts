export type UserRole = "user" | "manager" | "admin";

export type UserStatus = "active" | "inactive" | "suspended";

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title: string;
  squad: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  startDate: string;
  lastLogin: string;
  reportCount: number;
  createdAt: string;
};

export type SystemStats = {
  totalUsers: number;
  activeUsers: number;
  totalReports: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  avgReportsPerUser: number;
  totalTasks: number;
  completionRate: number;
};

export type RecentActivity = {
  id: string;
  type: "user_created" | "report_submitted" | "user_login" | "role_changed";
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  description: string;
  timestamp: string;
};

export type AdminReport = {
  id: string;
  title: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
  };
  startDate: string;
  endDate: string;
  taskCount: number;
  createdAt: string;
  status: "completed" | "in_progress";
};

export type UserWithReports = AdminUser & {
  recentReports: AdminReport[];
};

export type UpdateUserPayload = {
  role?: UserRole;
  status?: UserStatus;
  title?: string;
  squad?: string;
};
