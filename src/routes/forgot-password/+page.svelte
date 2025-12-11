<script lang="ts">
  import { goto } from "$app/navigation";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { forgotPassword } from "$lib/services/auth.service.js";
  import { toastStore } from "$lib/store/toastStore.js";
  import { themeStore } from "$lib/store/themeStore.js";
  import { onMount } from "svelte";

  let email = "";
  let loading = false;
  let emailSent = false;

  onMount(() => {
    // Theme store'u başlat
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || "light";
      themeStore.set(savedTheme as "light" | "dark");
    }
  });

  async function handleForgotPassword() {
    if (!email) {
      toastStore.error("Lütfen e-posta adresinizi girin");
      return;
    }

    loading = true;

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        emailSent = true;
        toastStore.success(result.message);
      } else {
        toastStore.error(result.message || "Bir hata oluştu");
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
  <title>Şifremi Unuttum - Kronos</title>
  <meta name="description" content="Kronos - Şifre Sıfırlama" />
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
        Şifre Sıfırlama
      </p>
    </div>

    <!-- Forgot Password Form -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-colors duration-300 text-gray-900 dark:text-gray-100"
    >
      {#if !emailSent}
        <h2
          class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center transition-colors"
        >
          Şifremi Unuttum
        </h2>
        <p
          class="text-gray-600 dark:text-gray-400 text-sm mb-6 text-center transition-colors"
        >
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </p>

        <form on:submit|preventDefault={handleForgotPassword} class="space-y-4">
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

          <Button
            text={loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
            variant="primary"
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full"
          />
        </form>

        <div
          class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors"
        >
          <a
            href="/login"
            class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            ← Giriş sayfasına dön
          </a>
        </div>
      {:else}
        <div class="text-center">
          <div class="mb-4">
            <svg
              class="w-16 h-16 mx-auto text-green-500 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h2
            class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 transition-colors"
          >
            E-posta Gönderildi!
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6 transition-colors">
            <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
            Lütfen e-postanızı kontrol edin.
          </p>
          <p
            class="text-sm text-gray-500 dark:text-gray-500 mb-6 transition-colors"
          >
            E-postayı görmüyor musunuz? Spam klasörünüzü kontrol edin veya
            birkaç dakika bekleyin.
          </p>
          <Button
            text="Giriş Sayfasına Dön"
            variant="primary"
            onClick={() => goto("/login")}
            className="w-full"
          />
        </div>
      {/if}
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
