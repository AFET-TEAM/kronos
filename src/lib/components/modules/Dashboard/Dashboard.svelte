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
  } from "$lib/services/reportService.js";
  import Icon from "$lib/components/ui/Icon/Icon.svelte";

  let stats: DashboardStats | null = null;
  let loading = true;
  let isDailyReportModalOpen = false;
  let isWeeklyReportModalOpen = false;
  let isPreviewModalOpen = false;
  let selectedReport: RecentReport | null = null;
  let selectedDate = "";

  onMount(async () => {
    await loadDashboardData();
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

  function openDailyReportModal(date: string) {
    selectedDate = date;
    isDailyReportModalOpen = true;
  }

  function openWeeklyReportModal() {
    isWeeklyReportModalOpen = true;
  }

  function openPreviewModal(report: RecentReport) {
    selectedReport = report;
    isPreviewModalOpen = true;
  }

  function handleReportCreated() {
    loadDashboardData();
  }
</script>

<div class="dashboard-container min-h-screen bg-gray-50 dark:bg-gray-900">
  <section class="mb-8">
    <h2
      class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
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
      class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
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
              class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"
            ></div>
            <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        {/each}
      </div>
    {:else if stats}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {#each stats.weeklySummary as dayData}
          <WeeklyDayCard
            day={dayData.day}
            date={dayData.date}
            onAddReport={() => openDailyReportModal(dayData.date)}
          />
        {/each}
      </div>

      <div class="flex justify-center">
        <Button
          text="Yeni Haftalık Rapor Oluştur"
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
      class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
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
                  class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
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
                class="w-6 h-6 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
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
  onClose={() => (isWeeklyReportModalOpen = false)}
  onReportCreated={handleReportCreated}
/>

<ReportPreviewModal bind:isOpen={isPreviewModalOpen} report={selectedReport} />

<style>
  .dashboard-container {
    padding: 2rem;
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }
  }
</style>
