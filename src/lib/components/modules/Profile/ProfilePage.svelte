<script lang="ts">
  import "../../../../app.scss";
  import { userStore } from "$lib/store/store.js";
  import { onMount } from "svelte";
  import TabNavigation from "./components/TabNavigation.svelte";
  import ProfileTab from "./components/ProfileTab.svelte";
  import CorporateTab from "./components/CorporateTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";
  import { updateMyProfile, uploadAvatar } from "$lib/services/user.service.js";
  import { toastStore } from "$lib/store/toastStore.js";

  let activeTab = "profile";
  let saving = false;

  let formData = {
    firstName: "",
    lastName: "",
    email: "",
    title: "",
    squad: "",
    department: "",
    avatarUrl: "",
    startDate: "",
    projects: [] as string[],
    trainings: [] as string[],
    awards: [] as string[],
    certifications: [] as string[],
  };

  let isEditing = false;
  let tempFormData = { ...formData };

  let initialized = false;
  let unsubscribeStore: (() => void) | null = null;

  onMount(() => {
    if (initialized) return;

    unsubscribeStore = userStore.subscribe((user: any) => {
      if (user.email) {
        formData = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          title: user.title || "",
          squad: user.squad || "",
          department: user.department || "",
          avatarUrl: user.avatarUrl || "",
          startDate: user.startDate || "",
          projects: user.projects || [],
          trainings: user.trainings || [],
          awards: user.awards || [],
          certifications: user.certifications || [],
        };
        tempFormData = { ...formData };
        initialized = true;
        unsubscribeStore?.();
      }
    });

    return () => {
      if (unsubscribeStore) {
        unsubscribeStore();
      }
    };
  });

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && isEditing) {
      handleSaveChanges();
    }
  };

  const handleEditClick = () => {
    isEditing = true;
    tempFormData = { ...formData };
  };

  const handleSaveChanges = async () => {
    if (saving) return;
    
    try {
      saving = true;
      
      // Backend'e istek at
      const updatedUser = await updateMyProfile({
        firstName: tempFormData.firstName,
        lastName: tempFormData.lastName,
        title: tempFormData.title,
        squad: tempFormData.squad,
        department: tempFormData.department,
        avatarUrl: tempFormData.avatarUrl,
        startDate: tempFormData.startDate,
        projects: tempFormData.projects,
        trainings: tempFormData.trainings,
        awards: tempFormData.awards,
        certifications: tempFormData.certifications,
      });

      // Başarılı olursa local state'i güncelle
      formData = { ...tempFormData };
      isEditing = false;

      // Store'u güncelle - Backend'den dönen tüm verileri kullan
      const currentUser = $userStore;
      userStore.set({
        email: updatedUser.email || currentUser.email,
        firstName: updatedUser.firstName || currentUser.firstName || "",
        lastName: updatedUser.lastName || currentUser.lastName || "",
        title: updatedUser.title || currentUser.title || "",
        squad: updatedUser.squad || currentUser.squad || "",
        department: updatedUser.department || currentUser.department || "",
        avatarUrl: updatedUser.avatarUrl || currentUser.avatarUrl || "",
        role: updatedUser.role || currentUser.role || "user",
        startDate: updatedUser.startDate || currentUser.startDate || "",
        projects: updatedUser.projects || currentUser.projects || [],
        trainings: updatedUser.trainings || currentUser.trainings || [],
        awards: updatedUser.awards || currentUser.awards || [],
        certifications: updatedUser.certifications || currentUser.certifications || [],
      });

      toastStore.success("Profil başarıyla güncellendi");
    } catch (error: any) {
      toastStore.error(error.message || "Profil güncellenirken bir hata oluştu");
    } finally {
      saving = false;
    }
  };

  const handleCancel = () => {
    isEditing = false;
    tempFormData = { ...formData };
  };

  const handleAvatarChange = async (url: string) => {
    if (!url) return;
    try {
      const avatarUrl = await uploadAvatar(url);
      tempFormData.avatarUrl = avatarUrl;
      formData.avatarUrl = avatarUrl;
      // Store'u hemen güncelle ki header/sidebar vb. her yerde yeni foto görünsün
      const current = $userStore;
      userStore.set({ ...current, avatarUrl });
      await handleSaveChanges();
      toastStore.success("Profil fotoğrafı kaydedildi");
    } catch (error: any) {
      toastStore.error(error.message || "Profil fotoğrafı yüklenirken bir hata oluştu");
    }
  };
</script>

<div class="profile-page-container min-h-screen p-4 md:p-6 lg:p-8">
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-bold profile-title">Profil</h1>
    </div>

    <div class="profile-settings-area rounded-lg shadow-2xl overflow-hidden">
      <TabNavigation bind:activeTab />

      <div class="p-6 md:p-8">
        {#if activeTab === "profile"}
          <ProfileTab
            {isEditing}
            {tempFormData}
            {formData}
            {saving}
            onEdit={handleEditClick}
            onSave={handleSaveChanges}
            onCancel={handleCancel}
            onKeyDown={handleKeyDown}
            onAvatarChange={handleAvatarChange}
          />
        {:else if activeTab === "corporate"}
          <CorporateTab
            {isEditing}
            {tempFormData}
            onEdit={handleEditClick}
            onSave={handleSaveChanges}
            onCancel={handleCancel}
            onKeyDown={handleKeyDown}
          />
        {:else if activeTab === "settings"}
          <SettingsTab />
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  .profile-page-container {
    /* Light mode: yumuşak açık gradient */
    background: linear-gradient(
      135deg,
      #e0e7ff 0%,
      #f0f9ff 40%,
      #f8fafc 100%
    );
  }

  :global(.dark) .profile-page-container {
    background: linear-gradient(
      to top right,
      var(--color-gradient-body-gray1),
      var(--color-gradient-body-gray2)
    );
  }

  .profile-title {
    color: var(--color-text-inverse);
    text-shadow: 1px 1px 2px var(--color-background-overlay);
  }

  :global(.dark) .profile-title {
    color: var(--color-text);
  }

  .profile-settings-area {
    background: var(--color-background);
  }
</style>
