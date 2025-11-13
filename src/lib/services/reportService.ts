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
};

export type DailyReport = {
  day: string;
  date: string;
  tasks: DayTask[];
  blockers: string;
  meetings: string;
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
};

function loadFromLocalStorage(): DashboardStats {
  if (typeof window === "undefined") {
    return getDefaultDashboardStats();
  }

  try {
    const stored = localStorage.getItem("kronos_dashboard_stats");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("LocalStorage'dan veri yüklenirken hata:", error);
  }

  return getDefaultDashboardStats();
}

function saveToLocalStorage(stats: DashboardStats) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("kronos_dashboard_stats", JSON.stringify(stats));
  } catch (error) {
    console.error("LocalStorage'a veri kaydedilirken hata:", error);
  }
}

function getDefaultDashboardStats(): DashboardStats {
  return {
    reportsSent: 42,
    tasksCompleted: 156,
    avgCompletionRate: 87.5,
    weeklySummary: [
      { day: "Pazartesi", date: "2025-10-27", hasReport: true, taskCount: 5 },
      { day: "Salı", date: "2025-10-28", hasReport: true, taskCount: 4 },
      { day: "Çarşamba", date: "2025-10-29", hasReport: false, taskCount: 0 },
      { day: "Perşembe", date: "2025-10-30", hasReport: false, taskCount: 0 },
      { day: "Cuma", date: "2025-10-31", hasReport: false, taskCount: 0 },
    ],
    recentReports: [
      {
        id: "1",
        title: "Haftalık Rapor",
        date: "2025-10-28",
        startDate: "21.10.2024",
        endDate: "25.10.2024",
        tasks: [
          "API entegrasyonu tamamlandı",
          "UI tasarımı güncellendi",
          "Test senaryoları yazıldı",
        ],
      },
      {
        id: "2",
        title: "Haftalık Rapor",
        date: "2025-10-21",
        startDate: "14.10.2024",
        endDate: "18.10.2024",
        tasks: [
          "Database migration",
          "Authentication sistemi",
          "Dashboard tasarımı",
        ],
      },
      {
        id: "3",
        title: "Haftalık Rapor",
        date: "2025-10-14",
        startDate: "07.10.2024",
        endDate: "11.10.2024",
        tasks: ["Bug fix #234", "Code review", "Dokümantasyon güncellendi"],
      },
    ],
  };
}

export const MOCK_DASHBOARD_STATS: DashboardStats = loadFromLocalStorage();

export async function getDashboardStats(): Promise<DashboardStats> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_DASHBOARD_STATS);
    }, 500);
  });
}

export async function getReportById(id: string): Promise<RecentReport | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const report = MOCK_DASHBOARD_STATS.recentReports.find(
        (r) => r.id === id
      );
      resolve(report || null);
    }, 300);
  });
}

function loadReportDetailsFromLocalStorage(): { [key: string]: ReportDetails } {
  if (typeof window === "undefined") {
    return getDefaultReportDetails();
  }

  try {
    const stored = localStorage.getItem("kronos_report_details");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("LocalStorage'dan rapor detayları yüklenirken hata:", error);
  }

  return getDefaultReportDetails();
}

function saveReportDetailsToLocalStorage(details: {
  [key: string]: ReportDetails;
}) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("kronos_report_details", JSON.stringify(details));
  } catch (error) {
    console.error("LocalStorage'a rapor detayları kaydedilirken hata:", error);
  }
}

function getDefaultReportDetails(): { [key: string]: ReportDetails } {
  return {
    "1": {
      id: "1",
      title: "Haftalık Rapor",
      startDate: "21.10.2024",
      endDate: "25.10.2024",
      createdAt: "2024-10-28T10:30:00Z",
      user: {
        id: "user-1",
        firstName: "Ahmet",
        lastName: "Yılmaz",
        email: "ahmet.yilmaz@atmosware.turkcell.com.tr",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=4f46e5&color=fff",
        title: "Senior Frontend Developer",
        squad: "Platform Team",
      },
      dailyReports: [
        {
          day: "Pazartesi",
          date: "21.10.2024",
          tasks: [
            {
              taskName: "Login Sayfası Geliştirme",
              taskNumber: "KRON-123",
              estimatedHours: 4,
              description:
                "Firebase Authentication entegrasyonu tamamlandı. Email/password login akışı implement edildi.",
            },
            {
              taskName: "Header Component",
              taskNumber: "KRON-124",
              estimatedHours: 3,
              description:
                "Responsive header component oluşturuldu. Dark mode desteği eklendi.",
            },
          ],
          blockers:
            "Firebase config dosyası environment variable'lara taşınması gerekiyor.",
          meetings: "Daily Standup (15dk), Sprint Planning (1 saat)",
          untrackedWork:
            "Yeni geliştiricinin onboarding sürecinde yardımcı olundu (1 saat).",
        },
        {
          day: "Salı",
          date: "22.10.2024",
          tasks: [
            {
              taskName: "Dashboard Layout",
              taskNumber: "KRON-125",
              estimatedHours: 5,
              description:
                "Ana dashboard layout'u oluşturuldu. Sidebar ve main content area implement edildi.",
            },
            {
              taskName: "State Management",
              taskNumber: "KRON-126",
              estimatedHours: 2,
              description:
                "Svelte stores ile global state yönetimi kuruldu (theme, user, auth).",
            },
          ],
          blockers: "Herhangi bir blokaj yok.",
          meetings: "Daily Standup (15dk), Tech Design Review (45dk)",
          untrackedWork:
            "Production bug fix (#234) acil olarak çözüldü (45dk).",
        },
        {
          day: "Çarşamba",
          date: "23.10.2024",
          tasks: [
            {
              taskName: "Report Service Implementation",
              taskNumber: "KRON-127",
              estimatedHours: 4,
              description:
                "Mock report service oluşturuldu. API integration için hazırlık yapıldı.",
            },
            {
              taskName: "Statistics Cards",
              taskNumber: "KRON-128",
              estimatedHours: 3,
              description:
                "Dashboard için istatistik kartları component'i geliştirildi.",
            },
          ],
          blockers:
            "Backend API henüz hazır değil, mock data ile devam ediliyor.",
          meetings: "Daily Standup (15dk), Grooming Session (1.5 saat)",
          untrackedWork: "",
        },
        {
          day: "Perşembe",
          date: "24.10.2024",
          tasks: [
            {
              taskName: "Weekly Calendar Component",
              taskNumber: "KRON-129",
              estimatedHours: 5,
              description:
                "Haftalık takvim görünümü implement edildi. Her gün için rapor durumu gösterimi eklendi.",
            },
            {
              taskName: "Unit Tests",
              taskNumber: "KRON-130",
              estimatedHours: 2,
              description: "Core component'ler için unit test'ler yazıldı.",
            },
          ],
          blockers: "",
          meetings: "Daily Standup (15dk), Team Retrospective (1 saat)",
          untrackedWork: "Code review yapıldı (1 saat).",
        },
        {
          day: "Cuma",
          date: "25.10.2024",
          tasks: [
            {
              taskName: "Accessibility Improvements",
              taskNumber: "KRON-131",
              estimatedHours: 3,
              description:
                "WCAG AA standardına uyum için accessibility iyileştirmeleri yapıldı. ARIA etiketleri eklendi.",
            },
            {
              taskName: "Documentation",
              taskNumber: "KRON-132",
              estimatedHours: 2,
              description:
                "Component kullanım dokümantasyonu yazıldı. README güncellendi.",
            },
          ],
          blockers: "",
          meetings: "Daily Standup (15dk), Sprint Review (1.5 saat)",
          untrackedWork: "Haftalık rapor hazırlandı (30dk).",
        },
      ],
    },
    "2": {
      id: "2",
      title: "Haftalık Rapor",
      startDate: "14.10.2024",
      endDate: "18.10.2024",
      createdAt: "2024-10-21T09:00:00Z",
      user: {
        id: "user-1",
        firstName: "Ahmet",
        lastName: "Yılmaz",
        email: "ahmet.yilmaz@atmosware.turkcell.com.tr",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=4f46e5&color=fff",
        title: "Senior Frontend Developer",
        squad: "Platform Team",
      },
      dailyReports: [
        {
          day: "Pazartesi",
          date: "14.10.2024",
          tasks: [
            {
              taskName: "Project Setup",
              taskNumber: "KRON-101",
              estimatedHours: 3,
              description:
                "SvelteKit projesi oluşturuldu. Tailwind CSS kurulumu yapıldı.",
            },
          ],
          blockers: "",
          meetings: "Sprint Planning (2 saat)",
          untrackedWork: "",
        },
        {
          day: "Salı",
          date: "15.10.2024",
          tasks: [
            {
              taskName: "Database Schema",
              taskNumber: "KRON-102",
              estimatedHours: 4,
              description:
                "Veritabanı şeması tasarlandı ve migration'lar oluşturuldu.",
            },
          ],
          blockers: "",
          meetings: "Daily Standup (15dk), Database Design Review (1 saat)",
          untrackedWork: "",
        },
        {
          day: "Çarşamba",
          date: "16.10.2024",
          tasks: [
            {
              taskName: "Authentication Flow",
              taskNumber: "KRON-103",
              estimatedHours: 5,
              description:
                "Firebase Authentication kurulumu ve temel auth akışı implement edildi.",
            },
          ],
          blockers: "Firebase proje erişim izinleri bekleniyor.",
          meetings: "Daily Standup (15dk)",
          untrackedWork: "",
        },
        {
          day: "Perşembe",
          date: "17.10.2024",
          tasks: [
            {
              taskName: "UI Component Library",
              taskNumber: "KRON-104",
              estimatedHours: 6,
              description:
                "Temel UI component'leri (Button, Input, Checkbox) oluşturuldu.",
            },
          ],
          blockers: "",
          meetings: "Daily Standup (15dk), Design Sync (30dk)",
          untrackedWork: "",
        },
        {
          day: "Cuma",
          date: "18.10.2024",
          tasks: [
            {
              taskName: "Routing Setup",
              taskNumber: "KRON-105",
              estimatedHours: 3,
              description:
                "SvelteKit routing yapısı kuruldu. Ana sayfalar oluşturuldu.",
            },
          ],
          blockers: "",
          meetings: "Daily Standup (15dk), Sprint Review (1.5 saat)",
          untrackedWork: "Haftalık rapor hazırlandı (30dk).",
        },
      ],
    },
    "3": {
      id: "3",
      title: "Haftalık Rapor",
      startDate: "07.10.2024",
      endDate: "11.10.2024",
      createdAt: "2024-10-14T11:00:00Z",
      user: {
        id: "user-1",
        firstName: "Ahmet",
        lastName: "Yılmaz",
        email: "ahmet.yilmaz@atmosware.turkcell.com.tr",
        avatarUrl:
          "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=4f46e5&color=fff",
        title: "Senior Frontend Developer",
        squad: "Platform Team",
      },
      dailyReports: [
        {
          day: "Pazartesi",
          date: "07.10.2024",
          tasks: [
            {
              taskName: "Requirements Analysis",
              taskNumber: "KRON-90",
              estimatedHours: 4,
              description:
                "Proje gereksinimlerinin analizi yapıldı. Teknik dokümantasyon incelendi.",
            },
          ],
          blockers: "",
          meetings: "Kickoff Meeting (2 saat)",
          untrackedWork: "",
        },
        {
          day: "Salı",
          date: "08.10.2024",
          tasks: [
            {
              taskName: "Technical Design",
              taskNumber: "KRON-91",
              estimatedHours: 5,
              description:
                "Sistem mimarisi tasarlandı. Component hiyerarşisi belirlendi.",
            },
          ],
          blockers: "",
          meetings: "Tech Design Meeting (1.5 saat)",
          untrackedWork: "",
        },
        {
          day: "Çarşamba",
          date: "09.10.2024",
          tasks: [
            {
              taskName: "Environment Setup",
              taskNumber: "KRON-92",
              estimatedHours: 3,
              description:
                "Development environment kurulumu. CI/CD pipeline hazırlığı.",
            },
          ],
          blockers: "",
          meetings: "Daily Standup (15dk)",
          untrackedWork: "DevOps ekibi ile koordinasyon (1 saat).",
        },
        {
          day: "Perşembe",
          date: "10.10.2024",
          tasks: [
            {
              taskName: "Code Review Guidelines",
              taskNumber: "KRON-93",
              estimatedHours: 2,
              description: "Takım için code review standartları oluşturuldu.",
            },
          ],
          blockers: "",
          meetings: "Daily Standup (15dk), Team Workshop (2 saat)",
          untrackedWork: "",
        },
        {
          day: "Cuma",
          date: "11.10.2024",
          tasks: [
            {
              taskName: "Documentation Setup",
              taskNumber: "KRON-94",
              estimatedHours: 3,
              description:
                "Proje dokümantasyon yapısı kuruldu. README template'i oluşturuldu.",
            },
          ],
          blockers: "",
          meetings: "Daily Standup (15dk), Sprint Planning (2 saat)",
          untrackedWork: "",
        },
      ],
    },
  };
}

let MOCK_REPORT_DETAILS: { [key: string]: ReportDetails } =
  loadReportDetailsFromLocalStorage();

// Archive sayfası için otomatik mock data üretici
function generateMockReportDetails(reportId: string): ReportDetails | null {
  // Eğer kayıtlı detay varsa onu kullan
  if (MOCK_REPORT_DETAILS[reportId]) {
    return MOCK_REPORT_DETAILS[reportId];
  }

  // Archive sayfasından gelen report-X formatındaki ID'ler için otomatik oluştur
  if (reportId.startsWith("report-")) {
    const reportNumber = parseInt(reportId.replace("report-", ""));
    const currentDate = new Date();
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - ((reportNumber - 1) * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);
    
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
    const dailyReports: DailyReport[] = days.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      
      const taskCount = Math.floor(Math.random() * 4) + 2;
      const tasks: DayTask[] = [];
      
      for (let i = 0; i < taskCount; i++) {
        const taskDescriptions = [
          "API entegrasyonu tamamlandı",
          "UI component geliştirmesi yapıldı",
          "Test senaryoları yazıldı",
          "Code review süreçleri tamamlandı",
          "Dokümantasyon güncellendi",
          "Bug fix işlemleri yapıldı",
          "Performance optimizasyonu uygulandı",
          "Database migration işlemi",
          "Authentication sistemi geliştirildi",
          "Dashboard tasarımı güncellendi"
        ];
        
        tasks.push({
          taskName: taskDescriptions[Math.floor(Math.random() * taskDescriptions.length)],
          taskNumber: `KRON-${1000 + reportNumber * 10 + i}`,
          estimatedHours: Math.floor(Math.random() * 5) + 2,
          description: "Görev detaylı açıklaması burada yer alıyor."
        });
      }
      
      const hasBlockers = Math.random() > 0.7;
      const hasMeetings = Math.random() > 0.3;
      const hasUntrackedWork = Math.random() > 0.5;
      
      return {
        day,
        date: formatDate(dayDate),
        tasks,
        blockers: hasBlockers ? "Backend API entegrasyonu bekleniyor." : "",
        meetings: hasMeetings ? "Daily Standup (15dk), Sprint Planning (1 saat)" : "",
        untrackedWork: hasUntrackedWork ? "Code review ve mentorluk (1 saat)" : ""
      };
    });

    const mockDetail: ReportDetails = {
      id: reportId,
      title: "Haftalık Rapor",
      startDate: formatDate(weekStart),
      endDate: formatDate(weekEnd),
      createdAt: weekEnd.toISOString(),
      user: {
        id: "user-1",
        firstName: "Ahmet",
        lastName: "Yılmaz",
        email: "ahmet.yilmaz@atmosware.turkcell.com.tr",
        avatarUrl: "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=4f46e5&color=fff",
        title: "Senior Frontend Developer",
        squad: "Platform Team"
      },
      dailyReports
    };

    // Gelecekte kullanmak üzere cache'le
    MOCK_REPORT_DETAILS[reportId] = mockDetail;
    saveReportDetailsToLocalStorage(MOCK_REPORT_DETAILS);
    
    return mockDetail;
  }

  return null;
}

export async function getReportDetails(
  reportId: string
): Promise<ReportDetails | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reportDetails = generateMockReportDetails(reportId);
      resolve(reportDetails);
    }, 600);
  });
}

export async function downloadReportPdf(reportId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`PDF indiriliyor: Rapor ID ${reportId}`);
      resolve();
    }, 500);
  });
}

export async function createWeeklyReport(
  startDate: string,
  endDate: string,
  dailyReports: DailyReport[]
): Promise<RecentReport> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = String(MOCK_DASHBOARD_STATS.recentReports.length + 1);

      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      const createdDate = `${day}.${month}.${year}`;

      const allTasks: string[] = [];
      dailyReports.forEach((day) => {
        day.tasks
          .filter((t) => t.taskName)
          .forEach((task) => {
            allTasks.push(`${task.taskName} (${task.taskNumber})`);
          });
      });

      const newReport: RecentReport = {
        id: newId,
        title: "Haftalık Rapor",
        date: createdDate,
        startDate: startDate,
        endDate: endDate,
        tasks: allTasks.length > 0 ? allTasks : ["Rapor içeriği mevcut"],
      };

      const reportDetails: ReportDetails = {
        id: newId,
        title: "Haftalık Rapor",
        startDate: startDate,
        endDate: endDate,
        createdAt: new Date().toISOString(),
        user: {
          id: "user-1",
          firstName: "Ahmet",
          lastName: "Yılmaz",
          email: "ahmet.yilmaz@atmosware.turkcell.com.tr",
          avatarUrl:
            "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=4f46e5&color=fff",
          title: "Senior Frontend Developer",
          squad: "Platform Team",
        },
        dailyReports: dailyReports,
      };

      MOCK_DASHBOARD_STATS.recentReports.unshift(newReport);

      if (MOCK_DASHBOARD_STATS.recentReports.length > 10) {
        MOCK_DASHBOARD_STATS.recentReports =
          MOCK_DASHBOARD_STATS.recentReports.slice(0, 10);
      }

      MOCK_REPORT_DETAILS[newId] = reportDetails;

      MOCK_DASHBOARD_STATS.reportsSent += 1;

      saveToLocalStorage(MOCK_DASHBOARD_STATS);
      saveReportDetailsToLocalStorage(MOCK_REPORT_DETAILS);

      console.log("Yeni rapor eklendi:", newReport);
      resolve(newReport);
    }, 500);
  });
}
