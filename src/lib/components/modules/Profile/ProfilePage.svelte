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

      // Store'u güncelle
      const currentUser = $userStore;
      userStore.set({
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        title: updatedUser.title || formData.title,
        squad: updatedUser.squad || formData.squad,
        department: updatedUser.department || formData.department,
        avatarUrl: updatedUser.avatarUrl || formData.avatarUrl,
        role: updatedUser.role || currentUser.role,
        startDate: updatedUser.startDate || formData.startDate,
        projects: updatedUser.projects || formData.projects,
        trainings: updatedUser.trainings || formData.trainings,
        awards: updatedUser.awards || formData.awards,
        certifications: updatedUser.certifications || formData.certifications,
      });

      toastStore.success("Profil başarıyla güncellendi");
    } catch (error: any) {
      console.error("Profil güncellenirken hata:", error);
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
      // Avatar'ı backend'e yükle
      const avatarUrl = await uploadAvatar(url);
      
      // Temp form data'yı güncelle
      tempFormData.avatarUrl = avatarUrl;
      
      // Otomatik kaydet
      await handleSaveChanges();
      
      toastStore.success("Avatar başarıyla yüklendi");
    } catch (error: any) {
      console.error("Avatar yüklenirken hata:", error);
      toastStore.error(error.message || "Avatar yüklenirken bir hata oluştu");
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
    background: linear-gradient(
      to top right,
      var(--color-brand-blue-ribbon),
      var(--color-success)
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
