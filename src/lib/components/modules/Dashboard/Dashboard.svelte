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
    getDailyReportByDate,
    type DashboardStats,
    type RecentReport,
    type ReportDetails,
    type DailyReport,
  } from "$lib/services/reportService.js";
  import Icon from "$lib/components/ui/Icon/Icon.svelte";
  import { getReportDetails } from "$lib/services/archiveService.js";
  import { getErrorMessage } from "$lib/services/errorHandler.js";

  let stats: DashboardStats | null = null;
  let loading = true;
  let isDailyReportModalOpen = false;
  let isWeeklyReportModalOpen = false;
  let isPreviewModalOpen = false;
  let selectedReport: RecentReport | null = null;
  let selectedDate = "";
  let selectedDailyReport: DailyReport | null = null;
  let reportToEdit: ReportDetails | null = null;
  let errorMessage = "";

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
    errorMessage = "";
    try {
      stats = await getDashboardStats();
    } catch (error) {
      errorMessage = getErrorMessage(error);
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
      errorMessage = getErrorMessage(error);
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

  async function openDailyReportModal(date: string) {
    // DD.MM.YYYY formatını YYYY-MM-DD'ye çevir
    const [day, month, year] = date.split('.');
    selectedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Bu tarih için mevcut rapor var mı kontrol et
    try {
      const existingReport = await getDailyReportByDate(date);
      selectedDailyReport = existingReport;
    } catch (error) {
      // Hata durumunda yeni rapor olarak aç
      selectedDailyReport = null;
    }
    
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

  function handleDailyReportSaved() {
    // Günlük rapor kaydedilince dashboard verilerini yenile
    selectedDailyReport = null;
    loadDashboardData();
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

<div class="dashboard-container min-h-screen bg-slate-100 dark:bg-slate-950">
  <div class="dashboard-inner max-w-6xl mx-auto">
    <!-- İstatistikler -->
    <section class="dashboard-section">
      <h2 class="section-title">
        <span class="section-title-icon">
          <Icon name="static" alt="" width="24" height="24" />
        </span>
        İstatistikler
      </h2>
      <div class="stats-grid">
        <StatCard
          title="Toplam Rapor Sayısı"
          value={stats?.reportsSent ?? "—"}
          icon="📨"
          {loading}
        />
        <StatCard
          title="Tamamlanan Görev"
          value={stats?.tasksCompleted ?? "—"}
          icon="✅"
          {loading}
        />
        <StatCard
          title="Tamamlanma Oranı"
          value={stats?.avgCompletionRate != null ? `${stats.avgCompletionRate}%` : "—"}
          icon="📈"
          {loading}
        />
      </div>
    </section>

    <!-- Haftalık Rapor Takvimi -->
    <section class="dashboard-section">
      <h2 class="section-title">
        <span class="section-title-icon">
          <Icon name="calendar" alt="" width="24" height="24" />
        </span>
        Bu Hafta
      </h2>
      <p class="section-desc">
        Hafta içi günlerine (Pazartesi–Cuma) rapor ekleyebilirsiniz. Cumartesi ve Pazar için rapor girilmez.
      </p>

      {#if loading}
        <div class="week-grid">
          {#each Array(5) as _}
            <div class="skeleton-card animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
              <div class="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
            </div>
          {/each}
        </div>
      {:else if stats}
        <div class="week-grid">
          {#each stats.weeklySummary as day}
            <WeeklyDayCard
              day={day.day}
              date={day.date}
              hasReport={day.hasReport}
              taskCount={day.taskCount}
              canAddReport={true}
              onAddReport={() => openDailyReportModal(day.date)}
            />
          {/each}
        </div>
        <div class="flex justify-center mt-6">
          <Button
            text="Haftalık Rapor Oluştur"
            variant="primary"
            size="large"
            onClick={openWeeklyReportModal}
            className="btn-weekly"
          />
        </div>
      {/if}
    </section>

    <!-- Son Raporlar -->
    <section class="dashboard-section">
      <h2 class="section-title">
        <span class="section-title-icon">
          <Icon name="document" alt="" width="22" height="22" />
        </span>
        Son Gönderilen Raporlar
      </h2>

      {#if loading}
        <div class="reports-list space-y-3">
          {#each Array(3) as _}
            <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 animate-pulse">
              <div class="h-5 bg-slate-200 dark:bg-slate-600 rounded w-2/3 mb-2"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/4"></div>
            </div>
          {/each}
        </div>
      {:else if stats?.recentReports?.length}
        <ul class="reports-list">
          {#each stats.recentReports as report}
            <li>
              <button
                type="button"
                on:click={() => openPreviewModal(report)}
                class="report-item"
              >
                <div class="report-item-content">
                  <h3 class="report-item-title">
                    {report.startDate} – {report.endDate}
                  </h3>
                  <p class="report-item-meta">
                    {report.tasks.length} görev · {report.date}
                  </p>
                </div>
                <svg class="report-item-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="empty-reports rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-8 text-center">
          <p class="text-slate-500 dark:text-slate-400 text-sm">Henüz rapor yok.</p>
        </div>
      {/if}
    </section>
  </div>
</div>

<DailyReportModal
  bind:isOpen={isDailyReportModalOpen}
  {selectedDate}
  existingReport={selectedDailyReport}
  onClose={() => {
    isDailyReportModalOpen = false;
    selectedDailyReport = null;
  }}
  onReportSaved={handleDailyReportSaved}
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
    padding: 1.5rem 1rem 2rem;
  }

  .dashboard-inner {
    margin: 0 auto;
  }

  .dashboard-section {
    margin-bottom: 2.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
    letter-spacing: -0.01em;
    margin-bottom: 0.5rem;
  }

  :global(.dark) .section-title {
    color: #f1f5f9;
  }

  .section-title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.5rem;
    background: #e2e8f0;
    color: #475569;
  }

  :global(.dark) .section-title-icon {
    background: #334155;
    color: #94a3b8;
  }

  .section-desc {
    font-size: 0.8125rem;
    color: #64748b;
    margin-bottom: 1rem;
    max-width: 42rem;
  }

  :global(.dark) .section-desc {
    color: #94a3b8;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .week-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .week-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .week-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  .btn-weekly {
    padding: 0.625rem 1.5rem;
    font-weight: 600;
    font-size: 0.9375rem;
    border-radius: 0.75rem;
    background: #0f172a;
    color: #fff;
    transition: background 0.2s;
  }

  .btn-weekly:hover {
    background: #1e293b;
  }

  :global(.dark) .btn-weekly {
    background: #f1f5f9;
    color: #0f172a;
  }

  :global(.dark) .btn-weekly:hover {
    background: #e2e8f0;
  }

  .reports-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .report-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem 1.25rem;
    text-align: left;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    background: #fff;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .report-item:hover {
    border-color: #cbd5e1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  :global(.dark) .report-item {
    border-color: #334155;
    background: rgba(30, 41, 59, 0.5);
  }

  :global(.dark) .report-item:hover {
    border-color: #475569;
  }

  .report-item-content {
    flex: 1;
    min-width: 0;
  }

  .report-item-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
  }

  :global(.dark) .report-item-title {
    color: #f1f5f9;
  }

  .report-item-meta {
    font-size: 0.8125rem;
    color: #64748b;
    margin: 0.25rem 0 0;
  }

  :global(.dark) .report-item-meta {
    color: #94a3b8;
  }

  .report-item-chevron {
    width: 1.25rem;
    height: 1.25rem;
    color: #94a3b8;
    flex-shrink: 0;
    margin-left: 0.75rem;
  }

  .report-item:hover .report-item-chevron {
    color: #64748b;
  }

  :global(.dark) .report-item:hover .report-item-chevron {
    color: #cbd5e1;
  }

  .reports-list li + li {
    margin-top: 0.5rem;
  }

  .empty-reports {
    border-style: dashed;
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem 0.75rem 1.5rem;
    }
  }
</style>
