<script lang="ts">
  import { onMount } from "svelte";
  import Button from "../../ui/Button/Button.svelte";
  import Input from "../../ui/Input/Input.svelte";
  import ReportViewModal from "../../ui/ReportViewModal/ReportViewModal.svelte";
  import {
    getAdminReports,
    getReportDetails,
    type AdminReport,
    type ReportDetail,
  } from "$lib/services/adminReportService.js";
  import { goto } from "$app/navigation";
  import { getErrorMessage } from "$lib/services/errorHandler.js";
  import { formatTRDate } from "$lib/utils/dateUtils.js";

  let reports: AdminReport[] = [];
  let filteredReports: AdminReport[] = [];
  let loading = true;
  let searchQuery = "";
  let errorMessage = "";
  
  // Modal state
  let isModalOpen = false;
  let selectedReport: ReportDetail | null = null;
  let loadingReport = false;

  onMount(async () => {
    await loadReports();
  });

  async function loadReports() {
    loading = true;
    errorMessage = "";
    try {
      // Tüm raporları getir (limit=10000 ile tek seferde)
      const response = await getAdminReports({ 
        page: 1, 
        limit: 10000, 
        sort: "desc" 
      });
      reports = response.reports;
      filteredReports = reports;
    } catch (error) {
      errorMessage = getErrorMessage(error);
    } finally {
      loading = false;
    }
  }

  async function handleViewReport(reportId: string) {
    try {
      loadingReport = true;
      isModalOpen = true;
      selectedReport = await getReportDetails(reportId);
    } catch (error) {
      errorMessage = getErrorMessage(error);
      isModalOpen = false;
    } finally {
      loadingReport = false;
    }
  }

  function handleCloseModal() {
    isModalOpen = false;
    selectedReport = null;
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      filteredReports = reports;
      return;
    }

    const query = searchQuery.toLowerCase();
    filteredReports = reports.filter(
      (report) =>
        report.user?.firstName?.toLowerCase().includes(query) ||
        report.user?.lastName?.toLowerCase().includes(query) ||
        report.user?.email?.toLowerCase().includes(query) ||
        report.title?.toLowerCase().includes(query),
    );
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
        Rapor Yönetimi
      </h1>
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div class="flex gap-4">
      <Input
        bind:value={searchQuery}
        placeholder="Rapor veya kullanıcı ara..."
        type="text"
        className="flex-1"
      />
      <Button onClick={handleSearch} text="Ara" variant="primary" />
    </div>
  </div>

  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    {#if loading}
      <div class="p-8 text-center text-gray-500 dark:text-gray-400">
        Yükleniyor...
      </div>
    {:else}
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
                Rapor
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                Tarih Aralığı
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                Task Sayısı
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                Oluşturulma
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each filteredReports as report}
              {#if report.user}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      {#if report.user.avatarUrl}
                        <img
                          src={report.user.avatarUrl}
                          alt={`${report.user.firstName} ${report.user.lastName}`}
                          class="w-10 h-10 rounded-full ring-2 ring-indigo-400 object-cover"
                          loading="lazy"
                          on:error={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      {/if}
                      <div 
                        class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm"
                        style="display: {report.user.avatarUrl ? 'none' : 'flex'};"
                      >
                        {(() => {
                          const f = (report.user.firstName || '').charAt(0).toUpperCase();
                          const l = (report.user.lastName || '').charAt(0).toUpperCase();
                          return (f + l) || '?';
                        })()}
                      </div>
                      <div>
                        <div class="font-semibold text-gray-900 dark:text-white">
                          {report.user.firstName || 'İsimsiz'}
                          {report.user.lastName || ''}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {report.user.email || 'Email yok'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                  >
                    {report.title || 'Başlıksız Rapor'}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                  >
                    {report.startDate || '-'} - {report.endDate || '-'}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                  >
                    {report.taskCount || 0}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                  >
                    {report.createdAt ? formatTRDate(report.createdAt) : '—'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <Button
                      onClick={() => handleViewReport(report.id)}
                      text="Görüntüle"
                      variant="secondary"
                      size="small"
                    />
                  </td>
                </tr>
              {:else}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Kullanıcı bilgisi eksik olan rapor (ID: {report.id})
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>

      {#if filteredReports.length === 0}
        <div class="p-8 text-center text-gray-500 dark:text-gray-400">
          Rapor bulunamadı
        </div>
      {/if}
    {/if}
  </div>
</div>

<ReportViewModal
  bind:isOpen={isModalOpen}
  bind:report={selectedReport}
  loading={loadingReport}
  on:close={handleCloseModal}
/>
