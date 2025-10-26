<script lang="ts">
  import ProfileCard from "../../ui/ProfileCard/+profileCard.svelte";
  import Button from "../../ui/Button/+button.svelte";
  import { userStore } from "$lib/store/store.js";

  export let isOpen: boolean = false;

  import { removeAuthToken } from "$lib/services/auth.service.js";

  $: userName =
    $userStore.firstName && $userStore.lastName
      ? `${$userStore.firstName} ${$userStore.lastName}`
      : $userStore.email || "User Profile";

  function handleLogout() {
    removeAuthToken();
    userStore.set({
      email: "",
      firstName: "",
      lastName: "",
      title: "",
      squad: "",
      avatarUrl: "",
    });
    location.href = "/";
  }
</script>

<div
  class={`sidebar fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
>
  <div class="absolute top-4 left-4 z-50">
    <Button
      type="button"
      text="✕"
      variant="secondary"
      size="small"
      theme="light"
      onClick={() => (isOpen = false)}
      className="w-10 h-10 p-0 bg-gray-200 text-gray-900 hover:bg-gray-300 flex items-center justify-center rounded"
    />
  </div>

  <div class="flex flex-col h-full justify-between">
    <nav class="mt-16 px-4 space-y-2">
      <a
        href="/"
        class="block px-3 py-2 rounded text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-medium"
        >Home</a
      >
      <a
        href="/kpi"
        class="block px-3 py-2 rounded text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-medium"
        >KPI</a
      >
      <a
        href="/archive"
        class="block px-3 py-2 rounded text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-medium"
        >Archive</a
      >
      <a
        href="/reports"
        class="block px-3 py-2 rounded text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 font-medium"
        >Reports</a
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
        class="w-full flex items-center justify-start gap-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-950 py-3 pl-4 transition border-t border-blue-950"
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
