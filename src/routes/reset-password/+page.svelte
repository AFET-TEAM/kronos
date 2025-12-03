<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { resetPassword } from "$lib/services/auth.service.js";
  import { toastStore } from "$lib/store/toastStore.js";

  let oobCode = "";
  let newPassword = "";
  let confirmPassword = "";
  let loading = false;
  let success = false;
  let invalidCode = false;

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    oobCode = urlParams.get("oobCode") || "";
    
    if (!oobCode) {
      invalidCode = true;
      toastStore.error("Geçersiz şifre sıfırlama linki");
    }
  });

  async function handleResetPassword() {
    if (!newPassword || !confirmPassword) {
      toastStore.error("Lütfen tüm alanları doldurun");
      return;
    }

    if (newPassword !== confirmPassword) {
      toastStore.error("Şifreler eşleşmiyor");
      return;
    }

    if (newPassword.length < 6) {
      toastStore.error("Şifre en az 6 karakter olmalıdır");
      return;
    }

    loading = true;

    try {
      const result = await resetPassword(oobCode, newPassword);

      if (result.success) {
        success = true;
        toastStore.success(result.message);
        setTimeout(() => {
          goto("/login");
        }, 3000);
      } else {
        toastStore.error(result.message || "Bir hata oluştu");
      }
    } catch (error: any) {
      toastStore.error(
        error.message || "Şifre sıfırlanamadı. Lütfen tekrar deneyin."
      );
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Şifre Sıfırla - Kronos</title>
  <meta name="description" content="Kronos - Yeni Şifre Belirle" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-linear1 to-linear2 px-4">
  <div class="w-full max-w-md">
    <!-- Logo ve Başlık -->
    <div class="text-center mb-8">
      <h1 class="text-6xl font-bold text-space-purple mb-2">KRONOS</h1>
      <p class="text-2xl text-ocean-blue">Yeni Şifre Belirle</p>
    </div>

    <!-- Reset Password Form -->
    <div class="bg-white rounded-lg shadow-xl p-8">
      {#if invalidCode}
        <div class="text-center">
          <div class="mb-4">
            <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Geçersiz Link
          </h2>
          <p class="text-gray-600 mb-6">
            Şifre sıfırlama linki geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun.
          </p>
          <Button
            text="Şifre Sıfırlama Sayfasına Git"
            variant="primary"
            onClick={() => goto("/forgot-password")}
            className="w-full"
          />
        </div>
      {:else if !success}
        <h2 class="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Yeni Şifre Belirle
        </h2>
        <p class="text-gray-600 text-sm mb-6 text-center">
          Hesabınız için yeni bir şifre oluşturun.
        </p>

        <form on:submit|preventDefault={handleResetPassword} class="space-y-4">
          <div>
            <Input
              type="password"
              bind:value={newPassword}
              placeholder="Yeni şifreniz (min 6 karakter)"
              label="Yeni Şifre"
              disabled={loading}
              iconLeft="lock"
            />
          </div>

          <div>
            <Input
              type="password"
              bind:value={confirmPassword}
              placeholder="Yeni şifrenizi tekrar girin"
              label="Şifre Tekrar"
              disabled={loading}
              iconLeft="lock"
            />
          </div>

          <Button
            text={loading ? "Şifre güncelleniyor..." : "Şifreyi Güncelle"}
            variant="primary"
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full"
          />
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          <a
            href="/login"
            class="text-ocean-blue hover:text-space-purple transition-colors"
          >
            ← Giriş sayfasına dön
          </a>
        </div>
      {:else}
        <div class="text-center">
          <div class="mb-4">
            <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Şifre Başarıyla Güncellendi!
          </h2>
          <p class="text-gray-600 mb-6">
            Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
          </p>
          <p class="text-sm text-gray-500 mb-6">
            3 saniye içinde giriş sayfasına yönlendirileceksiniz...
          </p>
          <Button
            text="Hemen Giriş Yap"
            variant="primary"
            onClick={() => goto("/login")}
            className="w-full"
          />
        </div>
      {/if}
    </div>
  </div>
</div>
