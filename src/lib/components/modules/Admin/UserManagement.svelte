<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../../ui/Button/Button.svelte";
  import Input from "../../ui/Input/Input.svelte";
  import GeneralSelectbox from "../../ui/GeneralSelectbox/GeneralSelectbox.svelte";
  import UserReportsModal from "./UserReportsModal.svelte";
  import { toastStore } from "$lib/store/toastStore.js";
  import {
    getAllUsers,
    updateUser,
    searchUsers,
    type AdminUser,
  } from "$lib/services/admin.service.js";

  let users: AdminUser[] = [];
  let filteredUsers: AdminUser[] = [];
  let loading = true;
  let searchQuery = "";
  let selectedUser: AdminUser | null = null;
  let isEditModalOpen = false;
  let isReportsModalOpen = false;
  let selectedUserForReports: AdminUser | null = null;
  let editForm = {
    role: "user",
    status: "active",
    title: "",
    squad: "",
  };

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "manager", label: "Manager" },
    { value: "admin", label: "Admin" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "suspended", label: "Suspended" },
  ];

  onMount(async () => {
    await loadUsers();
  });

  async function loadUsers() {
    loading = true;
    try {
      users = await getAllUsers();
      filteredUsers = users;
    } catch (error) {
      toastStore.error("Kullanıcılar yüklenemedi");
    } finally {
      loading = false;
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      filteredUsers = users;
      return;
    }
    try {
      filteredUsers = await searchUsers(searchQuery);
    } catch (error) {
      toastStore.error("Arama başarısız");
    }
  }

  function openEditModal(user: AdminUser) {
    selectedUser = user;
    editForm = {
      role: user.role,
      status: user.status,
      title: user.title,
      squad: user.squad,
    };
    isEditModalOpen = true;
  }

  function closeEditModal() {
    isEditModalOpen = false;
    selectedUser = null;
  }

  function openReportsModal(user: AdminUser) {
    selectedUserForReports = user;
    isReportsModalOpen = true;
  }

  function closeReportsModal() {
    isReportsModalOpen = false;
    selectedUserForReports = null;
  }

  async function handleUpdateUser() {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        role: editForm.role as "user" | "manager" | "admin",
        status: editForm.status as "active" | "inactive" | "suspended",
        title: editForm.title,
        squad: editForm.squad,
      });
      toastStore.success("Kullanıcı güncellendi");
      await loadUsers();
      closeEditModal();
    } catch (error) {
      toastStore.error("Güncelleme başarısız");
    }
  }

  function getRoleBadgeClass(role: string) {
    const classes: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      manager:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return classes[role] || classes.user;
  }

  function getStatusBadgeClass(status: string) {
    const classes: Record<string, string> = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return classes[status] || classes.inactive;
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
        Kullanıcı Yönetimi
      </h1>
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div class="flex gap-4">
      <Input
        bind:value={searchQuery}
        placeholder="Kullanıcı ara..."
        type="text"
        className="flex-1"
      />
      <Button onClick={handleSearch} text="Ara" variant="primary" />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
            >
              Kullanıcı
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
            >
              Takım
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
            >
              Role
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
            >
              Durum
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
            >
              Rapor Sayısı
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
            >
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          {#each filteredUsers as user}
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    class="w-10 h-10 rounded-full ring-2 ring-indigo-400"
                    loading="lazy"
                  />
                  <div>
                    <div class="font-semibold text-gray-900 dark:text-white">
                      {user.firstName}
                      {user.lastName}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
              >
                <div>{user.title}</div>
                <div class="text-gray-500 dark:text-gray-400">{user.squad}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold {getRoleBadgeClass(
                    user.role
                  )}"
                >
                  {user.role}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold {getStatusBadgeClass(
                    user.status
                  )}"
                >
                  {user.status}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  on:click={() => openReportsModal(user)}
                  class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold hover:underline"
                >
                  {user.reportCount} rapor
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex gap-2">
                  <Button
                    onClick={() => openEditModal(user)}
                    text="Düzenle"
                    variant="secondary"
                    size="small"
                  />
                  <Button
                    onClick={() => openReportsModal(user)}
                    text="Raporlar"
                    variant="primary"
                    size="small"
                  />
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

{#if isEditModalOpen && selectedUser}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl"
    >
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Kullanıcı Düzenle
      </h2>

      <div class="space-y-4">
        <div class="flex items-center gap-4 mb-6">
          <img
            src={selectedUser.avatarUrl}
            alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
            class="w-16 h-16 rounded-full ring-2 ring-indigo-400"
          />
          <div>
            <div class="font-semibold text-gray-900 dark:text-white">
              {selectedUser.firstName}
              {selectedUser.lastName}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {selectedUser.email}
            </div>
          </div>
        </div>

        <Input
          label="Ünvan"
          bind:value={editForm.title}
          type="text"
          placeholder="Ünvan"
        />

        <Input
          label="Takım"
          bind:value={editForm.squad}
          type="text"
          placeholder="Takım"
        />

        <GeneralSelectbox
          label="Role"
          bind:selected={editForm.role}
          options={roleOptions}
        />

        <GeneralSelectbox
          label="Durum"
          bind:selected={editForm.status}
          options={statusOptions}
        />

        <div class="flex gap-4 mt-6">
          <Button
            onClick={handleUpdateUser}
            text="Kaydet"
            variant="primary"
            className="flex-1"
          />
          <Button
            onClick={closeEditModal}
            text="İptal"
            variant="secondary"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  </div>
{/if}

{#if isReportsModalOpen && selectedUserForReports}
  <UserReportsModal user={selectedUserForReports} onClose={closeReportsModal} />
{/if}
