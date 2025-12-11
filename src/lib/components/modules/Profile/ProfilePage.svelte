<script lang="ts">
  import "../../../../app.scss";
  import { userStore } from "$lib/store/store.js";
  import { onMount } from "svelte";
  import TabNavigation from "./components/TabNavigation.svelte";
  import ProfileTab from "./components/ProfileTab.svelte";
  import CorporateTab from "./components/CorporateTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";

  let activeTab = "profile";

  let formData = {
    firstName: "Mert",
    lastName: "Pasaoglu",
    email: "mert.pasaoglu@atmosware.turkcell.com.tr",
    title: "Frontend Developer",
    squad: "DC-CORPORATE",
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
          firstName: user.firstName || "Mert",
          lastName: user.lastName || "Pasaoglu",
          email: user.email,
          title: user.title || "Frontend Developer",
          squad: user.squad || "DC-CORPORATE",
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

  const handleSaveChanges = () => {
    formData = { ...tempFormData };
    isEditing = false;

    // Mevcut store'dan role'ü al ve koru
    const currentUser = $userStore;

    userStore.set({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      title: formData.title,
      squad: formData.squad,
      department: formData.department,
      avatarUrl: formData.avatarUrl,
      role: currentUser.role || "admin", // Role'ü koru
      startDate: formData.startDate,
      projects: formData.projects,
      trainings: formData.trainings,
      awards: formData.awards,
      certifications: formData.certifications,
    });
  };

  const handleCancel = () => {
    isEditing = false;
    tempFormData = { ...formData };
  };

  const handleAvatarChange = (url: string) => {
    isEditing = true;
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
