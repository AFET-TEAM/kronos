<script lang="ts">
  import { dailyReportsStore } from "$lib/store/reportStore.js";

  export let day: string;
  export let date: string;
  export let hasReport: boolean = false;
  export let taskCount: number = 0;
  export let onAddReport: (() => void) | undefined = undefined;

  let actualHasReport = false;
  let actualTaskCount = 0;

  // DD.MM.YYYY formatını Date objesine çevir
  function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Date objesini Türkçe formatta göster
  function formatDateDisplay(dateStr: string): string {
    try {
      const date = parseDate(dateStr);
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      });
    } catch (e) {
      return dateStr; // Parse edilemezse olduğu gibi döndür
    }
  }

  $: {
    // Store'dan kontrol et
    const report = $dailyReportsStore.get(date);
    if (report) {
      actualHasReport =
        report.isOnLeave ||
        report.tasks.some((t) => t.taskName) ||
        !!report.blockers ||
        !!report.meetings ||
        !!report.untrackedWork;
      actualTaskCount = report.tasks.filter((t) => t.taskName).length;
    } else {
      // Store'da yoksa prop'tan al
      actualHasReport = hasReport;
      actualTaskCount = taskCount;
    }
  }

  function handleClick() {
    if (onAddReport) {
      onAddReport();
    }
  }
</script>

<div
  class="weekly-day-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 {actualHasReport
    ? 'border-green-500 dark:border-green-600'
    : 'border-gray-200 dark:border-gray-700'}"
  on:click={handleClick}
  on:keydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
  role="button"
  tabindex="0"
>
  <div class="flex items-start justify-between mb-3">
    <div>
      <h3 class="font-semibold text-gray-900 dark:text-white text-sm">
        {day}
      </h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {formatDateDisplay(date)}
      </p>
    </div>
    {#if actualHasReport}
      <span class="text-green-500 dark:text-green-400">
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
    {/if}
  </div>

  <div class="mt-4">
    {#if actualHasReport}
      {#if $dailyReportsStore.get(date)?.isOnLeave}
        <p class="text-sm font-medium text-sky-600 dark:text-sky-400">
          🏖️ İzinli
        </p>
      {:else}
        <div class="space-y-2">
          <p class="text-sm font-medium text-green-600 dark:text-green-400">
            ✅ Rapor girildi
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {actualTaskCount} Task tamamlandı
          </p>
        </div>
      {/if}
    {:else}
      <button
        class="w-full py-2 px-3 bg-blue-100 hover:bg-blue-200 text-white text-sm font-medium rounded-md transition-colors duration-200"
        on:click|stopPropagation={handleClick}
      >
        + Rapor Ekle
      </button>
    {/if}
  </div>
</div>

<style>
  .weekly-day-card {
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .weekly-day-card:hover {
    transform: translateY(-2px);
  }
</style>
