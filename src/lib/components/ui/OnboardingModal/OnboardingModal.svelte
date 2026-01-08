<script lang="ts">
  import Input from "../Input/Input.svelte";
  import Button from "../Button/Button.svelte";
  import { updateMyProfile } from "$lib/services/user.service.js";
  import { userStore } from "$lib/store/store.js";
  import { toastStore } from "$lib/store/toastStore.js";
  import { afterUpdate } from "svelte";

  export let isOpen: boolean = false;
  export let onComplete: () => void = () => {};

  let firstName = "";
  let lastName = "";
  let department = "";
  let saving = false;
  let previousIsOpen = false;

  // Modal açıldığında mevcut değerleri yükle
  afterUpdate(() => {
    if (isOpen && !previousIsOpen) {
      // Modal yeni açıldı, değerleri yükle
      const user = $userStore;
      firstName = user.firstName || "";
      lastName = user.lastName || "";
      department = user.department || "";
    }
    previousIsOpen = isOpen;
  });

  async function handleSave() {
    // Validasyon - değerleri kontrol et
    const firstNameTrimmed = (firstName || "").trim();
    const lastNameTrimmed = (lastName || "").trim();
    const departmentTrimmed = (department || "").trim();

    if (!firstNameTrimmed) {
      toastStore.error("Lütfen adınızı girin");
      return;
    }
    if (!lastNameTrimmed) {
      toastStore.error("Lütfen soyadınızı girin");
      return;
    }
    if (!departmentTrimmed) {
      toastStore.error("Lütfen departmanınızı girin");
      return;
    }

    saving = true;

    try {
      // Backend'e kaydet
      const updatedUser = await updateMyProfile({
        firstName: firstNameTrimmed,
        lastName: lastNameTrimmed,
        department: departmentTrimmed,
      });

      // Store'u güncelle
      const currentUser = $userStore;
      userStore.set({
        ...currentUser,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        department: updatedUser.department,
      });

      toastStore.success("Bilgileriniz başarıyla kaydedildi");
      onComplete();
    } catch (error: any) {
      toastStore.error(error.message || "Bilgiler kaydedilirken bir hata oluştu");
    } finally {
      saving = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !saving) {
      handleSave();
    }
  }
</script>

{#if isOpen}
  <!-- Backdrop - tıklanabilir değil, modal kapatılamaz -->
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-title"
    on:click|stopPropagation
  >
    <!-- Modal -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 md:p-8"
      on:keydown={handleKeyDown}
      on:click|stopPropagation
    >
      <!-- Başlık -->
      <div class="mb-6">
        <h2
          id="onboarding-title"
          class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
        >
          Hoş Geldiniz! 👋
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Devam etmek için lütfen aşağıdaki bilgileri doldurun.
        </p>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ad"
            placeholder="Adınız"
            type="text"
            bind:value={firstName}
            disabled={saving}
            theme="dark"
            className="w-full"
          />
          <Input
            label="Soyad"
            placeholder="Soyadınız"
            type="text"
            bind:value={lastName}
            disabled={saving}
            theme="dark"
            className="w-full"
          />
        </div>

        <Input
          label="Departman"
          placeholder="Departmanınız"
          type="text"
          bind:value={department}
          disabled={saving}
          theme="dark"
          className="w-full"
        />
      </div>

      <!-- Butonlar -->
      <div class="mt-6">
        <Button
          type="button"
          text={saving ? "Kaydediliyor..." : "Kaydet ve Devam Et"}
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        />
      </div>
    </div>
  </div>
{/if}

<style>
  /* Modal animasyonu */
  :global(.onboarding-modal-enter) {
    animation: fadeIn 0.2s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

