<script lang="ts">
  import { onMount } from "svelte";
  import "../app.scss";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import SearchBar from "$lib/components/ui/SearchBar/SearchBar.svelte";
  import Dashboard from "$lib/components/modules/Dashboard/Dashboard.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { themeStore } from "$lib/store/themeStore.js";

  let isSidebarOpen = true;
  let searchValue = "";

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
    theme={$themeStore}
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
      <Dashboard />
    </div>
  </main>
</div>

<slot />
