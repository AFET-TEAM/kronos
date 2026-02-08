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
    assignUserToManager,
    removeUserFromManager,
    updateUserDepartment,
    type AdminUser,
  } from "$lib/services/admin.service.js";

  let users: AdminUser[] = [];
  let filteredUsers: AdminUser[] = [];
  let loading = true;
  let searchQuery = "";
  let selectedDepartment = "all";
  let selectedUser: AdminUser | null = null;
  let isEditModalOpen = false;
  let isReportsModalOpen = false;
  let isAssignModalOpen = false;
  let selectedUserForReports: AdminUser | null = null;
  let selectedUserForAssign: AdminUser | null = null;
  let selectedManagerId = "";
  let selectedDepartmentForUser = "";
  let editForm = {
    role: "user",
    status: "active",
    title: "",
    squad: "",
    department: "",
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

  $: departments = ["all", ...new Set(users.map(u => u.department || "Atanmamış").filter(Boolean))];
  $: managers = users.filter(u => u.role === "admin" || u.role === "manager");
  $: managerOptions = managers.map(m => ({ 
    value: m.id, 
    label: `${m.firstName} ${m.lastName} (${m.department || 'Yok'})` 
  }));

  $: {
    if (selectedDepartment === "all") {
      filteredUsers = users;
    } else {
      filteredUsers = users.filter(u => (u.department || "Atanmamış") === selectedDepartment);
    }
    
    if (searchQuery.trim()) {
      filteredUsers = filteredUsers.filter(u => 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }

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

  function openEditModal(user: AdminUser) {
    selectedUser = user;
    editForm = {
      role: user.role,
      status: user.status,
      title: user.title,
      squad: user.squad,
      department: user.department || "",
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

  function openAssignModal(user: AdminUser) {
    selectedUserForAssign = user;
    selectedManagerId = user.managerId || "";
    selectedDepartmentForUser = user.department || "";
    isAssignModalOpen = true;
  }

  function closeAssignModal() {
    isAssignModalOpen = false;
    selectedUserForAssign = null;
    selectedManagerId = "";
    selectedDepartmentForUser = "";
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
      
      if (editForm.department !== selectedUser.department) {
        await updateUserDepartment(selectedUser.id, editForm.department);
      }
      
      toastStore.success("Kullanıcı güncellendi");
      await loadUsers();
      closeEditModal();
    } catch (error) {
      toastStore.error("Güncelleme başarısız");
    }
  }

  async function handleAssignUser() {
    if (!selectedUserForAssign) return;

    try {
      if (selectedManagerId) {
        await assignUserToManager(selectedUserForAssign.id, selectedManagerId);
        toastStore.success("Kullanıcı yöneticiye atandı");
      }
      
      if (selectedDepartmentForUser !== selectedUserForAssign.department) {
        await updateUserDepartment(selectedUserForAssign.id, selectedDepartmentForUser);
        toastStore.success("Direktörlük güncellendi");
      }
      
      await loadUsers();
      closeAssignModal();
    } catch (error) {
      toastStore.error("Atama başarısız");
    }
  }

  async function handleRemoveFromManager(userId: string) {
    if (!confirm("Bu kullanıcıyı yöneticisinden çıkarmak istediğinize emin misiniz?")) return;
    
    try {
      await removeUserFromManager(userId);
      toastStore.success("Kullanıcı yöneticiden çıkarıldı");
      await loadUsers();
    } catch (error) {
      toastStore.error("İşlem başarısız");
    }
  }

  function getRoleBadgeClass(role: string) {
    const classes: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      manager: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return classes[role] || classes.user;
  }

  function getStatusBadgeClass(status: string) {
    const classes: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return classes[status] || classes.inactive;
  }

  function getManagerName(managerId: string | undefined) {
    if (!managerId) return "-";
    const manager = users.find(u => u.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : "-";
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
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Kullanıcı & Organizasyon Yönetimi
      </h1>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        bind:value={searchQuery}
        placeholder="İsim veya email ile ara..."
        type="text"
      />
      <select
        bind:value={selectedDepartment}
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
      >
        {#each departments as dept}
          <option value={dept}>
            {dept === "all" ? "Tüm Direktörlükler" : dept}
          </option>
        {/each}
      </select>
    </div>
    <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
      Toplam {filteredUsers.length} kullanıcı gösteriliyor
    </div>
  </div>

  <!-- Users Table -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
              Kullanıcı
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
              Direktörlük
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
              Yönetici
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
              Role
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
              Durum
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
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
                      {user.firstName} {user.lastName}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">
                      {user.title} • {user.squad}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  {user.department || "Atanmamış"}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {getManagerName(user.managerId)}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-semibold {getRoleBadgeClass(user.role)}">
                  {user.role}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 rounded-full text-xs font-semibold {getStatusBadgeClass(user.status)}">
                  {user.status}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => openEditModal(user)}
                    text="✏️"
                    variant="secondary"
                    size="small"
                  />
                  <Button
                    onClick={() => openAssignModal(user)}
                    text="👥"
                    variant="primary"
                    size="small"
                  />
                  <Button
                    onClick={() => openReportsModal(user)}
                    text="📊"
                    variant="primary"
                    size="small"
                  />
                  {#if user.managerId}
                    <Button
                      onClick={() => handleRemoveFromManager(user.id)}
                      text="🔗"
                      variant="secondary"
                      size="small"
                    />
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Edit Modal -->
{#if isEditModalOpen && selectedUser}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
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
              {selectedUser.firstName} {selectedUser.lastName}
            </div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {selectedUser.email}
            </div>
          </div>
        </div>

        <Input label="Ünvan" bind:value={editForm.title} type="text" placeholder="Ünvan" />
        <Input label="Takım" bind:value={editForm.squad} type="text" placeholder="Takım" />
        <Input label="Direktörlük" bind:value={editForm.department} type="text" placeholder="Direktörlük" />

        <GeneralSelectbox label="Role" bind:selected={editForm.role} options={roleOptions} />
        <GeneralSelectbox label="Durum" bind:selected={editForm.status} options={statusOptions} />

        <div class="flex gap-4 mt-6">
          <Button onClick={handleUpdateUser} text="Kaydet" variant="primary" className="flex-1" />
          <Button onClick={closeEditModal} text="İptal" variant="secondary" className="flex-1" />
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Assign Modal -->
{#if isAssignModalOpen && selectedUserForAssign}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🏢 Organizasyon Atama
      </h2>

      <div class="space-y-4">
        <div class="flex items-center gap-4 mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <img
            src={selectedUserForAssign.avatarUrl}
            alt={`${selectedUserForAssign.firstName} ${selectedUserForAssign.lastName}`}
            class="w-12 h-12 rounded-full ring-2 ring-indigo-400"
          />
          <div>
            <div class="font-semibold text-gray-900 dark:text-white">
              {selectedUserForAssign.firstName} {selectedUserForAssign.lastName}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {selectedUserForAssign.title}
            </div>
          </div>
        </div>

        <Input
          label="Direktörlük"
          bind:value={selectedDepartmentForUser}
          type="text"
          placeholder="Örn: Engineering, Sales, HR"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Yönetici Seçin
          </label>
          <select
            bind:value={selectedManagerId}
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Yönetici atanmadı</option>
            {#each managerOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
          ℹ️ Kullanıcı seçilen yöneticiye ve direktörlüğe atanacak
        </div>

        <div class="flex gap-4 mt-6">
          <Button onClick={handleAssignUser} text="✅ Ata" variant="primary" className="flex-1" />
          <Button onClick={closeAssignModal} text="İptal" variant="secondary" className="flex-1" />
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Reports Modal -->
{#if isReportsModalOpen && selectedUserForReports}
  <UserReportsModal user={selectedUserForReports} onClose={closeReportsModal} />
{/if}
