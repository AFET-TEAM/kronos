<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let icon: string = "📊";
  export let loading: boolean = false;
</script>

<div
  class="stat-card rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
>
  {#if loading}
    <div class="animate-pulse">
      <div class="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4 mb-4"></div>
      <div class="h-8 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">
        {title}
      </h3>
      <span class="text-xl opacity-80">{icon}</span>
    </div>
    <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
      {value}
    </p>
  {/if}
</div>

<style>
  .stat-card {
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
