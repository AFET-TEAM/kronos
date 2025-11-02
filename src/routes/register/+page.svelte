<script lang="ts">
  import { goto } from "$app/navigation";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { register, setAuthToken } from "$lib/services/auth.service.js";
  import { userStore } from "$lib/store/store.js";
  import { toastStore } from "$lib/store/toastStore.js";
  import { themeStore } from "$lib/store/themeStore.js";
  import { onMount } from "svelte";

  let name = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  let loading = false;

  onMount(() => {
    // Theme store'u başlat
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light';
      themeStore.set(savedTheme as 'light' | 'dark');
    }
  });

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      toastStore.error("Lütfen tüm alanları doldurun");
      return;
    }

    if (password !== confirmPassword) {
      toastStore.error("Şifreler eşleşmiyor");
      return;
    }

    if (password.length < 6) {
      toastStore.error("Şifre en az 6 karakter olmalıdır");
      return;
    }

    loading = true;

    try {
      const result = await register({ name, email, password });

      // Backend idToken dönüyor, onu token olarak kullan
      const token = result.token || result.idToken;

      if (token) {
        setAuthToken(token);
        
        toastStore.success("Kayıt başarılı! Hoş geldiniz.");
        goto("/");
      } else {
        toastStore.error(result.message || "Kayıt başarısız");
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
  <title>Kayıt Ol - Kronos</title>
  <meta name="description" content="Kronos Zaman Yönetim Sistemi - Kayıt Ol" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 transition-colors duration-300">
  <div class="w-full max-w-md">
    <!-- Logo ve Başlık -->
    <div class="text-center mb-8">
      <h1 class="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2 transition-colors">KRONOS</h1>
      <p class="text-2xl text-gray-700 dark:text-gray-300 transition-colors">Hesap Oluştur</p>
    </div>

    <!-- Register Form -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 transition-colors duration-300">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center transition-colors">
        Kayıt Ol
      </h2>

      <form on:submit|preventDefault={handleRegister} class="space-y-4">
        <div>
          <Input
            type="text"
            bind:value={name}
            placeholder="Ad Soyad"
            label="Ad Soyad"
            disabled={loading}
            iconLeft="user"
          />
        </div>

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
            placeholder="Şifreniz (min 6 karakter)"
            label="Şifre"
            disabled={loading}
            iconLeft="lock"
          />
        </div>

        <div>
          <Input
            type="password"
            bind:value={confirmPassword}
            placeholder="Şifrenizi tekrar girin"
            label="Şifre Tekrar"
            disabled={loading}
            iconLeft="lock"
          />
        </div>

        <Button
          text={loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          variant="primary"
          onClick={handleRegister}
          disabled={loading}
          className="w-full"
        />
      </form>

      <div class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
        Zaten hesabınız var mı?
        <a
          href="/login"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors ml-1"
        >
          Giriş Yap
        </a>
      </div>
    </div>

    <!-- Theme Toggle -->
    <div class="mt-6 text-center">
      <button
        on:click={() => {
          const newTheme = $themeStore === 'light' ? 'dark' : 'light';
          themeStore.set(newTheme);
          localStorage.setItem('theme', newTheme);
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }}
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-md"
      >
        {#if $themeStore === 'light'}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
          <span class="text-sm font-medium">Karanlık Mod</span>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <span class="text-sm font-medium">Aydınlık Mod</span>
        {/if}
      </button>
    </div>
  </div>
</div>
