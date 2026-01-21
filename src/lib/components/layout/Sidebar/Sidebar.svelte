<script lang="ts">
  import { onMount } from "svelte";
  import ProfileCard from "../../ui/ProfileCard/ProfileCard.svelte";
  import Button from "../../ui/Button/Button.svelte";
  import { userStore } from "$lib/store/store.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { logout } from "$lib/services/auth.service.js";
  import { toastStore } from "$lib/store/toastStore.js";

  export let isOpen: boolean = false;

  // Loading durumu:
  // SSR + ilk hydration anında (F5) yanlış rol menüsü "flash" etmesin diye skeleton göster.
  // Ayrıca kullanıcı datası gelmemişse skeleton devam etsin.
  let isHydrated = false;
  onMount(() => {
    isHydrated = true;
  });
  $: isLoading = !isHydrated || !$userStore.email;

  $: userName =
    $userStore.firstName && $userStore.lastName
      ? `${$userStore.firstName} ${$userStore.lastName}`
      : $userStore.email || "User Profile";

  $: currentPath = $page.url.pathname;
  $: isManager = $userStore.role === "manager" || $userStore.role === "admin";

  function isActive(path: string): boolean {
    if (path === "/" || path === "/dashboard") {
      return currentPath === "/" || currentPath === "/dashboard";
    }
    if (path === "/manager") {
      return currentPath.startsWith("/manager");
    }
    return currentPath === path;
  }

  async function handleLogout() {
    try {
      await logout();
      userStore.set({
        email: "",
        firstName: "",
        lastName: "",
        title: "",
        squad: "",
        department: "",
        avatarUrl: "",
        role: "user",
        startDate: "",
        projects: [],
        trainings: [],
        awards: [],
        certifications: [],
      });
      toastStore.success("Başarıyla çıkış yapıldı");
      // window.location.href kullanarak tam sayfa yenileme ile yönlendir
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      toastStore.error("Çıkış yapılırken hata oluştu");
      // Hata olsa bile yönlendir
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }
</script>

<div
  class="sidebar fixed top-12 left-0 h-[calc(100vh-3rem)] w-64 bg-blue-100 dark:bg-gray-900 shadow-lg transition-transform duration-300 z-30 transform {isOpen
    ? 'translate-x-0'
    : '-translate-x-full'}"
>
  <div class="flex flex-col h-full justify-between">
    <nav class="mt-4 space-y-2 overflow-y-auto">
      {#if isLoading}
        <!-- Skeleton Loading -->
        <div class="px-3 mb-4">
          <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2 animate-pulse"></div>
        </div>
        {#each Array(3) as _}
          <div class="px-5 py-2">
            <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        {/each}
      {:else if !isManager}
        <!-- Normal User Menüleri -->
        <div class="px-3">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Menü
          </p>
        </div>

        <a
          href="/"
          class="flex items-center gap-3 w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
            '/'
          )
            ? 'bg-blue-200'
            : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Ana Sayfa
        </a>

        <a
          href="/kpi"
          class="flex items-center gap-3 w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
            '/kpi'
          )
            ? 'bg-blue-200'
            : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          KPI
        </a>

        <a
          href="/archive"
          class="flex items-center gap-3 w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
            '/archive'
          )
            ? 'bg-blue-200'
            : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Arşiv
        </a>
      {:else}
        <!-- Manager/Admin Menüleri -->
        <div class="px-3">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Yönetici Panel
          </p>
        </div>

        <a
          href="/manager"
          class="flex items-center gap-3 w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
            '/manager'
          ) && currentPath === '/manager'
            ? 'bg-blue-200'
            : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Dashboard
        </a>

        <a
          href="/manager/users"
          class="flex items-center gap-3 w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
            '/manager/users'
          )
            ? 'bg-blue-200'
            : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Kullanıcı Yönetimi
        </a>

        <a
          href="/manager/organization"
          class="flex items-center gap-3 w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
            '/manager/organization'
          )
            ? 'bg-blue-200'
            : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Organizasyon Şeması
        </a>

        <a
          href="/manager/reports"
          class="flex items-center gap-3 w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
            '/manager/reports'
          )
            ? 'bg-blue-200'
            : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Rapor Yönetimi
        </a>
      {/if}
    </nav>

    <div
      class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4 flex flex-col"
    >
      <div class="flex-1 px-4">
        {#if isLoading}
          <!-- ProfileCard Skeleton -->
          <div class="flex flex-col items-center text-center px-4 py-4 mb-5 space-y-1 w-full">
            <div class="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse mb-2"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse mb-1"></div>
            <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse mb-1"></div>
            <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
          <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        {:else}
          <ProfileCard
            name={userName}
            title={$userStore.title || ""}
            squad={$userStore.squad || ""}
            avatarUrl={$userStore.avatarUrl || ""}
            onClick={() => (location.href = "/profile")}
          />
        {/if}
      </div>

      <button
        on:click={handleLogout}
        class="w-full flex items-center justify-start gap-2 text-sm font-semibold text-white bg-blue-200 hover:bg-blue-950 py-3 pl-4 transition border-t border-blue-950"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7"
          />
        </svg>
        Logout
      </button>
    </div>
  </div>
</div>
