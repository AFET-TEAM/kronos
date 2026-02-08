<script lang="ts">
  import { onMount } from "svelte";
  import { userStore } from "$lib/store/store.js";
  import { goto } from "$app/navigation";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import SystemSettings from "$lib/components/modules/Admin/SystemSettings.svelte";
  import { themeStore } from "$lib/store/themeStore.js";

  let isSidebarOpen = true;

  onMount(() => {
    const currentUser = $userStore;

    if (currentUser.role !== "admin") {
      goto("/dashboard");
    }

    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
  });
</script>

<svelte:head>
  <title>Sistem Ayarları - Kronos</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
  />

  <Sidebar bind:isOpen={isSidebarOpen} />

  <main
    class="transition-all duration-300 pt-16 {isSidebarOpen
      ? 'ml-0 md:ml-64'
      : 'ml-0'}"
  >
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <SystemSettings />
    </div>
  </main>
</div>
