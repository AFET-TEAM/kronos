<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { login, setAuthToken } from "$lib/services/auth.service.js";
  import { getMyProfile } from "$lib/services/user.service.js";
  import { userStore } from "$lib/store/store.js";
  import { toastStore } from "$lib/store/toastStore.js";
  import { themeStore } from "$lib/store/themeStore.js";
  import { isProfileIncomplete } from "$lib/utils/profileUtils.js";
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

        // Backend'den tam profil bilgilerini çek
        try {
          const profile = await getMyProfile();
          
          const userData = {
            email: profile.email,
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            title: profile.title || "",
            squad: profile.squad || "",
            department: profile.department || "",
            avatarUrl: profile.avatarUrl || "",
            role: profile.role || "user",
            startDate: profile.startDate || "",
            projects: profile.projects || [],
            trainings: profile.trainings || [],
            awards: profile.awards || [],
            certifications: profile.certifications || [],
          };

          // Store'u güncelle
          userStore.set(userData);

          // localStorage'ı da zorla güncelle
          if (typeof window !== "undefined") {
            localStorage.setItem("userProfile", JSON.stringify(userData));
            if (isProfileIncomplete(userData)) {
              sessionStorage.setItem("showOnboardingAfterLogin", "1");
            }
          }
        } catch (profileError) {
          // Profil çekilemezse login'deki user bilgilerini kullan
          const user = result.user || {
            email: result.email || email,
            firstName: "",
            lastName: "",
            title: "",
            squad: "",
            avatarUrl: "",
            role: "user",
          };

          const userData = {
            email: user.email,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            title: user.title || "",
            squad: user.squad || "",
            department: user.department || "",
            avatarUrl: user.avatarUrl || "",
            role: user.role || "user",
            startDate: "",
            projects: [],
            trainings: [],
            awards: [],
            certifications: [],
          };

          userStore.set(userData);
          if (typeof window !== "undefined") {
            localStorage.setItem("userProfile", JSON.stringify(userData));
            if (isProfileIncomplete(userData)) {
              sessionStorage.setItem("showOnboardingAfterLogin", "1");
            }
          }
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
  class="auth-page min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12 transition-colors duration-300"
>
  <div class="w-full max-w-md">
    <!-- Logo ve Başlık -->
    <div class="flex flex-col items-center gap-3 mb-8">
      <div class="flex items-center gap-3">
        <img src="/icons/favicon.svg" alt="Kronos" class="w-12 h-12" />
        <h1
          class="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight transition-colors"
        >
          KRONOS
        </h1>
      </div>
      <p class="text-slate-600 dark:text-slate-400 text-lg transition-colors">
        Hoş geldiniz
      </p>
    </div>

    <!-- Login Form -->
    <div
      class="auth-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-lg p-8 transition-colors duration-300 text-slate-900 dark:text-slate-100"
    >
      <h2
        class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center transition-colors"
      >
        Giriş Yap
      </h2>

      <form on:submit|preventDefault={handleLogin} class="space-y-5">
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

        <div class="flex items-center justify-end text-sm">
          <a
            href="/forgot-password"
            class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium"
          >
            Şifremi unuttum
          </a>
        </div>

        <Button
          type="submit"
          text={loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          variant="primary"
          disabled={loading}
          className="w-full py-3 rounded-xl"
        />
      </form>

      <div
        class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-600 dark:text-slate-400 transition-colors"
      >
        Hesabınız yok mu?
        <a
          href="/register"
          class="text-slate-900 dark:text-slate-200 hover:underline font-semibold transition-colors ml-1"
        >
          Kayıt ol
        </a>
      </div>
    </div>

    <!-- Theme Toggle -->
    <div class="mt-6 flex justify-center">
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
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium"
      >
        {#if $themeStore === "light"}
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span>Karanlık mod</span>
        {:else}
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Aydınlık mod</span>
        {/if}
      </button>
    </div>
  </div>
</div>
