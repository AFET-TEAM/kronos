<script lang="ts">
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { themeStore } from "$lib/store/themeStore.js";
  import { onMount } from "svelte";

  let currentTheme = "light";

  onMount(() => {
    currentTheme = $themeStore;
  });

  $: if (typeof window !== "undefined") {
    currentTheme = $themeStore;
  }

  function handleThemeChange(theme: "light" | "dark") {
    themeStore.set(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }
</script>

<div class="max-w-4xl">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl md:text-2xl font-bold profile-heading">Ayarlar</h2>
  </div>

  <div class="space-y-6">
    <!-- Tema Ayarları -->
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Görünüm Ayarları
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tema
          </label>
          <div class="flex gap-4">
            <button
              type="button"
              on:click={() => handleThemeChange("light")}
              class="flex-1 px-4 py-3 rounded-lg border-2 transition-all {currentTheme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
            >
              <div class="flex items-center justify-center gap-2">
                <svg
                  class="w-5 h-5 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span class="font-medium text-gray-900 dark:text-gray-100">Aydınlık</span>
              </div>
            </button>
            <button
              type="button"
              on:click={() => handleThemeChange("dark")}
              class="flex-1 px-4 py-3 rounded-lg border-2 transition-all {currentTheme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
            >
              <div class="flex items-center justify-center gap-2">
                <svg
                  class="w-5 h-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <span class="font-medium text-gray-900 dark:text-gray-100">Karanlık</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bilgilendirme -->
    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
      <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
        Bilgilendirme
      </h3>
      <p class="text-sm text-blue-800 dark:text-blue-200">
        Profil bilgilerinizi güncellemek için "Profil Bilgileri" sekmesini kullanabilirsiniz.
        Şifre değiştirme ve diğer güvenlik ayarları yakında eklenecektir.
      </p>
    </div>
  </div>
</div>

<style>
  .profile-heading {
    color: var(--color-text);
  }
</style>
