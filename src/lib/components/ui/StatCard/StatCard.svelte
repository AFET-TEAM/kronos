<script lang="ts">
  export let title: string;
  export let value: string | number;
  export let icon: string = "📊";
  export let loading: boolean = false;
</script>

<div
  class="stat-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
>
  {#if loading}
    <div class="animate-pulse">
      <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
      <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
  {:else}
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      <span class="text-2xl">{icon}</span>
    </div>
    <p class="text-3xl font-bold text-gray-900 dark:text-white">
      {value}
    </p>
  {/if}
</div>

<style>
  .stat-card {
    min-height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
