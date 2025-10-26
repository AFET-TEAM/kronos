<script lang="ts">
  import "../../../../app.scss";
  import { userStore, extractNameFromEmail } from "$lib/store/store.js";
  import { onMount } from "svelte";
  import TabNavigation from "./components/TabNavigation.svelte";
  import ProfileTab from "./components/ProfileTab.svelte";
  import CorporateTab from "./components/CorporateTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";

  export let isSidebarOpen: boolean = true;

  let activeTab = "profile";

  let formData = {
    firstName: "Mert",
    lastName: "Pasaoglu",
    email: "mert.pasaoglu@atmosware.turkcell.com.tr",
    title: "Frontend Developer",
    squad: "DC-CORPORATE",
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
        const { firstName, lastName } = extractNameFromEmail(user.email);
        formData = {
          firstName: firstName || user.firstName || "Mert",
          lastName: lastName || user.lastName || "Pasaoglu",
          email: user.email,
          title: user.title || "Frontend Developer",
          squad: user.squad || "DC-CORPORATE",
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
    userStore.set({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      title: formData.title,
      squad: formData.squad,
      avatarUrl: formData.avatarUrl,
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

<div
  class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-6 lg:p-8 transition-all duration-300"
  class:ml-0={!isSidebarOpen}
  class:md:ml-64={isSidebarOpen}
>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-4xl md:text-5xl font-bold text-white">Profil</h1>
    </div>

    <div class="bg-slate-800 rounded-lg shadow-2xl overflow-hidden">
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
</style>
