<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import SearchBar from "$lib/components/ui/SearchBar/SearchBar.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import {
    getAdminReports,
    getAdminStats,
    markReportAsReviewed,
    markReportAsUnreviewed,
    type AdminReport,
    type AdminStats,
  } from "$lib/services/adminReportService.js";
  import { searchUsers, type AdminUser } from "$lib/services/admin.service.js";

  let isSidebarOpen = true;
  let activeFilter: "all" | "reviewed" | "pending" = "all";
  let sortOrder = "newest";
  let activePage = 1;
  let searchValue = "";
  const reportsPerPage = 8;

  let reportsList: AdminReport[] = [];
  let statistics: AdminStats | null = null;
  let isLoadingData = true;
  let totalPageCount = 1;
  let reportCount = 0;

  let userSearchQuery = "";
  let userSearchResults: AdminUser[] = [];
  let showUserDropdown = false;
  let selectedUser: AdminUser | null = null;
  let isSearchingUsers = false;

  let selectedReports: Set<string> = new Set();
  let showBulkActions = false;

  let selectedSquad = "all";
  let dateRangeStart = "";
  let dateRangeEnd = "";
  let showAdvancedFilters = false;

  let isExporting = false;

  const filterOptions: Array<{ value: "all" | "reviewed" | "pending"; label: string; icon: string }> = [
    { value: "all", label: "Tüm Raporlar", icon: "📊" },
    { value: "pending", label: "İncelenmemiş", icon: "⏳" },
    { value: "reviewed", label: "İncelenmiş", icon: "✅" },
  ];

  const sortOptions = [
    { value: "newest", label: "En Yeni" },
    { value: "oldest", label: "En Eski" },
  ];

  const squadOptions = [
    { value: "all", label: "Tüm Ekipler" },
    { value: "Platform Team", label: "Platform Team" },
    { value: "UI/UX Team", label: "UI/UX Team" },
    { value: "API Team", label: "API Team" },
    { value: "Backend Team", label: "Backend Team" },
  ];

  onMount(() => {
    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
    fetchReportsData();
  });

  async function fetchReportsData() {
    isLoadingData = true;
    try {
      const reviewedParam = activeFilter === "all" ? undefined : activeFilter === "reviewed";
      
      const [reportsData, stats] = await Promise.all([
        getAdminReports({
          page: activePage,
          limit: reportsPerPage,
          sort: sortOrder === "newest" ? "desc" : "asc",
          reviewed: reviewedParam,
          search: searchValue,
          userId: selectedUser?.id,
          squad: selectedSquad !== "all" ? selectedSquad : undefined,
        }),
        getAdminStats(),
      ]);

      reportsList = reportsData.reports;
      totalPageCount = reportsData.pagination.totalPages;
      reportCount = reportsData.pagination.totalReports;
      statistics = stats;
    } catch (err) {
      console.error("Raporlar yüklenemedi:", err);
    } finally {
      isLoadingData = false;
    }
  }

  async function handleUserSearch(query: string) {
    userSearchQuery = query;
    
    if (query.length < 2) {
      userSearchResults = [];
      showUserDropdown = false;
      return;
    }

    isSearchingUsers = true;
    showUserDropdown = true;

    try {
      const results = await searchUsers(query);
      userSearchResults = results;
    } catch (err) {
      console.error("Kullanıcı araması başarısız:", err);
      userSearchResults = [];
    } finally {
      isSearchingUsers = false;
    }
  }

  function selectUser(user: AdminUser) {
    selectedUser = user;
    userSearchQuery = `${user.firstName} ${user.lastName}`;
    showUserDropdown = false;
    activePage = 1;
    fetchReportsData();
  }

  function clearUserFilter() {
    selectedUser = null;
    userSearchQuery = "";
    userSearchResults = [];
    showUserDropdown = false;
    activePage = 1;
    fetchReportsData();
  }

  function toggleReportSelection(reportId: string) {
    if (selectedReports.has(reportId)) {
      selectedReports.delete(reportId);
    } else {
      selectedReports.add(reportId);
    }
    selectedReports = selectedReports;
    showBulkActions = selectedReports.size > 0;
  }

  function toggleSelectAll() {
    if (selectedReports.size === reportsList.length) {
      selectedReports.clear();
    } else {
      reportsList.forEach(report => selectedReports.add(report.id));
    }
    selectedReports = selectedReports;
    showBulkActions = selectedReports.size > 0;
  }

  async function bulkMarkAsReviewed() {
    try {
      for (const reportId of selectedReports) {
        await markReportAsReviewed(reportId);
      }
      selectedReports.clear();
      selectedReports = selectedReports;
      showBulkActions = false;
      await fetchReportsData();
    } catch (err) {
      console.error("Toplu işaretleme başarısız:", err);
    }
  }

  async function bulkMarkAsUnreviewed() {
    try {
      for (const reportId of selectedReports) {
        await markReportAsUnreviewed(reportId);
      }
      selectedReports.clear();
      selectedReports = selectedReports;
      showBulkActions = false;
      await fetchReportsData();
    } catch (err) {
      console.error("Toplu işaretleme geri alınamadı:", err);
    }
  }

  async function exportReports() {
    isExporting = true;
    try {
      const dataToExport = reportsList.map(report => ({
        "Kullanıcı": `${report.user.firstName} ${report.user.lastName}`,
        "Email": report.user.email,
        "Ekip": report.user.squad,
        "Rapor Başlığı": report.title,
        "Başlangıç": report.startDate,
        "Bitiş": report.endDate,
        "Task Sayısı": report.taskCount,
        "Toplam Saat": report.totalHours,
        "Durum": report.isReviewed ? "İncelendi" : "Bekliyor"
      }));

      const csv = convertToCSV(dataToExport);
      downloadCSV(csv, `raporlar_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      console.error("Export başarısız:", err);
    } finally {
      isExporting = false;
    }
  }

  function convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return `"${value}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleFilterChange(filter: typeof activeFilter) {
    activeFilter = filter;
    activePage = 1;
    selectedReports.clear();
    selectedReports = selectedReports;
    showBulkActions = false;
    await fetchReportsData();
  }

  async function handleSortChange(sort: string) {
    sortOrder = sort;
    await fetchReportsData();
  }

  async function handleSquadChange(squad: string) {
    selectedSquad = squad;
    activePage = 1;
    await fetchReportsData();
  }

  async function handlePageSwitch(page: number) {
    activePage = page;
    await fetchReportsData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleReviewStatus(report: AdminReport) {
    try {
      if (report.isReviewed) {
        await markReportAsUnreviewed(report.id);
        report.isReviewed = false;
      } else {
        await markReportAsReviewed(report.id);
        report.isReviewed = true;
      }
      reportsList = [...reportsList]; 
    } catch (err) {
      console.error("İnceleme durumu güncellenemedi:", err);
    }
  }

  function viewReportDetails(reportId: string) {
    window.location.href = `/archive/${reportId}`;
  }

  function calculateDaysAgo(dateString: string): string {
    const [day, month, year] = dateString.split(".");
    const reportDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    const timeDiff = Math.abs(today.getTime() - reportDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return "Bugün";
    if (daysDiff === 1) return "Dün";
    if (daysDiff < 7) return `${daysDiff} gün önce`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} hafta önce`;
    if (daysDiff < 365) return `${Math.floor(daysDiff / 30)} ay önce`;
    return `${Math.floor(daysDiff / 365)} yıl önce`;
  }

  function getUserInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  let searchTimeout: number;
  $: {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (searchValue !== undefined) {
        activePage = 1;
        fetchReportsData();
      }
    }, 500) as unknown as number;
  }
</script>

<svelte:head>
  <title>Raporlar - Yönetici Paneli - Kronos</title>
  <meta
    name="description"
    content="Kronos Raporlama Sistemi - Tüm Kullanıcı Raporlarını Yönet"
  />
</svelte:head>

<div class="min-h-screen">
  <Header
    theme={$themeStore}
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
  >
    <SearchBar
      placeholder="Kullanıcı, ekip veya rapor ara..."
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
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Kullanıcı Raporları
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Tüm ekip üyelerinin haftalık raporlarını görüntüleyin ve inceleyin.
            </p>
          </div>
          
          <button
            on:click={exportReports}
            disabled={isExporting || reportsList.length === 0}
            class="px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-md"
          >
            {#if isExporting}
              <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            {/if}
            Export CSV
          </button>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-4">
          <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div class="flex-1 relative w-full">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔍 Kullanıcı Ara
              </label>
              <div class="relative">
                <input
                  type="text"
                  placeholder="İsim, email veya ekip ara..."
                  bind:value={userSearchQuery}
                  on:input={(e) => handleUserSearch(e.currentTarget.value)}
                  on:focus={() => userSearchResults.length > 0 && (showUserDropdown = true)}
                  class="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
                {#if selectedUser}
                  <button
                    on:click={clearUserFilter}
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                {/if}

                {#if showUserDropdown && userSearchResults.length > 0}
                  <div class="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                    {#each userSearchResults as user}
                      <button
                        on:click={() => selectUser(user)}
                        class="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-semibold text-gray-900 dark:text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          <p class="text-xs text-gray-400 dark:text-gray-500">
                            {user.squad} · {user.title}
                          </p>
                        </div>
                        <span class="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {user.reportCount} rapor
                        </span>
                      </button>
                    {/each}
                  </div>
                {/if}

                {#if isSearchingUsers}
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg class="w-5 h-5 animate-spin text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                {/if}
              </div>

              {#if selectedUser}
                <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-white text-sm font-bold">
                        {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                      </div>
                      <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">
                          {selectedUser.firstName} {selectedUser.lastName}
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">
                          {selectedUser.squad} · {selectedUser.reportCount} rapor
                        </p>
                      </div>
                    </div>
                    <button
                      on:click={clearUserFilter}
                      class="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      Filtreyi Kaldır
                    </button>
                  </div>
                </div>
              {/if}
            </div>

            <div class="flex flex-col">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                &nbsp;
              </label>
              <button
                on:click={() => showAdvancedFilters = !showAdvancedFilters}
                class="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Gelişmiş Filtreler
                <svg class="w-4 h-4 transition-transform {showAdvancedFilters ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {#if showAdvancedFilters}
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ekip
                  </label>
                  <select
                    bind:value={selectedSquad}
                    on:change={() => handleSquadChange(selectedSquad)}
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-100"
                  >
                    {#each squadOptions as option}
                      <option value={option.value}>{option.label}</option>
                    {/each}
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    bind:value={dateRangeStart}
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    bind:value={dateRangeEnd}
                    class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      {#if !isLoadingData && statistics}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Toplam Rapor
                </p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">
                  {statistics.totalReports}
                </p>
              </div>
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  İncelenmemiş
                </p>
                <p class="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {statistics.pendingReports}
                </p>
              </div>
              <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  İncelenmiş
                </p>
                <p class="text-3xl font-bold text-green-600 dark:text-green-400">
                  {statistics.reviewedReports}
                </p>
              </div>
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex flex-wrap gap-3">
              {#each filterOptions as filter}
                <button
                  on:click={() => handleFilterChange(filter.value)}
                  class="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 {activeFilter === filter.value
                    ? 'bg-blue-100 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-blue-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                >
                  <span class="mr-2">{filter.icon}</span>
                  {filter.label}
                </button>
              {/each}
            </div>

            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">Sırala:</span>
              <select
                bind:value={sortOrder}
                on:change={() => handleSortChange(sortOrder)}
                class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-100 transition-all"
              >
                {#each sortOptions as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>
          </div>

          {#if showBulkActions}
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-blue-100 dark:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="font-semibold text-blue-100 dark:text-blue-200">
                    {selectedReports.size} rapor seçildi
                  </span>
                </div>
                <div class="flex gap-2">
                  <button
                    on:click={bulkMarkAsReviewed}
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Tümünü İncele
                  </button>
                  <button
                    on:click={bulkMarkAsUnreviewed}
                    class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Geri Al
                  </button>
                  <button
                    on:click={() => { selectedReports.clear(); selectedReports = selectedReports; showBulkActions = false; }}
                    class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>

      {#if isLoadingData}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {#each Array(6) as _}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-pulse">
              <div class="flex items-start gap-4 mb-4">
                <div class="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-xl"></div>
                <div class="flex-1 space-y-3">
                  <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div class="flex gap-3 mb-4">
                <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
                <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded flex-1"></div>
              </div>
              <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          {/each}
        </div>
      {:else if reportsList.length === 0}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-16 text-center">
          <div class="text-8xl mb-6">📋</div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Rapor Bulunamadı
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {activeFilter !== "all" 
              ? "Seçili filtreye uygun rapor bulunamadı." 
              : "Henüz oluşturulmuş rapor bulunmuyor."}
          </p>
        </div>
      {:else}
        {#if reportsList.length > 0}
          <div class="mb-4 flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedReports.size === reportsList.length && reportsList.length > 0}
                on:change={toggleSelectAll}
                class="w-5 h-5 text-blue-100 border-gray-300 rounded focus:ring-blue-100"
              />
              <span class="font-medium text-gray-700 dark:text-gray-300">
                Tümünü Seç ({reportsList.length} rapor)
              </span>
            </label>
          </div>
        {/if}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {#each reportsList as report}
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden {selectedReports.has(report.id) ? 'ring-2 ring-blue-500' : ''}">
              <div class="p-6">
                <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedReports.has(report.id)}
                    on:change={() => toggleReportSelection(report.id)}
                    class="w-5 h-5 text-blue-100 border-gray-300 rounded focus:ring-blue-100 cursor-pointer flex-shrink-0"
                  />
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {getUserInitials(report.user.firstName, report.user.lastName)}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {report.user.firstName} {report.user.lastName}
                    </h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {report.user.squad}
                    </p>
                  </div>
                  {#if report.isReviewed}
                    <span class="px-3 py-1 text-xs font-bold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      İncelendi
                    </span>
                  {:else}
                    <span class="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                      </svg>
                      Bekliyor
                    </span>
                  {/if}
                </div>

                <div class="mb-4">
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {report.title}
                  </h3>
                  <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="font-medium">{report.startDate} - {report.endDate}</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500">
                    {calculateDaysAgo(report.endDate)}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                    <div class="flex items-center gap-2 mb-1">
                      <svg class="w-4 h-4 text-blue-100 dark:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">Task</span>
                    </div>
                    <p class="text-xl font-bold text-blue-100 dark:text-blue-300">
                      {report.taskCount}
                    </p>
                  </div>

                  <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                    <div class="flex items-center gap-2 mb-1">
                      <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">Saat</span>
                    </div>
                    <p class="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {report.totalHours}h
                    </p>
                  </div>
                </div>

                <div class="flex gap-3">
                  <button
                    on:click={() => viewReportDetails(report.id)}
                    class="flex-1 px-4 py-2.5 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Görüntüle
                  </button>

                  <button
                    on:click={() => toggleReviewStatus(report)}
                    class="px-4 py-2.5 rounded-lg font-semibold transition-all {report.isReviewed
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      : 'bg-green-600 hover:bg-green-700 text-white'} flex items-center gap-2"
                  >
                    {#if report.isReviewed}
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Geri Al
                    {:else}
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      İncele
                    {/if}
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if totalPageCount > 1}
          <div class="flex justify-center items-center gap-2 mt-8">
            <button
              on:click={() => handlePageSwitch(activePage - 1)}
              disabled={activePage === 1}
              class="px-4 py-2 rounded-lg font-medium transition-colors {activePage === 1
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
            >
              ← Önceki
            </button>

            {#each Array(totalPageCount) as _, index}
              {#if index + 1 === 1 || index + 1 === totalPageCount || (index + 1 >= activePage - 1 && index + 1 <= activePage + 1)}
                <button
                  on:click={() => handlePageSwitch(index + 1)}
                  class="px-4 py-2 rounded-lg font-medium transition-colors {activePage === index + 1
                    ? 'bg-blue-100 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
                >
                  {index + 1}
                </button>
              {:else if index + 1 === activePage - 2 || index + 1 === activePage + 2}
                <span class="px-2 text-gray-500">...</span>
              {/if}
            {/each}

            <button
              on:click={() => handlePageSwitch(activePage + 1)}
              disabled={activePage === totalPageCount}
              class="px-4 py-2 rounded-lg font-medium transition-colors {activePage === totalPageCount
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
            >
              Sonraki →
            </button>
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>

