<script lang="ts">
  import { onMount } from "svelte";
  import { userStore } from "$lib/store/store.js";
  import { goto } from "$app/navigation";
  import Header from "$lib/components/layout/Header/Header.svelte";
  import Sidebar from "$lib/components/layout/Sidebar/Sidebar.svelte";
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
    if (window.innerWidth < 768) {
      isSidebarOpen = false;
    }
    // Önce veriyi dene; 403 alırsak yönlendir. userStore role gecikmeli yüklenebilir.
    await fetchOrganizationData();
  });

  async function fetchOrganizationData() {
    try {
      loading = true;
      error = "";
      const raw = await getOrganizationChart();
      const list = Array.isArray(raw) ? raw : (raw?.departments ?? raw?.data ?? []);
      organizationData = list;
      filteredDepartments = list;
      retryCount = 0;
    } catch (err: any) {
      const status = err?.statusCode ?? err?.status;
      if (status === 403 || status === 401) {
        goto("/dashboard");
        return;
      }
      error = err.message || "Organizasyon verileri yüklenirken bir hata oluştu";
      toastStore.error(error);
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

  function getRoleBadgeColor(role: string | undefined | null): string {
    const r = String(role ?? "user").toLowerCase();
    switch (r) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  }

  function getRoleLabel(role: string | undefined | null): string {
    const r = String(role ?? "user").toLowerCase();
    switch (r) {
      case "admin": return "Admin";
      case "manager": return "Yönetici";
      default: return "Kullanıcı";
    }
  }

  function getUserInitials(name: string | undefined | null): string {
    const s = String(name ?? "").trim();
    if (!s) return "?";
    return s
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  }

  function getManagerName(managerId: string | null | undefined): string {
    if (!managerId) return "Yönetici Yok";
    const data = Array.isArray(organizationData) ? organizationData : [];
    for (const dept of data) {
      const members = dept.members ?? [];
      const manager = members.find((m: OrgMember) => m.id === managerId);
      if (manager) return manager.name ?? manager.email ?? "Bilinmiyor";
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

  function escapeCsvCell(val: string): string {
    const s = String(val ?? "").replace(/"/g, '""');
    return `"${s}"`;
  }

  function exportToCSV() {
    const headers = ["Ad Soyad", "E-posta", "Direktörlük", "Pozisyon", "Rol", "Yönetici"];
    const rows: string[][] = [];

    filteredDepartments.forEach(dept => {
      (dept.members ?? []).forEach((member: OrgMember) => {
        rows.push([
          member.name ?? "",
          member.email ?? "",
          dept.department ?? "",
          member.title ?? "",
          getRoleLabel(member.role),
          getManagerName(member.managerId)
        ]);
      });
    });

    const csvLine = (row: string[]) => row.map(escapeCsvCell).join(",");
    const csvContent = [
      csvLine(headers),
      ...rows.map(csvLine)
    ].join("\r\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `organizasyon_${new Date().toISOString().split("T")[0]}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
    toastStore.success("CSV dosyası başarıyla indirildi");
  }

  function printOrganization() {
    window.print();
  }

  // Şema için hiyerarşi: departman -> yöneticiler -> ekip
  $: orgTree = (() => {
    const tree: { dept: string; managers: { manager: OrgMember; subordinates: OrgMember[] }[] }[] = [];
    const depts = Array.isArray(filteredDepartments) ? filteredDepartments : [];
    for (const dept of depts) {
      const members = dept.members ?? [];
      const managers = members.filter((m: OrgMember) => m.role === "manager" || m.role === "admin");
      const subordinates = members.filter((m: OrgMember) => m.role !== "manager" && m.role !== "admin");
      const byManager = new Map<string, OrgMember[]>();
      for (const sub of subordinates) {
        const mid = sub.managerId || "_none_";
        if (!byManager.has(mid)) byManager.set(mid, []);
        byManager.get(mid)!.push(sub);
      }
      const managerNodes = managers.map(manager => ({
        manager,
        subordinates: byManager.get(manager.id) || []
      }));
      if (subordinates.some(s => !s.managerId)) {
        const unassigned = subordinates.filter(s => !s.managerId);
        if (unassigned.length && !managerNodes.some(m => m.manager.id === "_none_")) {
          managerNodes.push({ manager: { id: "_none_", name: "Yönetici atanmamış", email: "", title: "", avatarUrl: null, role: "user", managerId: null }, subordinates: unassigned });
        }
      }
      if (managerNodes.length === 0 && members.length > 0) {
        managerNodes.push({ manager: members[0], subordinates: members.slice(1) });
      }
      tree.push({ dept: dept.department, managers: managerNodes });
    }
    return tree;
  })();

  // Reactive filtering
  $: if (searchValue) {
    const source = Array.isArray(organizationData) ? organizationData : [];
    filteredDepartments = source
      .map((dept) => ({
        ...dept,
        members: dept.members.filter(
          (member: OrgMember) =>
            (member.name || "").toLowerCase().includes(searchValue.toLowerCase()) ||
            (member.email || "").toLowerCase().includes(searchValue.toLowerCase()) ||
            (member.title || "").toLowerCase().includes(searchValue.toLowerCase()) ||
            (dept.department || "").toLowerCase().includes(searchValue.toLowerCase())
        ),
      }))
      .filter((dept) => (dept.members?.length ?? 0) > 0);
  } else {
    filteredDepartments = Array.isArray(organizationData) ? organizationData : [];
  }

  // Calculate statistics (API bazen dizi dışı dönebilir, güvenli kullan)
  $: safeOrgData = Array.isArray(organizationData) ? organizationData : [];
  $: totalUsers = safeOrgData.reduce((sum, dept) => sum + (dept.count ?? dept.members?.length ?? 0), 0);
  $: totalAdmins = safeOrgData.reduce((sum, dept) => sum + (dept.members?.filter((m: OrgMember) => m.role === 'admin').length ?? 0), 0);
  $: totalManagers = safeOrgData.reduce((sum, dept) => sum + (dept.members?.filter((m: OrgMember) => m.role === 'manager').length ?? 0), 0);
  $: totalDepartments = safeOrgData.length;

  function getDepartmentStats(dept: DepartmentData) {
    const members = dept.members ?? [];
    const total = members.length;
    const roles = members.reduce((acc, member) => {
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
  />

  <Sidebar bind:isOpen={isSidebarOpen} />

  <main
    class="transition-all duration-300 pt-16 {isSidebarOpen
      ? 'ml-0 md:ml-64'
      : 'ml-0'}"
  >
    <div class="container mx-auto px-4 py-6 max-w-4xl">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print-content">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Organizasyon Şeması
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Direktörlükler ve ekip yapısı — kim hangi birimde, kime bağlı
          </p>
        </div>

        <!-- Action Buttons -->
        {#if !loading && !error && totalUsers > 0}
          <div class="flex flex-wrap items-center gap-2">
            <button
              on:click={exportToCSV}
              class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              CSV
            </button>

            <button
              on:click={fetchOrganizationData}
              class="p-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Yenile"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
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
        <!-- Arama -->
        <div class="mb-4 no-print-content">
          <label for="org-search" class="sr-only">Direktörlük veya kişi ara</label>
          <input
            id="org-search"
            type="search"
            bind:value={searchValue}
            placeholder="Direktörlük veya kişi ara..."
            class="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Özet: 4 kutu yan yana -->
        <div class="mb-6 no-print-content">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Özet</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg shrink-0">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">Kişi</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{totalUsers}</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg shrink-0">
                <svg class="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">Direktörlük</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{totalDepartments}</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg shrink-0">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{totalAdmins}</p>
              </div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div class="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg shrink-0">
                <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400">Yönetici</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{totalManagers}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Hiyerarşi: Yönetici → Ekip (yazdırmada tek sayfa olarak çıkar) -->
        <div class="org-chart-diagram print-only-content mb-8">
          <!-- Yazdırma başlığı: sadece print'te görünür -->
          <div class="print-header">
            <h1 class="print-title">Organizasyon Şeması</h1>
            <p class="print-date">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div class="flex items-center gap-2 mb-4 no-print-header">
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Yapı</h2>
            <span class="text-xs text-gray-500 dark:text-gray-400">— Yöneticiler üstte, ekip altında</span>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-x-auto print-chart-box">
            <div class="org-chart-tree inline-block min-w-0">
              {#each orgTree as { dept, managers }}
                <div class="dept-block mb-6 last:mb-0">
                  <div class="dept-header mb-3 pb-2 border-b border-blue-400 dark:border-blue-500">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">{dept}</span>
                  </div>
                  <div class="flex flex-wrap gap-4 items-start">
                    {#each managers as { manager, subordinates }}
                      <div class="org-node flex flex-col items-center shrink-0">
                        <div
                          class="node-card rounded-lg border p-3 bg-gray-50 dark:bg-gray-700/50 w-[140px] text-center {manager.role === 'admin' ? 'border-purple-500 dark:border-purple-400' : manager.role === 'manager' ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600'}"
                        >
                          <div class="flex justify-center mb-1">
                            {#if manager.avatarUrl}
                              <img src={manager.avatarUrl} alt={manager.name} class="w-9 h-9 rounded-full object-cover" />
                            {:else}
                              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                                {getUserInitials(manager.name)}
                              </div>
                            {/if}
                          </div>
                          <p class="text-sm font-semibold text-gray-900 dark:text-white truncate" title={manager.name ?? manager.email ?? ''}>{manager.name || manager.email || '—'}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{manager.title || '—'}</p>
                          <span class="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium {getRoleBadgeColor(manager.role)}">{getRoleLabel(manager.role)}</span>
                        </div>
                        {#if subordinates.length > 0}
                          <div class="connector-line w-px bg-gray-300 dark:bg-gray-600 my-1 flex-1 min-h-[8px]"></div>
                          <div class="sub-nodes flex flex-wrap justify-center gap-2">
                            {#each subordinates as sub}
                              <button
                                type="button"
                                on:click={() => openUserModal(sub)}
                                class="node-card rounded-lg border border-gray-200 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 w-[120px] text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                              >
                                <div class="flex justify-center mb-0.5">
                                  {#if sub.avatarUrl}
                                    <img src={sub.avatarUrl} alt={sub.name} class="w-6 h-6 rounded-full object-cover" />
                                  {:else}
                                    <div class="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-[10px] font-medium mx-auto">
                                      {getUserInitials(sub.name)}
                                    </div>
                                  {/if}
                                </div>
                                <p class="text-xs font-medium text-gray-900 dark:text-white truncate" title={sub.name ?? sub.email ?? ''}>{sub.name || sub.email || '—'}</p>
                                <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">{sub.title || '—'}</p>
                              </button>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Direktörlükler: Tıklanabilir kişi kartları -->
        <div class="space-y-4 no-print-content">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Direktörlükler</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">Karta tıklayarak kişi detayını aç</p>
          </div>
          {#each filteredDepartments as department}
            {@const stats = getDepartmentStats(department)}
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-base font-bold text-white">{department.department}</span>
                  <span class="text-blue-100 text-xs">({stats.total} kişi)</span>
                </div>
                <div class="flex gap-1.5 flex-wrap">
                  {#each Object.entries(stats.roles) as [role, count]}
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-white/20 text-white">{role}: {count}</span>
                  {/each}
                </div>
              </div>
              <div class="p-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {#each (department.members ?? []) as member}
                    <button
                      on:click={() => openUserModal(member)}
                      class="flex items-center gap-3 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 text-left w-full transition-colors"
                    >
                      {#if member.avatarUrl}
                        <img src={member.avatarUrl} alt="" class="w-10 h-10 rounded-full object-cover shrink-0" />
                      {:else}
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shrink-0">
                          <span class="text-white font-semibold text-xs">{getUserInitials(member.name ?? member.email)}</span>
                        </div>
                      {/if}
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">{member.name || member.email || '—'}</span>
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 {getRoleBadgeColor(member.role)}">{getRoleLabel(member.role)}</span>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{member.title || '—'}</p>
                        {#if member.managerId}
                          <p class="text-[10px] text-gray-400 dark:text-gray-500 truncate">↑ {getManagerName(member.managerId)}</p>
                        {/if}
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
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-5"
         on:click|stopPropagation>
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Kişi detayı
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

      <div class="space-y-3">
        <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          {#if selectedUser.avatarUrl}
            <img src={selectedUser.avatarUrl} alt="" class="w-14 h-14 rounded-full object-cover shrink-0" />
          {:else}
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-lg">{getUserInitials(selectedUser.name)}</span>
            </div>
          {/if}
          <div class="min-w-0">
            <h4 class="text-base font-bold text-gray-900 dark:text-white truncate">{selectedUser.name}</h4>
            <p class="text-xs text-gray-600 dark:text-gray-400 truncate">{selectedUser.email}</p>
          </div>
        </div>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between gap-2">
            <dt class="text-gray-500 dark:text-gray-400">Pozisyon</dt>
            <dd><span class="px-2 py-0.5 rounded text-xs font-medium {getPositionColor(selectedUser.title)}">{selectedUser.title || '—'}</span></dd>
          </div>
          <div class="flex justify-between gap-2">
            <dt class="text-gray-500 dark:text-gray-400">Rol</dt>
            <dd><span class="px-2 py-0.5 rounded text-xs font-medium {getRoleBadgeColor(selectedUser.role)}">{getRoleLabel(selectedUser.role)}</span></dd>
          </div>
          {#if selectedUser.managerId}
            <div class="flex justify-between gap-2">
              <dt class="text-gray-500 dark:text-gray-400">Yönetici</dt>
              <dd class="font-medium text-gray-900 dark:text-white truncate">{getManagerName(selectedUser.managerId)}</dd>
            </div>
          {/if}
        </dl>
        <div class="pt-3 flex gap-2">
          <button
            on:click={() => { if (selectedUser) goto(`/admin/users?id=${selectedUser.id}`); }}
            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Detaylı profil
          </button>
          <button
            on:click={closeUserModal}
            class="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-xs font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .org-chart-tree .dept-block:last-child {
    margin-bottom: 0;
  }
  .connector-line {
    flex-shrink: 0;
  }

  /* Yazdırma başlığı: ekranda gizli */
  .print-header {
    display: none;
  }
  .print-header .print-title,
  .print-header .print-date {
    margin: 0;
  }

  @media print {
    /* Uygulama çerçevesini gizle: Header ve Sidebar */
    :global(header),
    :global(aside),
    :global(.header),
    :global(.sidebar),
    :global(nav),
    :global(.print\\:hidden),
    :global(.no-print),
    .no-print-content,
    .no-print-header,
    button {
      display: none !important;
    }

    /* Sayfa düzeni: sadece yazdırılacak alan görünsün */
    :global(body),
    :global(html) {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    :global(.min-h-screen) {
      background: white !important;
    }

    main {
      margin: 0 !important;
      padding: 0 !important;
      max-width: none !important;
    }

    main * {
      visibility: hidden;
    }

    .print-only-content,
    .print-only-content * {
      visibility: visible;
    }

    .print-only-content {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 1.5cm !important;
      background: white !important;
      box-shadow: none !important;
      border: none !important;
    }

    /* Yazdırma başlığı: sadece print'te görünsün */
    .print-header {
      display: block !important;
      text-align: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #1e40af;
    }
    .print-header .print-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      line-height: 1.3;
    }
    .print-header .print-date {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .print-chart-box {
      box-shadow: none !important;
      border: 1px solid #e5e7eb !important;
      border-radius: 0.5rem;
    }
    .print-only-content .node-card {
      break-inside: avoid;
    }
    .print-only-content .dept-block {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
</style>
