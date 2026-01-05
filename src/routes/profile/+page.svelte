<script lang="ts">
  import { onMount } from "svelte";
  import ProfilePage from "$lib/components/modules/Profile/ProfilePage.svelte";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import SearchBar from "$lib/components/ui/SearchBar/SearchBar.svelte";
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
  <title>Profil - Kronos</title>
  <meta
    name="description"
    content="Kullanıcı profil sayfası. Kişisel bilgilerinizi, kariyer bilgilerini ve sertifikalarınızı yönetin."
  />
  <link rel="preconnect" href="data:" crossorigin="anonymous" />
  <meta name="theme-color" content="#1e293b" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
    bind:searchValue
  >
    <SearchBar
      placeholder="Profil ara..."
      bind:value={searchValue}
      icon="search"
      size="medium"
    />
  </Header>

  <Sidebar bind:isOpen={isSidebarOpen} />

  <main
    class="transition-all duration-300 pt-8 {isSidebarOpen
      ? 'ml-0 md:ml-64'
      : 'ml-0'}"
  >
    <ProfilePage />
  </main>
</div>
