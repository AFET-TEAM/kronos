<script lang="ts">
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { getInitials, getAvatarColor } from "../utils/avatarUtils.js";
  import { handleImageUpload } from "../utils/imageCompression.js";
  import { API_URL } from "$lib/services/api.config.js";

  export let isEditing = false;
  export let tempFormData: any;
  export let formData: any;
  export let saving = false; // Yeni prop ekle
  export let onEdit: () => void = () => {};
  export let onSave: () => void = () => {};
  export let onCancel: () => void = () => {};
  export let onKeyDown: (e: any) => void = () => {};
  export let onAvatarChange: (url: string) => void = () => {};

  // Avatar URL'ini düzelt (relative path ise API_URL ile birleştir)
  function getAvatarUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    if (url.startsWith("/uploads/")) {
      return `${API_URL}${url}`;
    }
    return url;
  }

  // Avatar gösterilebilir mi kontrol et
  let avatarError = false;
  let lastAvatarUrl = "";

  $: hasAvatarUrl = !!(tempFormData.avatarUrl || formData.avatarUrl);
  $: currentAvatarUrl = tempFormData.avatarUrl || formData.avatarUrl || "";
  $: showAvatar = hasAvatarUrl && !avatarError;

  // Avatar URL değiştiğinde hatayı sıfırla
  $: if (currentAvatarUrl !== lastAvatarUrl) {
    avatarError = false;
    lastAvatarUrl = currentAvatarUrl;
  }

  function handleAvatarError() {
    avatarError = true;
  }

  const handleFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      avatarError = false; // Yeni dosya seçildiğinde hatayı sıfırla
      const compressed = await handleImageUpload(file);
      tempFormData.avatarUrl = compressed;
      onAvatarChange(compressed);
    }
  };
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
  <div class="col-span-1 flex flex-col items-center text-center">
    {#if showAvatar}
      <img
        src={getAvatarUrl(tempFormData.avatarUrl || formData.avatarUrl)}
        alt={`${formData.firstName} ${formData.lastName}`}
        loading="lazy"
        decoding="async"
        class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-6 shadow-lg border-4 profile-avatar-border"
        on:error={handleAvatarError}
      />
    {/if}
    {#if !showAvatar}
      <div
        class={`${getAvatarColor(formData.firstName || "U", formData.lastName || "S")} w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 profile-avatar-border`}
      >
        <span class="text-3xl md:text-5xl font-bold text-white"
          >{getInitials(formData.firstName || "U", formData.lastName || "S")}</span
        >
      </div>
    {/if}

    {#if !isEditing}
      <Button
        type="button"
        text="Düzenle"
        variant="secondary"
        size="medium"
        className="mb-3 profile-button-primary w-full px-6 py-2 profile-button-primary-hover"
        onClick={onEdit}
      />
    {/if}

    <input
      type="file"
      accept="image/*"
      id="avatar-upload"
      class="hidden"
      on:change={handleFileChange}
    />

    <Button
      type="button"
      text="Fotoğraf Değiştir"
      variant="primary"
      size="medium"
      className="profile-button-secondary w-full px-6 py-2"
      onClick={() => document.getElementById("avatar-upload")?.click()}
    />
  </div>

  <div class="col-span-1 md:col-span-2">
    <h2 class="text-xl md:text-2xl font-bold profile-heading mb-6">
      Profil Bilgileri
    </h2>

    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ad"
          placeholder="Ad"
          type="text"
          disabled={!isEditing}
          bind:value={tempFormData.firstName}
          on:keydown={onKeyDown}
          theme="dark"
          className="profile-input"
        />
        <Input
          label="Soyad"
          placeholder="Soyad"
          type="text"
          disabled={!isEditing}
          bind:value={tempFormData.lastName}
          on:keydown={onKeyDown}
          theme="dark"
          className="profile-input"
        />
      </div>

      <Input
        label="E-posta Adresi"
        placeholder="E-posta Adresi"
        type="email"
        disabled={true}
        bind:value={tempFormData.email}
        theme="dark"
        className="profile-input profile-input-disabled"
      />

      <Input
        label="Başlık"
        placeholder="Başlık"
        type="text"
        disabled={!isEditing}
        bind:value={tempFormData.title}
        on:keydown={onKeyDown}
        theme="dark"
        className="profile-input"
      />

      <Input
        label="Ekip"
        placeholder="Ekip"
        type="text"
        disabled={!isEditing}
        bind:value={tempFormData.squad}
        on:keydown={onKeyDown}
        theme="dark"
        className="profile-input"
      />

      <Input
        label="Departman"
        placeholder="Departman"
        type="text"
        disabled={!isEditing}
        bind:value={tempFormData.department}
        on:keydown={onKeyDown}
        theme="dark"
        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
      />

      {#if isEditing}
        <div class="flex flex-col md:flex-row gap-4 pt-4">
          <Button
            type="button"
            text={saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            variant="primary"
            size="medium"
            className="flex-1"
            onClick={onSave}
            disabled={saving}
          />
          <Button
            type="button"
            text="İptal"
            variant="secondary"
            size="medium"
            className="flex-1"
            onClick={onCancel}
            disabled={saving}
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .profile-avatar-border {
    border-color: var(--color-border);
  }

  .profile-heading {
    color: var(--color-text);
  }

  :global(.profile-input) {
    background-color: var(--color-background);
    border-color: var(--color-border);
    color: var(--color-text);
  }

  :global(.profile-input::placeholder) {
    color: var(--color-text-placeholder);
  }

  :global(.profile-input-disabled) {
    opacity: 0.5;
    background-color: var(--color-background-tertiary);
  }

  :global(:root.dark .profile-input-disabled) {
    background-color: var(--color-background);
  }

  :global(:root.dark .profile-input-disabled) {
    background-color: var(--color-background);
  }
</style>
