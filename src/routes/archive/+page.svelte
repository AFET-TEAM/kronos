<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import {
    getGroupedArchiveReports,
    type GroupedArchiveData,
    type YearGroup,
    type MonthGroup,
    type WeekGroup,
    type ArchiveReport,
    type DailyArchiveReport,
  } from "$lib/services/archiveService.js";
  import { getErrorMessage } from "$lib/services/errorHandler.js";

  let isSidebarOpen = true;
  const searchValue = "";

  // Data state
  let archiveData: GroupedArchiveData | null = null;
  let loading = true;
  let errorMessage = "";

  // Accordion states
  let expandedYears = new Set<number>();
  let expandedMonths = new Set<string>(); // Format: "year-month"
  let expandedWeeks = new Set<string>(); // Format: "year-month-week"

  onMount(() => {
    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
    loadArchiveData();
  });

  async function loadArchiveData() {
    loading = true;
    errorMessage = "";
    try {
      archiveData = await getGroupedArchiveReports(searchValue);
      console.log(`[Archive Page] Loaded archive data:`, archiveData);

      // İlk yılı otomatik aç
      if (archiveData && archiveData.years.length > 0) {
        expandedYears.add(archiveData.years[0].year);

        // İlk ayı otomatik aç
        if (archiveData.years[0].months.length > 0) {
          const firstMonth = archiveData.years[0].months[0];
          expandedMonths.add(
            `${archiveData.years[0].year}-${firstMonth.monthNumber}`,
          );
          
          // İlk haftayı otomatik aç
          if (firstMonth.weeks.length > 0) {
            const firstWeek = firstMonth.weeks[0];
            expandedWeeks.add(
              `${archiveData.years[0].year}-${firstMonth.monthNumber}-${firstWeek.weekNumber}`,
            );
          }
        }
      } else {
        console.warn(`[Archive Page] No years found in archive data`);
      }
    } catch (error) {
      console.error(`[Archive Page] Error loading archive data:`, error);
      errorMessage = getErrorMessage(error);
    } finally {
      loading = false;
    }
  }

  function toggleYear(year: number) {
    if (expandedYears.has(year)) {
      expandedYears.delete(year);
    } else {
      expandedYears.add(year);
    }
    expandedYears = expandedYears;
  }

  function toggleMonth(year: number, month: number) {
    const key = `${year}-${month}`;
    if (expandedMonths.has(key)) {
      expandedMonths.delete(key);
    } else {
      expandedMonths.add(key);
    }
    expandedMonths = expandedMonths;
  }

  function toggleWeek(year: number, month: number, week: number) {
    const key = `${year}-${month}-${week}`;
    if (expandedWeeks.has(key)) {
      expandedWeeks.delete(key);
    } else {
      expandedWeeks.add(key);
    }
    expandedWeeks = expandedWeeks;
  }

  function openReportDetail(reportId: string) {
    console.log("[Archive] Opening report detail for ID:", reportId);
    goto(`/archive/${reportId}`);
  }

  function openDayReportDetail(date: string, dayReport: DailyArchiveReport) {
    // O günün tüm tasklarını göstermek için özel bir sayfaya yönlendir
    // Veya mevcut detay sayfasını kullan, ama gün bazında göster
    // Şimdilik, ilk raporun ID'sini kullan (eğer varsa)
    if (dayReport.reports.length > 0) {
      const firstReport = dayReport.reports[0];
      // Gün bazında gösterim için query parameter ekle
      goto(`/archive/${firstReport.id}?date=${date}`);
    }
  }

  /**
   * Raporun düzenlenebilir olup olmadığını kontrol et
   * Sadece bulunduğumuz haftanın raporları düzenlenebilir
   */
  function isReportEditable(report: ArchiveReport): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Rapor bitiş tarihini parse et (DD.MM.YYYY)
    const [day, month, year] = report.endDate.split(".");
    const reportEndDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    );
    reportEndDate.setHours(0, 0, 0, 0);

    // Bu haftanın başlangıcı (Pazartesi)
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazar ise -6, diğer günler için 1 - dayOfWeek
    currentWeekStart.setDate(today.getDate() + daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Bu haftanın sonu (Pazar)
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    // Rapor tarihi, bu haftanın içinde ise düzenlenebilir
    return reportEndDate >= currentWeekStart && reportEndDate <= currentWeekEnd;
  }

  /**
   * Rapor düzenleme için Dashboard'a yönlendir
   * Dashboard'daki haftalık rapor modalı açılacak
   */
  function openEditReportModal(report: ArchiveReport) {
    if (!isReportEditable(report)) {
      return; // Gelecek haftalar düzenlenemez
    }

    // Dashboard sayfasına yönlendir ve rapor ID'sini query parameter olarak gönder
    goto(`/dashboard?editReport=${report.id}`);
  }

  function getRelativeTime(dateStr: string): string {
    const [day, month, year] = dateStr.split(".");
    const reportDate = new Date(`${year}-${month}-${day}`);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reportDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Bugün";
    if (diffDays === 1) return "Dün";
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
    return `${Math.floor(diffDays / 365)} yıl önce`;
  }

  function countReportsInMonth(monthGroup: MonthGroup): number {
    return monthGroup.weeks.reduce((sum, week) => sum + (week.days?.length || 0), 0);
  }

  function countReportsInYear(yearGroup: YearGroup): number {
    return yearGroup.months.reduce(
      (sum, month) => sum + countReportsInMonth(month),
      0,
    );
  }

</script>

<svelte:head>
  <title>Arşiv - Kronos</title>
  <meta
    name="description"
    content="Kronos Raporlama Sistemi - Geçmiş Haftalık Raporlar Arşivi"
  />
</svelte:head>

<div class="min-h-screen bg-slate-100 dark:bg-slate-950">
  <Header
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
  />

  <Sidebar bind:isOpen={isSidebarOpen} />

  <main
    class="transition-all duration-300 pt-14 {isSidebarOpen
      ? 'ml-0 md:ml-64'
      : 'ml-0'}"
  >
    <div class="max-w-5xl mx-auto px-4 py-6">
      <div class="mb-8">
        <h1 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Rapor Arşivi
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Geçmiş haftalık raporlarınızı görüntüleyin ve indirin.
        </p>
      </div>

      {#if !loading && archiveData && archiveData.stats}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Toplam Rapor
                </p>
                <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {archiveData.stats.totalReports}
                </p>
              </div>
              <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Toplam Görev
                </p>
                <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {archiveData.stats.totalTasks}
                </p>
              </div>
              <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Toplam Saat
                </p>
                <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {archiveData.stats.totalHours}h
                </p>
              </div>
              <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <svg
                  class="w-6 h-6 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Reports List -->
      {#if loading}
        <div class="space-y-4">
          {#each Array(3) as _}
            <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 animate-pulse">
              <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
              <div class="space-y-3">
                <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if !archiveData || archiveData.years.length === 0}
        <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
          <div class="text-6xl mb-4">📭</div>
          <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Rapor Bulunamadı
          </h3>
          <p class="text-slate-600 dark:text-slate-400">
            {searchValue
              ? "Arama kriterlerinize uygun rapor bulunamadı."
              : "Henüz arşivlenmiş rapor bulunmuyor."}
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each archiveData.years as yearGroup}
            <!-- Yıl Accordion -->
            <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
              <button
                on:click={() => toggleYear(yearGroup.year)}
                class="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg
                    class="w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform {expandedYears.has(
                      yearGroup.year,
                    )
                      ? 'rotate-90'
                      : ''}"
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
                  <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {yearGroup.year}
                  </h2>
                </div>
                <span
                  class="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"
                >
                  {countReportsInYear(yearGroup)} Rapor
                </span>
              </button>

              {#if expandedYears.has(yearGroup.year)}
                <div
                  class="border-t border-slate-200 dark:border-slate-700 px-4 py-2"
                >
                  {#each yearGroup.months as monthGroup}
                    <!-- Ay Accordion -->
                    <div class="mb-2">
                      <button
                        on:click={() =>
                          toggleMonth(yearGroup.year, monthGroup.monthNumber)}
                        class="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                      >
                        <div class="flex items-center gap-3">
                          <svg
                            class="w-4 h-4 text-gray-400 transition-transform {expandedMonths.has(
                              `${yearGroup.year}-${monthGroup.monthNumber}`,
                            )
                              ? 'rotate-90'
                              : ''}"
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
                          <h3
                            class="text-lg font-semibold text-slate-800 dark:text-slate-200"
                          >
                            {monthGroup.monthLabel}
                          </h3>
                        </div>
                        <span
                          class="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full"
                        >
                          {countReportsInMonth(monthGroup)} Rapor
                        </span>
                      </button>

                      {#if expandedMonths.has(`${yearGroup.year}-${monthGroup.monthNumber}`)}
                        <div class="ml-8 mt-2 space-y-2">
                          {#each monthGroup.weeks as weekGroup}
                            <!-- Hafta Accordion -->
                            <div
                              class="border border-slate-200 dark:border-slate-700 rounded-lg"
                            >
                              <button
                                on:click={() =>
                                  toggleWeek(
                                    yearGroup.year,
                                    monthGroup.monthNumber,
                                    weekGroup.weekNumber,
                                  )}
                                class="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                              >
                                <div class="flex items-center gap-2">
                                  <svg
                                    class="w-4 h-4 text-gray-400 transition-transform {expandedWeeks.has(
                                      `${yearGroup.year}-${monthGroup.monthNumber}-${weekGroup.weekNumber}`,
                                    )
                                      ? 'rotate-90'
                                      : ''}"
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
                                  <span
                                    class="text-sm font-medium text-slate-700 dark:text-slate-300"
                                  >
                                    {weekGroup.weekLabel}
                                  </span>
                                </div>
                                <span
                                  class="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                                >
                                  {weekGroup.days?.length || 0} Gün
                                </span>
                              </button>

                              {#if expandedWeeks.has(`${yearGroup.year}-${monthGroup.monthNumber}-${weekGroup.weekNumber}`)}
                                <div
                                  class="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2"
                                >
                                  {#each weekGroup.days as dayGroup}
                                    <!-- Gün Kartı -->
                                    <div
                                      class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                      <div
                                        class="flex items-start justify-between gap-4"
                                      >
                                        <div class="flex-1">
                                          <div
                                            class="flex items-center gap-2 mb-2"
                                          >
                                            <h4
                                              class="text-base font-semibold text-gray-900 dark:text-white"
                                            >
                                              {dayGroup.day} - {dayGroup.date}
                                            </h4>
                                            {#if dayGroup.report.isOnLeave}
                                              <span
                                                class="px-2 py-0.5 text-xs font-medium rounded-full bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200"
                                              >
                                                🏖️ İzinli
                                              </span>
                                            {/if}
                                          </div>

                                          <div class="flex gap-3">
                                            <div
                                              class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-900/40"
                                            >
                                              <svg
                                                class="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                                />
                                              </svg>
                                              <span
                                                class="text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                                              >
                                                {dayGroup.report.taskCount} Task
                                              </span>
                                            </div>
                                            <div
                                              class="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-900/40"
                                            >
                                              <svg
                                                class="w-4 h-4 text-blue-600 dark:text-blue-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                              </svg>
                                              <span
                                                class="text-xs font-semibold text-blue-700 dark:text-blue-300"
                                              >
                                                {dayGroup.report.totalHours}h
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div class="flex gap-2">
                                          <button
                                            on:click={() =>
                                              openDayReportDetail(dayGroup.date, dayGroup.report)}
                                            class="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                          >
                                            <svg
                                              class="w-4 h-4"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                              />
                                              <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                              />
                                            </svg>
                                            Görüntüle
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  {/each}
                                </div>
                              {/if}
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </main>
</div>
