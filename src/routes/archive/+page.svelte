<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import SearchBar from "$lib/components/ui/SearchBar/SearchBar.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import {
    getGroupedArchiveReports,
    type GroupedArchiveData,
    type YearGroup,
    type MonthGroup,
    type WeekGroup,
    type ArchiveReport,
  } from "$lib/services/archiveService.js";
  import { getErrorMessage } from "$lib/services/errorHandler.js";

  let isSidebarOpen = true;
  let searchValue = "";

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

      // İlk yılı otomatik aç
      if (archiveData && archiveData.years.length > 0) {
        expandedYears.add(archiveData.years[0].year);

        // İlk ayı otomatik aç
        if (archiveData.years[0].months.length > 0) {
          const firstMonth = archiveData.years[0].months[0];
          expandedMonths.add(
            `${archiveData.years[0].year}-${firstMonth.monthNumber}`,
          );
        }
      }
    } catch (error) {
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
    window.location.href = `/archive/${reportId}`;
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
    window.location.href = `/dashboard?editReport=${report.id}`;
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
    return monthGroup.weeks.reduce((sum, week) => sum + week.reports.length, 0);
  }

  function countReportsInYear(yearGroup: YearGroup): number {
    return yearGroup.months.reduce(
      (sum, month) => sum + countReportsInMonth(month),
      0,
    );
  }

  // Search debounce
  let searchTimeout: number;
  $: {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (searchValue !== undefined) {
        loadArchiveData();
      }
    }, 500) as unknown as number;
  }
</script>

<svelte:head>
  <title>Arşiv - Kronos</title>
  <meta
    name="description"
    content="Kronos Raporlama Sistemi - Geçmiş Haftalık Raporlar Arşivi"
  />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
    bind:searchValue
  >
    <SearchBar
      placeholder="Rapor ara (tarih, başlık...)..."
      bind:value={searchValue}
      icon="search"
      size="medium"
    />
  </Header>

  <Sidebar bind:isOpen={isSidebarOpen} />

  <main
    class="transition-all duration-300 pt-16 {isSidebarOpen
      ? 'ml-0 md:ml-64'
      : 'ml-0'}"
  >
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📦 Rapor Arşivi
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Geçmişte oluşturulmuş tüm haftalık raporlarınızı buradan
          görüntüleyebilirsiniz.
        </p>
      </div>

      <!-- Stats Overview -->
      {#if !loading && archiveData && archiveData.stats}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Toplam Rapor
                </p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">
                  {archiveData.stats.totalReports}
                </p>
              </div>
              <div
                class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-indigo-600 dark:text-indigo-400"
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

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Toplam Task
                </p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">
                  {archiveData.stats.totalTasks}
                </p>
              </div>
              <div
                class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-green-600 dark:text-green-400"
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

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Toplam Saat
                </p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">
                  {archiveData.stats.totalHours}h
                </p>
              </div>
              <div
                class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-blue-600 dark:text-blue-400"
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
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse"
            >
              <div
                class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"
              ></div>
              <div class="space-y-3">
                <div
                  class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"
                ></div>
                <div
                  class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if !archiveData || archiveData.years.length === 0}
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center"
        >
          <div class="text-6xl mb-4">📭</div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Rapor Bulunamadı
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {searchValue
              ? "Arama kriterlerinize uygun rapor bulunamadı."
              : "Henüz arşivlenmiş rapor bulunmuyor."}
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each archiveData.years as yearGroup}
            <!-- Yıl Accordion -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <button
                on:click={() => toggleYear(yearGroup.year)}
                class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg
                    class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform {expandedYears.has(
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
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                    📅 {yearGroup.year}
                  </h2>
                </div>
                <span
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                >
                  {countReportsInYear(yearGroup)} Rapor
                </span>
              </button>

              {#if expandedYears.has(yearGroup.year)}
                <div
                  class="border-t border-gray-200 dark:border-gray-700 px-4 py-2"
                >
                  {#each yearGroup.months as monthGroup}
                    <!-- Ay Accordion -->
                    <div class="mb-2">
                      <button
                        on:click={() =>
                          toggleMonth(yearGroup.year, monthGroup.monthNumber)}
                        class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
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
                            class="text-lg font-semibold text-gray-800 dark:text-gray-200"
                          >
                            {monthGroup.monthLabel}
                          </h3>
                        </div>
                        <span
                          class="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2.5 py-1 rounded-full"
                        >
                          {countReportsInMonth(monthGroup)} Rapor
                        </span>
                      </button>

                      {#if expandedMonths.has(`${yearGroup.year}-${monthGroup.monthNumber}`)}
                        <div class="ml-8 mt-2 space-y-2">
                          {#each monthGroup.weeks as weekGroup}
                            <!-- Hafta Accordion -->
                            <div
                              class="border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                              <button
                                on:click={() =>
                                  toggleWeek(
                                    yearGroup.year,
                                    monthGroup.monthNumber,
                                    weekGroup.weekNumber,
                                  )}
                                class="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
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
                                    class="text-sm font-medium text-gray-700 dark:text-gray-300"
                                  >
                                    {weekGroup.weekLabel}
                                  </span>
                                </div>
                                <span
                                  class="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded"
                                >
                                  {weekGroup.reports.length} Rapor
                                </span>
                              </button>

                              {#if expandedWeeks.has(`${yearGroup.year}-${monthGroup.monthNumber}-${weekGroup.weekNumber}`)}
                                <div
                                  class="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2"
                                >
                                  {#each weekGroup.reports as report}
                                    <!-- Rapor Kartı -->
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
                                              {report.title}
                                            </h4>
                                            {#if report.status === "recent"}
                                              <span
                                                class="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                              >
                                                YENİ
                                              </span>
                                            {/if}
                                          </div>

                                          <div
                                            class="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3"
                                          >
                                            <div
                                              class="flex items-center gap-1"
                                            >
                                              <svg
                                                class="w-3.5 h-3.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                              </svg>
                                              <span
                                                >{report.startDate} - {report.endDate}</span
                                              >
                                            </div>
                                            <span>•</span>
                                            <span
                                              >{getRelativeTime(
                                                report.endDate,
                                              )}</span
                                            >
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
                                                {report.taskCount} Task
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
                                                {report.totalHours}h
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div class="flex gap-2">
                                          <button
                                            on:click={() =>
                                              openReportDetail(report.id)}
                                            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
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

                                          {#if isReportEditable(report)}
                                            <button
                                              on:click={() =>
                                                openEditReportModal(report)}
                                              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
                                              title="Bu haftayı düzenle"
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
                                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                              </svg>
                                              Düzenle
                                            </button>
                                          {:else}
                                            <button
                                              disabled
                                              class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-md cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                                              title="Gelecek haftalar düzenlenemez"
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
                                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                />
                                              </svg>
                                              Kilitli
                                            </button>
                                          {/if}
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
