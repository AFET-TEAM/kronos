<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { login, setAuthToken } from "$lib/services/auth.service.js";
  import { userStore } from "$lib/store/store.js";
  import { toastStore } from "$lib/store/toastStore.js";
  import { themeStore } from "$lib/store/themeStore.js";
  import { onMount } from "svelte";

  let email = "";
  let password = "";
  let loading = false;

  onMount(() => {
    // Theme store'u başlat
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "light";
      themeStore.set(savedTheme as "light" | "dark");
    }

    // URL'de session=expired parametresi varsa kullanıcıya bilgi ver
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("session") === "expired") {
        toastStore.warning("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
        // URL'den parametreyi temizle
        window.history.replaceState({}, "", "/login");
      }
    }
  });

  async function handleLogin() {
    if (!email || !password) {
      toastStore.error("Lütfen tüm alanları doldurun");
      return;
    }

    loading = true;

    try {
      const result = await login({ email, password });

      // Backend'den token geliyor
      if (result.token && result.registered) {
        setAuthToken(result.token);

        // Backend'den user objesi geliyorsa kullan, yoksa oluştur
        const user = result.user || {
          email: result.email || email,
          firstName: "",
          lastName: "",
          title: "",
          squad: "",
          avatarUrl: "",
          role: "user", // Default role: user (admin değil!)
        };

        // Backend'den gelen role'u kullan
        const userRole = user.role || "user";

        const userData = {
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          title: user.title || "",
          squad: user.squad || "",
          avatarUrl: user.avatarUrl || "",
          role: userRole,
          startDate: "",
          projects: [],
          trainings: [],
          awards: [],
          certifications: [],
        };

        // Store'u güncelle
        userStore.set(userData);

        // localStorage'ı da zorla güncelle
        if (typeof window !== "undefined") {
          localStorage.setItem("userProfile", JSON.stringify(userData));
        }

        toastStore.success("Giriş başarılı!");
        goto("/");
      } else {
        toastStore.error(result.message || "Giriş başarısız");
      }
    } catch (error: any) {
      toastStore.error(
        error.message || "Bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Giriş Yap - Kronos</title>
  <meta name="description" content="Kronos Zaman Yönetim Sistemi - Giriş Yap" />
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300"
>
  <div class="w-full max-w-md">
    <!-- Logo ve Başlık -->
    <div class="text-center mb-8">
      <h1
        class="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2 transition-colors"
      >
        KRONOS
      </h1>
      <p class="text-2xl text-gray-700 dark:text-gray-300 transition-colors">
        Hoş Geldiniz
      </p>
    </div>

    <!-- Login Form -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-colors duration-300 text-gray-900 dark:text-gray-100"
    >
      <h2
        class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center transition-colors"
      >
        Giriş Yap
      </h2>

      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
          <Input
            type="email"
            bind:value={email}
            placeholder="E-posta adresiniz"
            label="E-posta"
            disabled={loading}
            iconLeft="email"
          />
        </div>

        <div>
          <Input
            type="password"
            bind:value={password}
            placeholder="Şifreniz"
            label="Şifre"
            disabled={loading}
            iconLeft="lock"
          />
        </div>

        <div class="flex items-center justify-between text-sm">
          <a
            href="/forgot-password"
            class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Şifremi Unuttum?
          </a>
        </div>

        <Button
          type="submit"
          text={loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          variant="primary"
          disabled={loading}
          className="w-full"
        />
      </form>

      <div
        class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors"
      >
        Hesabınız yok mu?
        <a
          href="/register"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors ml-1"
        >
          Kayıt Ol
        </a>
      </div>
    </div>

    <!-- Theme Toggle -->
    <div class="mt-6 text-center">
      <button
        on:click={() => {
          const newTheme = $themeStore === "light" ? "dark" : "light";
          themeStore.set(newTheme);
          localStorage.setItem("theme", newTheme);
          if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-md"
      >
        {#if $themeStore === "light"}
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            ></path>
          </svg>
          <span class="text-sm font-medium">Karanlık Mod</span>
        {:else}
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          <span class="text-sm font-medium">Aydınlık Mod</span>
        {/if}
      </button>
    </div>
  </div>
</div>
