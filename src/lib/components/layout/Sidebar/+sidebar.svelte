<script lang="ts">
  import Profile from "../../modules/Profile/+profile.svelte";

  export let isOpen: boolean = false;

  import { removeAuthToken } from "$lib/services/auth.service.js";

  function handleLogout() {
    removeAuthToken();
    location.href = "/";
  }
</script>

<div
  class={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 z-40 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
>
  <div class="flex flex-col h-full justify-between">
    <nav class="mt-16 px-4 space-y-2">
      <a
        href="/"
        class="block px-3 py-2 rounded text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
        >Home</a
      >
      <a
        href="/kpi"
        class="block px-3 py-2 rounded text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
        >KPI</a
      >
      <a
        href="/archive"
        class="block px-3 py-2 rounded text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
        >Archive</a
      >
      <a
        href="/reports"
        class="block px-3 py-2 rounded text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
        >Reports</a
      >
    </nav>

    <div
      class="mb-6 border-t border-gray-200 dark:border-gray-700 pt-4 px-4 space-y-4"
    >
      <Profile
        name="Mert Paşaoğlu"
        squad="DC-CORPORATE"
        avatarUrl="https://randomuser.me/api/portraits/men/75.jpg"
      />

      <button
        on:click={handleLogout}
        class="absolute bottom-0 left-0 w-full flex items-center justify-start gap-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 py-3 pl-4 transition border-t border-blue-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-black"
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
