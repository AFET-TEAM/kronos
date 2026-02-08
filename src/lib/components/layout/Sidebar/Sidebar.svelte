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
      : $userStore.email || "Profil";

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
  class="sidebar fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm transition-transform duration-300 z-30 transform overflow-hidden flex flex-col {isOpen
    ? 'translate-x-0'
    : '-translate-x-full'}"
>
  <div class="flex flex-col h-full min-h-0">
    <nav class="flex-1 min-h-0 mt-4 space-y-0.5 overflow-y-auto overflow-x-hidden px-3">
      {#if isLoading}
        <div class="px-2 mb-4">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2 animate-pulse"></div>
        </div>
        {#each Array(3) as _}
          <div class="px-3 py-2.5">
            <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        {/each}
      {:else if !isManager}
        <div class="px-3 pb-2">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Menü
          </p>
        </div>

        <a
          href="/"
          class="nav-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive(
            '/'
          )
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'}"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Ana Sayfa
        </a>

        <a
          href="/kpi"
          class="nav-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive(
            '/kpi'
          )
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'}"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          KPI
        </a>

        <a
          href="/archive"
          class="nav-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive(
            '/archive'
          )
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'}"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Arşiv
        </a>
      {:else}
        <div class="px-3 pb-2">
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Yönetici Panel
          </p>
        </div>

        <a
          href="/manager"
          class="nav-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive(
            '/manager'
          ) && currentPath === '/manager'
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'}"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Dashboard
        </a>

        <a
          href="/manager/users"
          class="nav-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive(
            '/manager/users'
          )
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'}"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Kullanıcı Yönetimi
        </a>

        <a
          href="/manager/organization"
          class="nav-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive(
            '/manager/organization'
          )
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'}"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Organizasyon Şeması
        </a>

        <a
          href="/manager/reports"
          class="nav-link flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive(
            '/manager/reports'
          )
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80'}"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Rapor Yönetimi
        </a>
      {/if}
    </nav>

    <div class="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 pt-4 pb-1 flex flex-col">
      <div class="px-3">
        {#if isLoading}
          <div class="flex flex-col items-center text-center px-3 py-4 mb-4 space-y-2 w-full">
            <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse"></div>
          </div>
          <div class="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        {:else}
          <ProfileCard
            name={userName}
            squad={$userStore.squad || ""}
            department={$userStore.department || ""}
            avatarUrl={$userStore.avatarUrl || ""}
            onClick={() => (location.href = "/profile")}
          />
        {/if}
      </div>

      <div class="px-3 mt-4 mb-3 shrink-0">
        <button
          type="button"
          on:click={handleLogout}
          class="sidebar-logout flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          Çıkış Yap
        </button>
      </div>
    </div>
  </div>
</div>
