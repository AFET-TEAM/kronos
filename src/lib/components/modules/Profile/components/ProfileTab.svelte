<script lang="ts">
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { getInitials, getAvatarColor } from "../utils/avatarUtils.js";
  import { handleImageUpload } from "../utils/imageCompression.js";

  export let isEditing = false;
  export let tempFormData: any;
  export let formData: any;
  export let onEdit: () => void = () => {};
  export let onSave: () => void = () => {};
  export let onCancel: () => void = () => {};
  export let onKeyDown: (e: any) => void = () => {};
  export let onAvatarChange: (url: string) => void = () => {};

  const handleFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const compressed = await handleImageUpload(file);
      tempFormData.avatarUrl = compressed;
      onAvatarChange(compressed);
    }
  };
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
  <div class="col-span-1 flex flex-col items-center text-center">
    {#if tempFormData.avatarUrl}
      <img
        src={tempFormData.avatarUrl}
        alt={`${formData.firstName} ${formData.lastName}`}
        loading="lazy"
        decoding="async"
        class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-6 shadow-lg border-4 border-slate-700"
      />
    {:else if formData.avatarUrl}
      <img
        src={formData.avatarUrl}
        alt={`${formData.firstName} ${formData.lastName}`}
        loading="lazy"
        decoding="async"
        class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-6 shadow-lg border-4 border-slate-700"
      />
    {:else}
      <div
        class={`${getAvatarColor(formData.firstName, formData.lastName)} w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-slate-700`}
      >
        <span class="text-3xl md:text-5xl font-bold text-white"
          >{getInitials(formData.firstName, formData.lastName)}</span
        >
      </div>
    {/if}

    {#if !isEditing}
      <Button
        type="button"
        text="Düzenle"
        variant="primary"
        size="medium"
        theme="dark"
        className="mb-3 bg-blue-100 text-white w-full px-6 py-2 hover:bg-blue-200"
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
      theme="dark"
      className="bg-slate-700 text-white w-full px-6 py-2"
      onClick={() => document.getElementById("avatar-upload")?.click()}
    />
  </div>

  <div class="col-span-1 md:col-span-2">
    <h2 class="text-xl md:text-2xl font-bold text-white mb-6">
      Profil Bilgileri
    </h2>

    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ad"
          placeholder="Ad"
          type="text"
          disabled={true}
          bind:value={tempFormData.firstName}
          theme="dark"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 opacity-50"
        />
        <Input
          label="Soyad"
          placeholder="Soyad"
          type="text"
          disabled={true}
          bind:value={tempFormData.lastName}
          theme="dark"
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 opacity-50"
        />
      </div>

      <Input
        label="E-posta Adresi"
        placeholder="E-posta Adresi"
        type="email"
        disabled={true}
        bind:value={tempFormData.email}
        theme="dark"
        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 opacity-50"
      />

      <Input
        label="Başlık"
        placeholder="Başlık"
        type="text"
        disabled={!isEditing}
        bind:value={tempFormData.title}
        on:keydown={onKeyDown}
        theme="dark"
        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
      />

      <Input
        label="Ekip"
        placeholder="Ekip"
        type="text"
        disabled={!isEditing}
        bind:value={tempFormData.squad}
        on:keydown={onKeyDown}
        theme="dark"
        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
      />

      {#if isEditing}
        <div class="flex flex-col md:flex-row gap-4 pt-4">
          <Button
            type="button"
            text="Değişiklikleri Kaydet"
            variant="primary"
            size="large"
            theme="dark"
            className="flex-1 bg-blue-100 text-white hover:bg-blue-200 py-2"
            onClick={onSave}
          />
          <Button
            type="button"
            text="İptal"
            variant="secondary"
            size="large"
            theme="dark"
            className="flex-1 bg-slate-600 text-white hover:bg-slate-700 py-2"
            onClick={onCancel}
          />
        </div>
      {/if}
    </div>
  </div>
</div>
