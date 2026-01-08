<script lang="ts">
  import { onMount } from "svelte";
  import "../app.scss";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import SearchBar from "$lib/components/ui/SearchBar/SearchBar.svelte";
  import Dashboard from "$lib/components/modules/Dashboard/Dashboard.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import { userStore } from "$lib/store/store.js";

  let isSidebarOpen = true;
  let searchValue = "";

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

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
    bind:searchValue
  >
    <SearchBar
      placeholder="Rapor ara..."
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
      {#if isLoading}
        <!-- Dashboard Skeleton -->
        <div class="space-y-8">
          <!-- Stats Skeleton -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {#each Array(5) as _}
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            {/each}
          </div>
          <!-- Content Skeleton -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
            <div class="space-y-3">
              {#each Array(3) as _}
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
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
