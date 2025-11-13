<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import SearchBar from "$lib/components/ui/SearchBar/SearchBar.svelte";
  import Pagination from "$lib/components/ui/Pagination/Pagination.svelte";
  import ReportPreviewModal from "$lib/components/modules/Archive/ReportPreviewModal.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import {
    getArchivedReports,
    getArchiveStats,
    type ArchiveReport,
    type ArchiveStats,
  } from "$lib/services/archiveService.js";

  let isSidebarOpen = true;
  let searchValue = "";
  let currentPage = 1;
  const itemsPerPage = 10;

  // Modal state
  let isModalOpen = false;
  let selectedReport: any = null;

  // Data state
  let allReports: ArchiveReport[] = [];
  let stats: ArchiveStats | null = null;
  let loading = true;
  let totalPages = 1;
  let totalReports = 0;

  onMount(() => {
    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
    loadArchiveData();
  });

  async function loadArchiveData() {
    loading = true;
    try {
      // Archive raporlarını ve istatistikleri paralel yükle
      const [reportsData, statsData] = await Promise.all([
        getArchivedReports({
          page: currentPage,
          limit: itemsPerPage,
          sort: "desc",
          search: searchValue,
        }),
        getArchiveStats(),
      ]);

      allReports = reportsData.reports;
      totalPages = reportsData.pagination.totalPages;
      totalReports = reportsData.pagination.totalReports;
      stats = statsData;
    } catch (error) {
      console.error("Arşiv verileri yüklenirken hata:", error);
    } finally {
      loading = false;
    }
  }

  async function handlePageChange(event: CustomEvent) {
    currentPage = event.detail.page;
    await loadArchiveData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSearch() {
    currentPage = 1;
    await loadArchiveData();
  }

  function openReportDetail(reportId: string) {
    window.location.href = `/archive/${reportId}`;
  }

  function openPreviewModal(report: any) {
    selectedReport = report;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    selectedReport = null;
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

  // Search değiştiğinde debounce ile arama yap
  let searchTimeout: number;
  $: {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (searchValue !== undefined) {
        handleSearch();
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
    theme={$themeStore}
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
          Geçmişte oluşturulmuş tüm haftalık raporlarınızı buradan görüntüleyebilirsiniz.
        </p>
      </div>

      <!-- Stats Overview -->
      {#if !loading && stats}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Toplam Rapor
                </p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalReports}
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
                  {stats.totalTasks}
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
                  {stats.totalHours}h
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
          {#each Array(5) as _}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
              <div class="flex items-start justify-between">
                <div class="flex-1 space-y-3">
                  <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                  <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                  <div class="flex gap-4">
                    <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                    <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if allReports.length === 0}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
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
          {#each allReports as report}
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                      {report.title}
                    </h3>
                    {#if report.status === "recent"}
                      <span
                        class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      >
                        YENİ
                      </span>
                    {/if}
                  </div>

                  <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div class="flex items-center gap-1">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span class="font-medium">{report.startDate} - {report.endDate}</span>
                    </div>
                    <div class="flex items-center gap-1">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{getRelativeTime(report.endDate)}</span>
                    </div>
                  </div>

                  <div class="flex gap-4">
                    <div
                      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30"
                    >
                      <svg
                        class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
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
                      <span class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                        {report.taskCount} Task
                      </span>
                    </div>
                    <div
                      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30"
                    >
                      <svg
                        class="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                      <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {report.totalHours} Saat
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <button
                    on:click={() => openReportDetail(report.id)}
                    class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg
                      class="w-5 h-5"
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
                    Detayları Gör
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Pagination -->
        {#if totalPages > 1}
          <div class="mt-8 flex justify-center">
            <Pagination
              totalItems={totalReports}
              {itemsPerPage}
              {currentPage}
              on:pageChange={handlePageChange}
            />
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>

<!-- Report Preview Modal -->
<ReportPreviewModal
  bind:isOpen={isModalOpen}
  report={selectedReport}
/>
