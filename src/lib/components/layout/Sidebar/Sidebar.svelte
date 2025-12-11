<script lang="ts">
  import ProfileCard from "../../ui/ProfileCard/ProfileCard.svelte";
  import Button from "../../ui/Button/Button.svelte";
  import { userStore } from "$lib/store/store.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { logout } from "$lib/services/auth.service.js";
  import { toastStore } from "$lib/store/toastStore.js";

  export let isOpen: boolean = false;

  $: userName =
    $userStore.firstName && $userStore.lastName
      ? `${$userStore.firstName} ${$userStore.lastName}`
      : $userStore.email || "User Profile";

  $: currentPath = $page.url.pathname;

  function isActive(path: string): boolean {
    if (path === "/" || path === "/dashboard") {
      return currentPath === "/" || currentPath === "/dashboard";
    }
    if (path === "/admin") {
      return currentPath.startsWith("/admin");
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
        avatarUrl: "",
        role: "user",
        startDate: "",
        projects: [],
        trainings: [],
        awards: [],
        certifications: [],
      });
      toastStore.success("Başarıyla çıkış yapıldı");
      goto("/login");
    } catch (error) {
      toastStore.error("Çıkış yapılırken hata oluştu");
    }
  }
</script>

<div
  class="sidebar fixed top-12 left-0 h-[calc(100vh-3rem)] w-64 bg-blue-100 dark:bg-gray-900 shadow-lg transition-transform duration-300 z-30 transform {isOpen
    ? 'translate-x-0'
    : '-translate-x-full'}"
>
  <div class="flex flex-col h-full justify-between">
    <nav class="mt-4 space-y-2">
      <a
        href="/"
        class="block w-full px-5 py-2 rounded font-medium text-white transition-all duration-300  relative {isActive(
          '/'
        )
          ? 'bg-blue-200'
          : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >Ana Sayfa</a
      >
      <a
        href="/kpi"
        class="block w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
          '/kpi'
        )
          ? 'bg-blue-200'
          : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >KPI</a
      >
      <a
        href="/archive"
        class="block w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
          '/archive'
        )
          ? 'bg-blue-200'
          : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >Arşiv</a
      >
      <a
        href="/reports"
        class="block w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
          '/reports'
        )
          ? 'bg-blue-200'
          : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >Raporlar</a
      >
      {#if $userStore.role === "admin"}
        <a
          href="/admin"
          class="block w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
            '/admin'
          )
            ? 'bg-blue-200'
            : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
          >Admin</a
        >
      {/if}
      <a
        href="/profile"
        class="block w-full px-5 py-2 rounded font-medium text-white transition-all duration-300 relative {isActive(
          '/profile'
        )
          ? 'bg-blue-200'
          : 'hover:bg-blue-400 hover:w-[calc(100%+20px)] hover:ml-[-10px] dark:hover:bg-gray-700'}"
        >Profil</a
      >
    </nav>

    <div
      class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4 flex flex-col"
    >
      <div class="flex-1 px-4">
        <ProfileCard
          name={userName}
          title={$userStore.title || "Frontend Developer"}
          squad={$userStore.squad || "DC-CORPORATE"}
          avatarUrl={$userStore.avatarUrl || ""}
          onClick={() => (location.href = "/profile")}
        />
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
