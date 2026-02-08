<script lang="ts">
  import { dailyReportsStore } from "$lib/store/reportStore.js";

  export let day: string;
  export let date: string;
  export let hasReport: boolean = false;
  export let taskCount: number = 0;
  /** Pazartesi, Salı, Çarşamba, Cuma, Cumartesi, Pazar için true; Perşembe için false */
  export let canAddReport: boolean = true;
  export let onAddReport: (() => void) | undefined = undefined;

  let actualHasReport = false;
  let actualTaskCount = 0;

  function parseDate(dateStr: string): Date {
    const [d, month, year] = dateStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(d));
  }

  function formatDateDisplay(dateStr: string): string {
    try {
      return parseDate(dateStr).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  }

  $: {
    const report = $dailyReportsStore.get(date);
    if (report) {
      actualHasReport =
        report.isOnLeave ||
        report.tasks.some((t) => t.taskName) ||
        !!report.untrackedWork;
      actualTaskCount = report.tasks.filter((t) => t.taskName).length;
    } else {
      actualHasReport = hasReport;
      actualTaskCount = taskCount;
    }
  }

  $: isInteractive = canAddReport && onAddReport;

  function handleClick() {
    if (isInteractive && onAddReport) onAddReport();
  }
</script>

<div
  class="weekly-day-card rounded-xl border bg-slate-50 dark:bg-slate-800/80 p-4 transition-all duration-200 {isInteractive
    ? 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
    : 'cursor-default opacity-90'} {actualHasReport
    ? 'border-emerald-200 dark:border-emerald-800/60'
    : canAddReport
      ? 'border-slate-200 dark:border-slate-600'
      : 'border-slate-100 dark:border-slate-700'}"
  on:click={handleClick}
  on:keydown={(e) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick();
    }
  }}
  role={isInteractive ? 'button' : 'article'}
  tabindex={isInteractive ? 0 : -1}
>
  <div class="flex items-start justify-between mb-3">
    <div>
      <h3
        class="font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-tight"
      >
        {day}
      </h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        {formatDateDisplay(date)}
      </p>
    </div>
    {#if actualHasReport}
      <span
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
        aria-hidden="true"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    {:else if !canAddReport}
      <span
        class="text-xs text-slate-400 dark:text-slate-500 font-medium"
        aria-hidden="true"
      >
        —
      </span>
    {/if}
  </div>

  <div class="mt-3">
    {#if actualHasReport}
      {#if $dailyReportsStore.get(date)?.isOnLeave}
        <p class="text-sm font-medium text-sky-600 dark:text-sky-400">
          İzinli
        </p>
      {:else}
        <p class="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Rapor girildi
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {actualTaskCount} görev
        </p>
      {/if}
    {:else if canAddReport}
      <span
        class="inline-flex items-center justify-center w-full py-2 px-3 rounded-lg text-sm font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
      >
        Rapor Ekle
      </span>
    {:else}
      <p class="text-xs text-slate-400 dark:text-slate-500">
        Rapor girilmez
      </p>
    {/if}
  </div>
</div>

<style>
  .weekly-day-card {
    min-height: 132px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
