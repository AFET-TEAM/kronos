<script lang="ts">
  import { onMount } from "svelte";
  import { userStore } from "$lib/store/store.js";
  import { goto } from "$app/navigation";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
  import SearchBar from "$lib/components/ui/SearchBar/SearchBar.svelte";
  import { getOrganizationChart } from "$lib/services/admin.service.js";
  import { toastStore } from "$lib/store/toastStore.js";

  let isSidebarOpen = true;
  let searchValue = "";
  let loading = true;
  let error = "";
  let retryCount = 0;
  const MAX_RETRIES = 3;
  
  // Modal için değişkenler
  let showUserModal = false;
  let selectedUser: OrgMember | null = null;
  
  type OrgMember = {
    id: string;
    name: string;
    email: string;
    title: string;
    avatarUrl: string | null;
    role: string;
    managerId: string | null;
  };

  type DepartmentData = {
    department: string;
    members: OrgMember[];
    count: number;
  };

  let organizationData: DepartmentData[] = [];
  let filteredDepartments: DepartmentData[] = [];
  
  const positionHierarchy = ["CEO", "CTO", "Team Lead", "Senior Developer", "Developer", "Junior Developer", "Intern"];

  onMount(async () => {
    const currentUser = $userStore;

    if (currentUser.role !== "admin" && currentUser.role !== "manager") {
      goto("/dashboard");
    }

    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }

    await fetchOrganizationData();
  });

  async function fetchOrganizationData() {
    try {
      loading = true;
      error = "";
      organizationData = await getOrganizationChart();
      filteredDepartments = organizationData;
      retryCount = 0;
    } catch (err: any) {
      error = err.message || "Organizasyon verileri yüklenirken bir hata oluştu";
      toastStore.error(error);
      
      // Retry mekanizması
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => fetchOrganizationData(), 1000 * retryCount);
      }
    } finally {
      loading = false;
    }
  }

  function getPositionColor(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('ceo') || titleLower.includes('founder')) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    }
    if (titleLower.includes('cto') || titleLower.includes('chief')) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
    if (titleLower.includes('lead') || titleLower.includes('manager')) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    if (titleLower.includes('senior')) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
    if (titleLower.includes('developer') || titleLower.includes('engineer')) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    }
    if (titleLower.includes('junior')) {
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
    }
    if (titleLower.includes('intern')) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }

  function getRoleBadgeColor(role: string): string {
    switch (role.toLowerCase()) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  }

  function getRoleLabel(role: string): string {
    switch (role.toLowerCase()) {
      case "admin": return "Admin";
      case "manager": return "Yönetici";
      default: return "Kullanıcı";
    }
  }

  function getUserInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getManagerName(managerId: string | null): string {
    if (!managerId) return "Yönetici Yok";
    
    for (const dept of organizationData) {
      const manager = dept.members.find(m => m.id === managerId);
      if (manager) return manager.name;
    }
    return "Bilinmiyor";
  }

  function openUserModal(user: OrgMember) {
    selectedUser = user;
    showUserModal = true;
  }

  function closeUserModal() {
    showUserModal = false;
    selectedUser = null;
  }

  function exportToCSV() {
    const headers = ["Ad Soyad", "E-posta", "Departman", "Pozisyon", "Rol", "Yönetici"];
    const rows: string[][] = [];
    
    organizationData.forEach(dept => {
      dept.members.forEach(member => {
        rows.push([
          member.name,
          member.email,
          dept.department,
          member.title,
          getRoleLabel(member.role),
          getManagerName(member.managerId)
        ]);
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `organizasyon_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toastStore.success("CSV dosyası başarıyla indirildi");
  }

  function printOrganization() {
    window.print();
  }

  // Reactive filtering
  $: if (searchValue) {
    filteredDepartments = organizationData
      .map((dept) => ({
        ...dept,
        members: dept.members.filter(
          (member) =>
            member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            member.email.toLowerCase().includes(searchValue.toLowerCase()) ||
            member.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            dept.department.toLowerCase().includes(searchValue.toLowerCase())
        ),
      }))
      .filter((dept) => dept.members.length > 0);
  } else {
    filteredDepartments = organizationData;
  }

  // Calculate statistics
  $: totalUsers = organizationData.reduce((sum, dept) => sum + dept.count, 0);
  $: totalAdmins = organizationData.reduce((sum, dept) => sum + dept.members.filter(m => m.role === 'admin').length, 0);
  $: totalManagers = organizationData.reduce((sum, dept) => sum + dept.members.filter(m => m.role === 'manager').length, 0);
  $: totalDepartments = organizationData.length;

  function getDepartmentStats(dept: DepartmentData) {
    const total = dept.members.length;
    const roles = dept.members.reduce((acc, member) => {
      const role = getRoleLabel(member.role);
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, roles };
  }
</script>

<svelte:head>
  <title>Organizasyon Şeması - Kronos</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header
    {isSidebarOpen}
    onToggleSidebar={() => (isSidebarOpen = !isSidebarOpen)}
    bind:searchValue
  >
    <SearchBar
      placeholder="Kullanıcı, departman veya pozisyon ara..."
      bind:value={searchValue}
      icon="search"
      size="medium"
    />
  </Header>

  <Sidebar bind:isOpen={isSidebarOpen} />

  <main
    class="transition-all duration-300 pt-16 {isSidebarOpen
      ? 'ml-0 md:ml-64'
      : 'ml-0'}"
  >
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- Page Header -->
      <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Organizasyon Şeması
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Departmanlara göre şirket organizasyonu ve kullanıcı hiyerarşisi
          </p>
        </div>
        
        <!-- Action Buttons -->
        {#if !loading && !error && totalUsers > 0}
          <div class="flex gap-2 flex-wrap">
            <button
              on:click={exportToCSV}
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              CSV İndir
            </button>
            
            <button
              on:click={printOrganization}
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium print:hidden"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Yazdır
            </button>
            
            <button
              on:click={fetchOrganizationData}
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="Yenile"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        {/if}
      </div>

      {#if loading}
        <div class="flex flex-col items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Organizasyon verileri yükleniyor...</p>
          {#if retryCount > 0}
            <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Yeniden deneme {retryCount}/{MAX_RETRIES}
            </p>
          {/if}
        </div>
      {:else if error}
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-1">Hata Oluştu</h3>
              <p class="text-red-700 dark:text-red-300">{error}</p>
              <button
                on:click={fetchOrganizationData}
                class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      {:else if filteredDepartments.length === 0}
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Sonuç Bulunamadı
          </h3>
          <p class="text-yellow-700 dark:text-yellow-300">
            {searchValue ? `"${searchValue}" araması için sonuç bulunamadı` : 'Henüz kullanıcı bulunmuyor'}
          </p>
          {#if searchValue}
            <button
              on:click={() => searchValue = ""}
              class="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Aramayı Temizle
            </button>
          {/if}
        </div>
      {:else}
        <!-- Organization Overview Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">Toplam Kullanıcı</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg class="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">Departman</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{totalDepartments}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">Admin</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{totalAdmins}</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <div class="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">Yönetici</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{totalManagers}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Departments -->
        <div class="space-y-6">
          {#each filteredDepartments as department}
            {@const stats = getDepartmentStats(department)}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <!-- Department Header -->
              <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 class="text-xl font-bold text-white">
                      {department.department}
                    </h2>
                    <p class="text-blue-100 text-sm mt-1">
                      {stats.total} {stats.total === 1 ? 'kişi' : 'kişi'}
                    </p>
                  </div>
                  <div class="flex gap-2 flex-wrap">
                    {#each Object.entries(stats.roles) as [role, count]}
                      <span class="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur">
                        {role}: {count}
                      </span>
                    {/each}
                  </div>
                </div>
              </div>

              <!-- Department Members -->
              <div class="p-4 sm:p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {#each department.members as member}
                    <button
                      on:click={() => openUserModal(member)}
                      class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-left w-full"
                    >
                      <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0">
                          {#if member.avatarUrl}
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              class="w-12 h-12 rounded-full object-cover"
                            />
                          {:else}
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                              <span class="text-white font-semibold text-sm">
                                {getUserInitials(member.name)}
                              </span>
                            </div>
                          {/if}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <h3 class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {member.name}
                            </h3>
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {getRoleBadgeColor(member.role)}">
                              {getRoleLabel(member.role)}
                            </span>
                          </div>
                          <p class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {member.title}
                          </p>
                          <p class="text-xs text-gray-500 dark:text-gray-500 truncate mb-1">
                            {member.email}
                          </p>
                          {#if member.managerId}
                            <p class="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                              </svg>
                              {getManagerName(member.managerId)}
                            </p>
                          {/if}
                        </div>
                      </div>
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </main>
</div>

<!-- User Detail Modal -->
{#if showUserModal && selectedUser}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 print:hidden"
       on:click={closeUserModal}
       on:keydown={(e) => e.key === 'Escape' && closeUserModal()}>
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
         on:click|stopPropagation>
      <!-- Modal Header -->
      <div class="flex justify-between items-start mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          Kullanıcı Detayları
        </h3>
        <button
          on:click={closeUserModal}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- User Info -->
      <div class="space-y-4">
        <div class="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          {#if selectedUser.avatarUrl}
            <img
              src={selectedUser.avatarUrl}
              alt={selectedUser.name}
              class="w-20 h-20 rounded-full object-cover"
            />
          {:else}
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              <span class="text-white font-bold text-2xl">
                {getUserInitials(selectedUser.name)}
              </span>
            </div>
          {/if}
          <div>
            <h4 class="text-xl font-bold text-gray-900 dark:text-white">
              {selectedUser.name}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {selectedUser.email}
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between py-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Pozisyon:</span>
            <span class="px-3 py-1 rounded-full text-xs font-medium {getPositionColor(selectedUser.title)}">
              {selectedUser.title}
            </span>
          </div>

          <div class="flex items-center justify-between py-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Rol:</span>
            <span class="px-3 py-1 rounded-full text-xs font-medium {getRoleBadgeColor(selectedUser.role)}">
              {getRoleLabel(selectedUser.role)}
            </span>
          </div>

          {#if selectedUser.managerId}
            <div class="flex items-center justify-between py-2">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Yönetici:</span>
              <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {getManagerName(selectedUser.managerId)}
              </span>
            </div>
          {/if}
        </div>

        <!-- Actions -->
        <div class="pt-4 flex gap-2">
          <button
            on:click={() => {
              if (selectedUser) goto(`/admin/users?id=${selectedUser.id}`);
            }}
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Detaylı Profil
          </button>
          <button
            on:click={closeUserModal}
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @media print {
    :global(header),
    :global(aside),
    :global(button) {
      display: none !important;
    }

    main {
      margin-left: 0 !important;
      padding-top: 0 !important;
    }

    :global(.no-print) {
      display: none !important;
    }
  }
</style>
