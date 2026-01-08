<script lang="ts">
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { toastStore } from "$lib/store/toastStore.js";

  export let isEditing = false;
  export let tempFormData: any;
  export let onEdit: () => void = () => {};
  export let onSave: () => void = () => {};
  export let onCancel: () => void = () => {};
  export let onKeyDown: (e: any) => void = () => {};

  // Tarih validasyonu için min ve max değerleri
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Bugünden bir gün öncesi max tarih
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const maxDate = yesterday.toISOString().split('T')[0]; // Dün (YYYY-MM-DD)
  const minDate = '2020-01-01'; // 2020'den öncesi olamaz

  // Tarih değiştiğinde validasyon yap
  function handleDateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const selectedDate = new Date(target.value);
    selectedDate.setHours(0, 0, 0, 0);
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    yesterdayDate.setHours(0, 0, 0, 0);
    const minDateObj = new Date('2020-01-01');
    minDateObj.setHours(0, 0, 0, 0);

    if (selectedDate > yesterdayDate) {
      toastStore.error("İşe başlama tarihi bugünden bir gün öncesi olabilir en geç");
      target.value = tempFormData.startDate || maxDate;
      return;
    }

    if (selectedDate < minDateObj) {
      toastStore.error("İşe başlama tarihi 2020'den önce olamaz");
      target.value = tempFormData.startDate || minDate;
      return;
    }

    tempFormData.startDate = target.value;
  }

  // Tarihi Türkiye formatına çevir (gösterim için)
  function formatDateForDisplay(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const addItem = (field: string) => {
    tempFormData[field] = [...tempFormData[field], ""];
  };

  const updateItem = (field: string, index: number, value: string) => {
    tempFormData[field][index] = value;
  };

  const deleteItem = (field: string, index: number) => {
    tempFormData[field] = tempFormData[field].filter(
      (_: any, i: number) => i !== index,
    );
  };
</script>

<div class="max-w-4xl">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-xl md:text-2xl font-bold profile-heading">
      Kurumsal Bilgiler
    </h2>
    {#if !isEditing}
      <Button
        type="button"
        text="Düzenle"
        variant="primary"
        size="medium"
        className="profile-button-primary profile-button-primary-hover px-6 py-2"
        onClick={onEdit}
      />
    {/if}
  </div>

  <div class="space-y-6">
    <div>
      <label class="block mb-1 font-semibold text-gray-900 dark:text-gray-100">
        İşe Başlama Tarihi
      </label>
      <input
        type="date"
        min={minDate}
        max={maxDate}
        value={tempFormData.startDate || ""}
        disabled={!isEditing}
        on:change={handleDateChange}
        on:keydown={onKeyDown}
        class="w-full px-3 py-2 profile-input rounded disabled:opacity-50"
        title="İşe başlama tarihi 2020'den sonra ve bugünden bir gün öncesi olabilir"
      />
      {#if tempFormData.startDate}
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Seçilen tarih: {formatDateForDisplay(tempFormData.startDate)}
        </p>
      {/if}
    </div>

    {#each [{ key: "projects", label: "Yer Aldığı Projeler", placeholder: "Proje adı" }, { key: "trainings", label: "Katıldığı Eğitimler", placeholder: "Eğitim adı" }, { key: "awards", label: "Ödüller", placeholder: "Ödül adı" }, { key: "certifications", label: "Sertifikalar", placeholder: "Sertifika adı" }] as items}
      <fieldset>
        <div class="flex justify-between items-center mb-3">
          <legend class="block text-sm font-semibold profile-legend">
            {items.label}
          </legend>
          {#if isEditing}
            <Button
              type="button"
              text="+ Ekle"
              variant="primary"
              size="small"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold bg-transparent"
              onClick={() => addItem(items.key)}
            />
          {/if}
        </div>
        <div class="space-y-2">
          {#each tempFormData[items.key] as item, i}
            <div class="flex gap-2 items-center">
              <input
                type="text"
                placeholder={items.placeholder}
                aria-label={`${items.label} ${i + 1}`}
                value={item}
                disabled={!isEditing}
                on:input={(e) =>
                  updateItem(items.key, i, e.currentTarget.value)}
                on:keydown={onKeyDown}
                class="flex-1 px-3 py-2 profile-input rounded disabled:opacity-50"
              />
              {#if isEditing}
                <Button
                  type="button"
                  text="✕"
                  variant="primary"
                  size="small"
                  className="px-2 py-2 text-red-400 hover:text-red-300 bg-transparent"
                  onClick={() => deleteItem(items.key, i)}
                />
              {/if}
            </div>
          {/each}
        </div>
      </fieldset>
    {/each}

    {#if isEditing}
      <div class="flex flex-col md:flex-row gap-4 pt-4">
        <Button
          type="button"
          text="Değişiklikleri Kaydet"
          variant="primary"
          size="large"
          className="flex-1 profile-button-primary profile-button-primary-hover py-2"
          onClick={onSave}
        />
        <Button
          type="button"
          text="İptal"
          variant="secondary"
          size="large"
          className="flex-1 profile-button-secondary profile-button-secondary-hover py-2"
          onClick={onCancel}
        />
      </div>
    {/if}
  </div>
</div>

<style>
  .profile-heading {
    color: var(--color-text);
  }

  .profile-legend {
    color: var(--color-text-secondary);
  }

  :global(.profile-button-primary) {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  :global(.profile-button-primary-hover:hover) {
    background-color: var(--color-primary-hover);
  }

  :global(.profile-button-secondary) {
    background-color: var(--color-background-tertiary);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  :global(.profile-button-secondary-hover:hover) {
    background-color: var(--color-border);
  }

  :global(.profile-input) {
    background-color: var(--color-background);
    border-color: var(--color-border);
    color: var(--color-text);
  }

  :global(.profile-input::placeholder) {
    color: var(--color-text-placeholder);
  }
</style>
