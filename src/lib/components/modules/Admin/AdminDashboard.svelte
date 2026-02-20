<script lang="ts">
  import { onMount } from "svelte";
  import StatCard from "../../ui/StatCard/StatCard.svelte";
  import Button from "../../ui/Button/Button.svelte";
  import {
    getAdminDashboardKPI,
    getRecentActivities,
    type RecentActivity,
  } from "$lib/services/admin.service.js";
  import { goto } from "$app/navigation";
  import { getErrorMessage } from "$lib/services/errorHandler.js";
  import { parseTRDate } from "$lib/utils/dateUtils.js";

  let dashboardData: any = null;
  let activities: RecentActivity[] = [];
  let loading = true;
  let errorMessage = "";
  let selectedDepartment = "all";
  let searchQuery = "";
  let currentPage = 1;
  const itemsPerPage = 5;

  $: filteredUsers = dashboardData?.users.filter((user: any) => {
    const matchesDept = selectedDepartment === "all" || user.department === selectedDepartment;
    const matchesSearch = searchQuery === "" || 
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  }) || [];

  $: totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  $: paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  $: departments = [...new Set(dashboardData?.users.map((u: any) => u.department) || [])];

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }

  $: if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  onMount(async () => {
    await loadAdminData();
    // Son Aktiviteler'i her 30 saniyede bir güncelle
    const interval = setInterval(async () => {
      try {
        activities = await getRecentActivities();
      } catch (error) {
        console.error('Son aktiviteler güncellenemedi:', error);
      }
    }, 30000);
    return () => clearInterval(interval);
  });

  async function loadAdminData() {
    loading = true;
    errorMessage = "";
    try {
      [dashboardData, activities] = await Promise.all([
        getAdminDashboardKPI(),
        getRecentActivities(),
      ]);
    } catch (error) {
      errorMessage = getErrorMessage(error);
    } finally {
      loading = false;
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case "user_created":
        return "👤";
      case "report_submitted":
      case "report_created":
        return "📝";
      case "user_login":
        return "🔐";
      case "role_changed":
        return "🔄";
      default:
        return "📌";
    }
  }

  function formatDate(timestamp: string) {
    const date = parseTRDate(timestamp) || new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days === 1) return "Dün";
    return `${days} gün önce`;
  }

  function getCompletionColor(rate: number) {
    if (rate >= 80) return "text-green-600 dark:text-green-400";
    if (rate >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }

  function getInitials(userName: string) {
    const parts = (userName || "").trim().split(/\s+/);
    const a = parts[0]?.charAt(0)?.toUpperCase() || "";
    const b = parts[1]?.charAt(0)?.toUpperCase() || "";
    return (a + b) || "?";
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Manager Dashboard
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Tüm kullanıcıların performans istatistikleri
      </p>
    </div>
  </div>

  {#if errorMessage}
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
      {errorMessage}
    </div>
  {/if}

  {#if loading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each Array(4) as _}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      {/each}
    </div>
  {:else if dashboardData}
    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Toplam Kullanıcı" value={dashboardData.summary.totalUsers} icon="👥" />
      <StatCard title="Toplam Rapor" value={dashboardData.summary.totalReports} icon="📊" />
      <StatCard title="Ort. Tamamlanma" value={`${dashboardData.summary.avgCompletionRate}%`} icon="🎯" />
      <StatCard title="Toplam Çalışma Saati" value={dashboardData.summary.totalWorkHours} icon="⏰" />
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Kullanıcı ara (isim veya email)..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          bind:value={selectedDepartment}
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tüm Direktörlükler</option>
          {#each departments as dept}
            <option value={dept}>{dept}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Users KPI Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
        <h2 class="text-xl font-bold text-white">Kullanıcı Performans KPI'ları</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Direktörlük
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Raporlar
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Görevler
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tamamlanma
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Çalışma Saati
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fazla Mesai
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {#if dashboardData?.users && dashboardData.users.length > 0}
              {#each paginatedUsers as user}
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    {#if user.avatarUrl}
                      <img 
                        src={user.avatarUrl} 
                        alt={user.userName} 
                        class="w-10 h-10 rounded-full mr-3 object-cover"
                        on:error={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    {/if}
                    <div 
                      class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold mr-3 text-sm"
                      style="display: {user.avatarUrl ? 'none' : 'flex'};"
                    >
                      {getInitials(user.userName)}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {user.userName}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {user.title || '-'}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    {user.department || '-'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white font-semibold">
                  {user.totalReports}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {user.completedTasks} / {user.totalTasks}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span class="text-sm font-bold {getCompletionColor(user.completionRate)}">
                    {user.completionRate}%
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {user.totalWorkHours != null ? `${Number(user.totalWorkHours)} saat` : '0 saat'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 dark:text-white">
                  {user.totalOvertime != null ? `${Number(user.totalOvertime)} saat` : '0 saat'}
                </td>
              </tr>
              {/each}
            {:else}
              <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {dashboardData?.users ? 'Kullanıcı bulunamadı' : 'Veri yükleniyor...'}
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
      
      <!-- Sayfalama -->
      {#if filteredUsers.length > itemsPerPage}
        <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Toplam {filteredUsers.length} kullanıcıdan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)} gösteriliyor
          </div>
          <div class="flex items-center gap-2">
            <button
              on:click={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Önceki
            </button>
            {#each Array(totalPages) as _, i}
              {@const page = i + 1}
              {#if page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
                <button
                  on:click={() => goToPage(page)}
                  class="px-3 py-1 text-sm border rounded-lg {page === currentPage 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}"
                >
                  {page}
                </button>
              {:else if page === currentPage - 2 || page === currentPage + 2}
                <span class="px-2 text-gray-500">...</span>
              {/if}
            {/each}
            <button
              on:click={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Sonraki
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Recent Activities & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activities -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <h2 class="text-xl font-bold text-white">Son Aktiviteler</h2>
        </div>

        <div class="p-6">
          {#if loading}
            <div class="space-y-4">
              {#each Array(5) as _}
                <div class="animate-pulse flex items-start gap-4">
                  <div class="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="space-y-4">
              {#if !activities || activities.length === 0}
                <p class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Henüz aktivite yok</p>
              {:else}
                {#each activities as activity}
                  <div class="flex items-start gap-4">
                    <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-900 dark:text-white">
                        <span class="font-semibold">{activity.user?.firstName ?? ''} {activity.user?.lastName ?? ''}</span>
                        {activity.description ?? 'yeni rapor gönderdi'}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Hızlı Erişim
        </h2>
        <div class="space-y-3">
          <Button
            onClick={() => goto("/manager/users")}
            text="👥 Kullanıcı Yönetimi"
            variant="primary"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
          />
          <Button
            onClick={() => goto("/manager/reports")}
            text="📊 Rapor Yönetimi"
            variant="primary"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          />
          <Button
            onClick={() => goto("/manager/organization")}
            text="🏢 Organizasyon Şeması"
            variant="primary"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          />
        </div>
      </div>
    </div>
  {/if}
</div>
