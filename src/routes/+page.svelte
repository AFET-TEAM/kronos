<script lang="ts">
  import { onMount } from "svelte";
  import "../app.scss";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import Dashboard from "$lib/components/modules/Dashboard/Dashboard.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import { userStore } from "$lib/store/store.js";

  let isSidebarOpen = true;

  // Sayfa yüklenene kadar skeleton göster
  $: isLoading = !$userStore.email;

  onMount(() => {
    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
  });
</script>

<svelte:head>
  <title>Dashboard - Kronos</title>
  <meta
    name="description"
    content="Kronos Raporlama Sistemi - Dashboard ve İstatistikler"
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
    <div class="max-w-6xl mx-auto px-4 py-6">
      {#if isLoading}
        <div class="space-y-8">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {#each Array(3) as _}
              <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 animate-pulse">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            {/each}
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 animate-pulse">
            <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
            <div class="space-y-3">
              {#each Array(3) as _}
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              {/each}
            </div>
          </div>
        </div>
      {:else}
        <Dashboard />
      {/if}
    </div>
  </main>
</div>

<slot />
