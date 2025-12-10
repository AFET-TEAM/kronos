<script lang="ts">
  import { onMount } from "svelte";
  import StatCard from "../../ui/StatCard/StatCard.svelte";
  import WeeklyDayCard from "../../ui/WeeklyDayCard/WeeklyDayCard.svelte";
  import Button from "../../ui/Button/Button.svelte";
  import DailyReportModal from "../Reports/DailyReportModal.svelte";
  import NewReportModal from "../Reports/NewReportModal.svelte";
  import ReportPreviewModal from "../Archive/ReportPreviewModal.svelte";
  import {
    getDashboardStats,
    type DashboardStats,
    type RecentReport,
    type ReportDetails,
  } from "$lib/services/reportService.js";
  import Icon from "$lib/components/ui/Icon/Icon.svelte";
  import { getReportDetails } from "$lib/services/archiveService.js";

  let stats: DashboardStats | null = null;
  let loading = true;
  let isDailyReportModalOpen = false;
  let isWeeklyReportModalOpen = false;
  let isPreviewModalOpen = false;
  let selectedReport: RecentReport | null = null;
  let selectedDate = "";
  let reportToEdit: ReportDetails | null = null;

  onMount(async () => {
    await loadDashboardData();
    
    // Query parametresinden rapor ID'sini kontrol et
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const editReportId = urlParams.get('editReport');
      
      if (editReportId) {
        await loadReportForEdit(editReportId);
      }
    }
  });

  async function loadDashboardData() {
    loading = true;
    try {
      stats = await getDashboardStats();
    } catch (error) {
      console.error("Dashboard stats yüklenirken hata:", error);
    } finally {
      loading = false;
    }
  }

  /**
   * Arşivden raporu yükle ve düzenleme için aç
   */
  async function loadReportForEdit(reportId: string) {
    try {
      const report = await getReportDetails(reportId);
      
      if (!report) {
        alert("Rapor bulunamadı.");
        window.history.replaceState({}, document.title, "/dashboard");
        return;
      }
      
      // Raporun düzenlenebilir olup olmadığını kontrol et
      if (isReportEditable(report)) {
        reportToEdit = report;
        isWeeklyReportModalOpen = true;
      } else {
        alert("Bu rapor düzenlenemez. Sadece bu hafta ve bir önceki haftanın raporları düzenlenebilir.");
        // URL'den query parametresini temizle
        window.history.replaceState({}, document.title, "/dashboard");
      }
    } catch (error) {
      console.error("Rapor yüklenirken hata:", error);
      alert("Rapor yüklenirken bir hata oluştu.");
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }

  /**
   * Raporun düzenlenebilir olup olmadığını kontrol et
   * Sadece bu hafta ve bir önceki haftanın raporları düzenlenebilir
   */
  function isReportEditable(report: ReportDetails): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Rapor bitiş tarihini parse et (DD.MM.YYYY)
    const [day, month, year] = report.endDate.split(".");
    const reportEndDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    reportEndDate.setHours(0, 0, 0, 0);
    
    // Bu haftanın başlangıcı (Pazartesi)
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazar ise -6, diğer günler için 1 - dayOfWeek
    currentWeekStart.setDate(today.getDate() + daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Bir önceki haftanın başlangıcı
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(currentWeekStart.getDate() - 7);
    
    // Rapor tarihi, bir önceki haftanın başlangıcından sonra veya eşitse düzenlenebilir
    return reportEndDate >= previousWeekStart;
  }

  function openDailyReportModal(date: string) {
    selectedDate = date;
    isDailyReportModalOpen = true;
  }

  function openWeeklyReportModal() {
    reportToEdit = null; // Yeni rapor oluşturma
    isWeeklyReportModalOpen = true;
  }

  function openPreviewModal(report: RecentReport) {
    selectedReport = report;
    isPreviewModalOpen = true;
  }

  function handleReportCreated() {
    loadDashboardData();
    // Modal kapandığında URL'den query parametresini temizle
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, "/dashboard");
    }
    reportToEdit = null;
  }

  function handleModalClose() {
    isWeeklyReportModalOpen = false;
    // URL'den query parametresini temizle
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, "/dashboard");
    }
    reportToEdit = null;
  }
</script>

<div class="dashboard-container min-h-screen  dark:bg-gray-900">
  <section class="mb-8">
    <h2
      class="header-text mb-6 flex items-center justify-start gap-2"
    >
      <Icon name={"static"} alt="icon" width="40" height="40" />
      <span>İstatistikler</span>
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Gönderilen Rapor Sayısı"
        value={stats?.reportsSent ?? "-"}
        icon="📨"
        {loading}
      />
      <StatCard
        title="Tamamlanan Task Sayısı"
        value={stats?.tasksCompleted ?? "-"}
        icon="✅"
        {loading}
      />
      <StatCard
        title="Ortalama Tamamlanma Oranı"
        value={stats?.avgCompletionRate ? `${stats.avgCompletionRate}%` : "-"}
        icon="📈"
        {loading}
      />
    </div>
  </section>

  <section class="mb-8">
    <h2
      class="header-text mb-6 flex items-center gap-2"
    >
      <Icon name={"calendar"} alt="icon" width="40" height="40" />
      <span>Haftalık Rapor Takvimi</span>
    </h2>

    {#if loading}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {#each Array(5) as _}
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse"
          >
            <div
              class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"
            ></div>
            <div
              class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"
            ></div>
          </div>
        {/each}
      </div>
    {:else if stats}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {#each stats.weeklySummary as day}
          <WeeklyDayCard
            day={day.day}
            date={day.date}
          />
        {/each}
      </div>
      <div class="flex justify-center">
        <Button
          text="📝 Haftalık Rapor Oluştur"
          variant="primary"
          size="large"
          onClick={openWeeklyReportModal}
          className="px-8 py-3 bg-blue-100 hover:bg-blue-200 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        />
      </div>
    {/if}
  </section>

  <!-- Recent Reports -->
  <section class="mb-8">
    <h2
      class="header-text mb-6 flex items-center gap-2"
    >
      <Icon name={"document"} alt="icon" width="28" height="28" />
      <span>Son Gönderilen Raporlar</span>
    </h2>

    {#if loading}
      <div class="space-y-3">
        {#each Array(3) as _}
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse"
          >
            <div
              class="h-5 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-2"
            ></div>
            <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          </div>
        {/each}
      </div>
    {:else if stats}
      <div class="space-y-3">
        {#each stats.recentReports as report}
          <button
            on:click={() => openPreviewModal(report)}
            class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-200 text-left group"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-400 dark:group-hover:text-blue-400 transition-colors"
                >
                  {report.title}: {report.startDate} - {report.endDate}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Oluşturulma Tarihi: {report.date}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {report.tasks.length} görev tamamlandı
                </p>
              </div>
              <svg
                class="w-6 h-6 text-gray-400 group-hover:text-blue-400 dark:group-hover:text-blue-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </section>
</div>

<DailyReportModal
  bind:isOpen={isDailyReportModalOpen}
  {selectedDate}
  onClose={() => (isDailyReportModalOpen = false)}
/>

<NewReportModal
  bind:isOpen={isWeeklyReportModalOpen}
  onClose={handleModalClose}
  onReportCreated={handleReportCreated}
  {reportToEdit}
/>

<ReportPreviewModal bind:isOpen={isPreviewModalOpen} report={selectedReport} />

<style>
  .dashboard-container {
    padding: 2rem;
    background: linear-gradient(
      to top right,
      var(--color-brand-blue-ribbon),
      var(--color-success)
    );
  }

  .header-text {
    color: var(--color-text-inverse);
    text-shadow: 1px 1px 2px var(--color-background-overlay);
  }

  :global(.dark) .dashboard-container {
    background: linear-gradient(
      to top right,
      var(--color-gradient-body-gray1),
      var(--color-gradient-body-gray2)
    );
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }
  }
</style>
