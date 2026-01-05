<script lang="ts">
  import { onMount } from "svelte";
  import StatCard from "../../ui/StatCard/StatCard.svelte";
  import Button from "../../ui/Button/Button.svelte";
  import {
    getSystemStats,
    getAllUsers,
    getRecentActivities,
    type SystemStats,
    type AdminUser,
    type RecentActivity,
  } from "$lib/services/admin.service.js";
  import { goto } from "$app/navigation";

  let stats: SystemStats | null = null;
  let users: AdminUser[] = [];
  let activities: RecentActivity[] = [];
  let loading = true;

  onMount(async () => {
    await loadAdminData();
  });

  async function loadAdminData() {
    loading = true;
    try {
      [stats, users, activities] = await Promise.all([
        getSystemStats(),
        getAllUsers(),
        getRecentActivities(),
      ]);
    } catch (error) {
      console.error("Admin data yüklenirken hata:", error);
    } finally {
      loading = false;
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case "user_created":
        return "👤";
      case "report_submitted":
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
    const date = new Date(timestamp);
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

  function getRoleBadgeClass(role: string) {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "manager":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Admin Panel
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        Sistem yönetimi ve istatistikler
      </p>
    </div>
  </div>

  {#if loading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each Array(4) as _}
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse"
        >
          <div
            class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"
          ></div>
          <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      {/each}
    </div>
  {:else if stats}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Toplam Kullanıcı" value={stats.totalUsers} icon="👥" />
      <StatCard title="Aktif Kullanıcı" value={stats.activeUsers} icon="✅" />
      <StatCard title="Toplam Rapor" value={stats.totalReports} icon="📊" />
      <StatCard title="Bu Hafta" value={stats.reportsThisWeek} icon="📅" />
      <StatCard title="Bu Ay" value={stats.reportsThisMonth} icon="📆" />
      <StatCard
        title="Ort. Rapor/Kullanıcı"
        value={stats.avgReportsPerUser}
        icon="📈"
      />
      <StatCard title="Toplam Task" value={stats.totalTasks} icon="✓" />
      <StatCard
        title="Tamamlanma Oranı"
        value={`${stats.completionRate}%`}
        icon="🎯"
      />
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Recent Users -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div
        class="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-4 flex items-center justify-between"
      >
        <h2 class="text-xl font-bold text-white">Kullanıcılar</h2>
        <Button
          onClick={() => goto("/admin/users")}
          text="Tümünü Gör"
          variant="tertiary"
          size="small"
          className="bg-white/20 hover:bg-white/30 text-white border-0"
        />
      </div>

      <div class="p-6">
        {#if loading}
          <div class="space-y-4">
            {#each Array(5) as _}
              <div class="animate-pulse flex items-center gap-4">
                <div
                  class="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full"
                ></div>
                <div class="flex-1 space-y-2">
                  <div
                    class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"
                  ></div>
                  <div
                    class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="space-y-4">
            {#each users.slice(0, 5) as user}
              <div
                class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                on:click={() => goto(`/admin/users/${user.id}`)}
                on:keydown={(e) =>
                  e.key === "Enter" && goto(`/admin/users/${user.id}`)}
                role="button"
                tabindex="0"
              >
                <img
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  class="w-12 h-12 rounded-full ring-2 ring-blue-400"
                  loading="lazy"
                />
                <div class="flex-1 min-w-0">
                  <h3
                    class="font-semibold text-gray-900 dark:text-white truncate"
                  >
                    {user.firstName}
                    {user.lastName}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {user.title}
                  </p>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold {getRoleBadgeClass(
                      user.role
                    )}"
                  >
                    {user.role}
                  </span>
                  <span
                    class="px-2 py-1 rounded-full text-xs font-semibold {getStatusBadgeClass(
                      user.status
                    )}"
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="bg-gradient-to-r from-blue-100 to-blue-200  px-6 py-4">
        <h2 class="text-xl font-bold text-white">Son Aktiviteler</h2>
      </div>

      <div class="p-6">
        {#if loading}
          <div class="space-y-4">
            {#each Array(5) as _}
              <div class="animate-pulse flex items-start gap-4">
                <div
                  class="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"
                ></div>
                <div class="flex-1 space-y-2">
                  <div
                    class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"
                  ></div>
                  <div
                    class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="space-y-4">
            {#each activities as activity}
              <div class="flex items-start gap-4">
                <div
                  class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200  rounded-full flex items-center justify-center text-white text-lg flex-shrink-0"
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-white">
                    <span class="font-semibold"
                      >{activity.user.firstName} {activity.user.lastName}</span
                    >
                    {activity.description}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
      Hızlı Erişim
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        onClick={() => goto("/admin/users")}
        text="👥 Kullanıcı Yönetimi"
        variant="primary"
      />
      <Button
        onClick={() => goto("/admin/reports")}
        text="📊 Rapor Yönetimi"
        variant="primary"
      />
      <Button
        onClick={() => goto("/admin/settings")}
        text="⚙️ Sistem Ayarları"
        variant="tertiary"
      />
    </div>
  </div>
</div>
