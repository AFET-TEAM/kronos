<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../../ui/Button/Button.svelte";
  import Input from "../../ui/Input/Input.svelte";
  import GeneralSelectbox from "../../ui/GeneralSelectbox/GeneralSelectbox.svelte";
  import { toastStore } from "$lib/store/toastStore.js";

  let settings = {
    systemName: "Kronos",
    reportDeadline: "17:00",
    maxReportDays: "7",
    defaultRole: "user",
    emailDomain: "@atmosware.turkcell.com.tr",
    passwordMinLength: "8",
    requirePasswordComplexity: true,
    enableEmailNotifications: true,
    enableLeaveRequests: false,
    maxAvatarSize: "5",
  };

  let isSaving = false;

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "manager", label: "Manager" },
    { value: "admin", label: "Admin" },
  ];

  onMount(() => {
    loadSettings();
  });

  function loadSettings() {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("kronos_system_settings");
      if (stored) {
        settings = { ...settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Ayarlar yüklenemedi:", error);
    }
  }

  async function handleSave() {
    isSaving = true;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      localStorage.setItem("kronos_system_settings", JSON.stringify(settings));
      toastStore.success("Ayarlar başarıyla kaydedildi");
    } catch (error) {
      toastStore.error("Ayarlar kaydedilemedi");
    } finally {
      isSaving = false;
    }
  }

  function resetToDefaults() {
    settings = {
      systemName: "Kronos",
      reportDeadline: "17:00",
      maxReportDays: "7",
      defaultRole: "user",
      emailDomain: "@atmosware.turkcell.com.tr",
      passwordMinLength: "8",
      requirePasswordComplexity: true,
      enableEmailNotifications: true,
      enableLeaveRequests: false,
      maxAvatarSize: "5",
    };
    toastStore.info("Ayarlar varsayılan değerlere sıfırlandı");
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <button
        on:click={() => window.history.back()}
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        aria-label="Geri"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Sistem Ayarları
      </h1>
    </div>
    <div class="flex gap-3">
      <Button
        onClick={resetToDefaults}
        text="Varsayılana Sıfırla"
        variant="secondary"
      />
      <Button
        onClick={handleSave}
        text={isSaving ? "Kaydediliyor..." : "Kaydet"}
        variant="primary"
        disabled={isSaving}
      />
    </div>
  </div>

  <!-- General Settings -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2
      class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
    >
      <svg
        class="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      Genel Ayarlar
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Sistem Adı"
        bind:value={settings.systemName}
        type="text"
        placeholder="Kronos"
      />

      <Input
        label="Rapor Son Tarih (Saat)"
        bind:value={settings.reportDeadline}
        type="text"
        placeholder="17:00"
      />

      <Input
        label="Maksimum Rapor Aralığı (Gün)"
        bind:value={settings.maxReportDays}
        type="text"
        placeholder="7"
      />

      <GeneralSelectbox
        label="Varsayılan Kullanıcı Rolü"
        bind:selected={settings.defaultRole}
        options={roleOptions}
      />
    </div>
  </div>

  <!-- User Settings -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2
      class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
    >
      <svg
        class="w-6 h-6 text-purple-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      Kullanıcı Ayarları
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Email Domain Kısıtlaması"
        bind:value={settings.emailDomain}
        type="text"
        placeholder="@atmosware.turkcell.com.tr"
      />

      <Input
        label="Şifre Minimum Uzunluk"
        bind:value={settings.passwordMinLength}
        type="text"
        placeholder="8"
      />

      <Input
        label="Maksimum Avatar Boyutu (MB)"
        bind:value={settings.maxAvatarSize}
        type="text"
        placeholder="5"
      />
    </div>

    <div class="mt-4 space-y-3">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          bind:checked={settings.requirePasswordComplexity}
          class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <span class="text-gray-700 dark:text-gray-300">
          Karmaşık şifre gerektir (büyük harf, küçük harf, rakam, özel karakter)
        </span>
      </label>
    </div>
  </div>

  <!-- Feature Flags -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2
      class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
    >
      <svg
        class="w-6 h-6 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Özellik Ayarları
    </h2>

    <div class="space-y-3">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          bind:checked={settings.enableEmailNotifications}
          class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <div>
          <span class="text-gray-700 dark:text-gray-300 font-medium">
            Email Bildirimleri
          </span>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Kullanıcılara email bildirimleri gönderilsin
          </p>
        </div>
      </label>

      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          bind:checked={settings.enableLeaveRequests}
          class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <div>
          <span class="text-gray-700 dark:text-gray-300 font-medium">
            İzin Talep Sistemi
          </span>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Kullanıcılar izin talebi oluşturabilsin (yakında)
          </p>
        </div>
      </label>
    </div>
  </div>

  <!-- System Info -->
  <div
    class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-md p-6"
  >
    <h2
      class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
    >
      <svg
        class="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Sistem Bilgileri
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">Versiyon</p>
        <p class="text-lg font-bold text-gray-900 dark:text-white">v0.2.0</p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">Environment</p>
        <p class="text-lg font-bold text-gray-900 dark:text-white">
          Development
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
        <p class="text-lg font-bold text-gray-900 dark:text-white">
          30 Ekim 2025
        </p>
      </div>
    </div>
  </div>

  <!-- Danger Zone -->
  <div
    class="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6"
  >
    <h2
      class="text-xl font-bold text-red-900 dark:text-red-400 mb-4 flex items-center gap-2"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      Tehlikeli Bölge
    </h2>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-semibold text-red-900 dark:text-red-400">
            Tüm Verileri Sil
          </p>
          <p class="text-sm text-red-700 dark:text-red-300">
            LocalStorage'daki tüm mock veriler silinecek. Bu işlem geri
            alınamaz!
          </p>
        </div>
        <Button
          onClick={() => {
            if (confirm("Tüm veriler silinecek. Emin misiniz?")) {
              localStorage.clear();
              toastStore.success("Tüm veriler silindi");
              setTimeout(() => window.location.reload(), 1000);
            }
          }}
          text="Verileri Sil"
          variant="secondary"
          className="bg-red-600 hover:bg-red-700 text-white"
        />
      </div>
    </div>
  </div>
</div>
