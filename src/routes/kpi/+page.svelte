<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import { userStore } from "$lib/store/store.js";
  import { goto } from "$app/navigation";
  import {
    getUserKPIs,
    getProductivityScoreColor,
    getProductivityScoreEmoji,
    getTaskStatusLabel,
    getTaskStatusColor,
    type UserKPIData,
    type KPIPeriod,
    type TasksByStatus,
  } from "$lib/services/kpiService.js";
  import { getErrorMessage } from "$lib/services/errorHandler.js";

  let isSidebarOpen = true;
  let isLoading = true;
  let errorMessage = "";

  // KPI Data
  let kpiData: UserKPIData | null = null;
  let period: KPIPeriod | null = null;

  // Period selection (hafta / ay / çeyrek)
  let selectedPeriod: "week" | "month" | "quarter" = "month";

  onMount(() => {
    const currentUser = $userStore;

    // Sadece user rolü erişebilir (manager erişemez)
    if (currentUser.role !== "user") {
      goto("/dashboard");
    }

    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
    fetchKPIData();
  });

  async function fetchKPIData() {
    isLoading = true;
    errorMessage = "";
    try {
      const response = await getUserKPIs(undefined, undefined, selectedPeriod);
      
      if (!response || !response.data) {
        errorMessage = 'KPI verileri alınamadı';
        kpiData = null;
        period = null;
        return;
      }
      
      kpiData = response.data;
      period = response.period;
    } catch (err) {
      errorMessage = getErrorMessage(err);
      kpiData = null;
      period = null;
    } finally {
      isLoading = false;
    }
  }

  function handlePeriodChange(newPeriod: "week" | "month" | "quarter") {
    selectedPeriod = newPeriod;
    fetchKPIData();
  }

  function getScoreColorClass(score: number): string {
    const color = getProductivityScoreColor(score);
    const colors: Record<string, string> = {
      green: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      blue: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      yellow: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      orange: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      red: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    return colors[color] || colors.blue;
  }

  function getStatusColorClass(status: string): string {
    const color = getTaskStatusColor(status as any);
    const colors: Record<string, string> = {
      green: "bg-green-500",
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      gray: "bg-gray-500",
    };
    return colors[color] || colors.gray;
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    // DD.MM.YYYY formatını parse et
    const [day, month, year] = dateStr.split(".");
    if (!day || !month || !year) return dateStr;
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  }

  function getTaskStatusLabelForDisplay(status: string): string {
    return getTaskStatusLabel(status as keyof TasksByStatus);
  }
</script>

<svelte:head>
  <title>KPI - Performans Göstergeleri - Kronos</title>
  <meta
    name="description"
    content="Kronos KPI Sayfası - Performans metriklerinizi görüntüleyin"
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
          Performans Göstergeleri (KPI)
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Çalışma performansınızı ve istatistiklerinizi görüntüleyin
        </p>
      </div>

      <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex flex-wrap gap-2">
            <button
              on:click={() => handlePeriodChange("week")}
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedPeriod ===
                'week'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}"
            >
              Bu Hafta
            </button>
            <button
              on:click={() => handlePeriodChange("month")}
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedPeriod ===
                'month'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}"
            >
              Bu Ay
            </button>
            <button
              on:click={() => handlePeriodChange("quarter")}
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {selectedPeriod ===
                'quarter'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}"
            >
              Bu Çeyrek
            </button>
          </div>

          {#if period}
            <div class="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {formatDate(period.startDate)} – {formatDate(period.endDate)}
            </div>
          {/if}
        </div>
      </div>

      {#if isLoading}
        <!-- Loading State -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {#each Array(4) as _}
            <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 animate-pulse">
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-4"></div>
              <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
          {/each}
        </div>
      {:else if errorMessage}
        <!-- Error State -->
        <div
          class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center"
        >
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
            Hata Oluştu
          </h3>
          <p class="text-red-600 dark:text-red-300">{errorMessage}</p>
        </div>
      {:else if kpiData}
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Productivity Score -->
          <div
            class="bg-slate-900 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-white"
          >
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium opacity-90">Verimlilik Skoru</span>
              <span class="text-3xl"
                >{getProductivityScoreEmoji(kpiData.summary.productivityScore)}</span
              >
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-5xl font-bold"
                >{kpiData.summary.productivityScore}</span
              >
              <span class="text-2xl opacity-75">/100</span>
            </div>
            <div class="mt-3 text-sm opacity-90">
              {#if kpiData.summary.productivityScore >= 80}
                Mükemmel performans! 🎉
              {:else if kpiData.summary.productivityScore >= 60}
                İyi gidiyorsun! 👍
              {:else if kpiData.summary.productivityScore >= 40}
                Gelişme var! 📈
              {:else}
                Biraz daha çaba gerekli 💪
              {/if}
            </div>
          </div>

          <!-- Completion Rate -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400"
                >Tamamlanma Oranı</span
              >
              <span class="text-2xl">✅</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span
                class="text-4xl font-bold text-slate-900 dark:text-slate-100"
                >{kpiData.summary.completionRate}%</span
              >
            </div>
            <div class="mt-3 text-sm text-slate-600 dark:text-slate-400">
              {kpiData.summary.completedTasks} / {kpiData.summary.totalTasks} görev
            </div>
          </div>

          <!-- Total Hours -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400"
                >Toplam Çalışma</span
              >
              <span class="text-2xl">⏰</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-bold text-slate-900 dark:text-slate-100"
                >{kpiData.summary.totalHours}</span
              >
              <span class="text-xl text-slate-600 dark:text-slate-400">saat</span>
            </div>
            <div class="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Ortalama: {kpiData.averages.hoursPerDay} saat/gün
            </div>
          </div>

          <!-- Working Days -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400"
                >Çalışma Günü</span
              >
              <span class="text-2xl">📅</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-bold text-slate-900 dark:text-slate-100"
                >{kpiData.summary.workingDays}</span
              >
              <span class="text-xl text-slate-600 dark:text-slate-400">gün</span>
            </div>
            <div class="mt-3 text-sm text-slate-600 dark:text-slate-400">
              İzin: {kpiData.summary.leaveDays} gün
            </div>
          </div>
        </div>

        <!-- Charts and Details -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Task Status Distribution -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <span>📊</span>
              Görev Durumu Dağılımı
            </h3>
            <div class="space-y-4">
              {#each Object.entries(kpiData.tasksByStatus).filter(([status]) => status !== 'XL_BLOCK') as [status, count]}
                {@const percentage =
                  kpiData.summary.totalTasks > 0
                    ? Math.round((count / kpiData.summary.totalTasks) * 100)
                    : 0}
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >{getTaskStatusLabelForDisplay(status)}</span
                    >
                    <span class="text-sm font-bold text-slate-900 dark:text-slate-100"
                      >{count} ({percentage}%)</span
                    >
                  </div>
                  <div
                    class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"
                  >
                    <div
                      class="{getStatusColorClass(status)} h-2.5 rounded-full transition-all duration-500"
                      style="width: {percentage}%"
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Averages -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <span>📈</span>
              Günlük Ortalamalar
            </h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">📝</span>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                      Görev/Gün
                    </p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {kpiData.averages.tasksPerDay}
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">⏱️</span>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                      Saat/Gün
                    </p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {kpiData.averages.hoursPerDay} saat
                    </p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">✔️</span>
                  </div>
                  <div>
                    <p class="text-sm text-slate-600 dark:text-slate-400">
                      Tamamlanan/Gün
                    </p>
                    <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {kpiData.averages.completionRatePerDay}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <span class="text-2xl">📄</span>
              </div>
              <div>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Toplam Rapor
                </p>
                <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {kpiData.summary.totalReports}
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <span class="text-2xl">✨</span>
              </div>
              <div>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Toplam Görev
                </p>
                <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {kpiData.summary.totalTasks}
                </p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>
