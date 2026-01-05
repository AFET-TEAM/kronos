<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ReportDetail } from "$lib/services/adminReportService.js";

  export let report: ReportDetail | null = null;
  export let isOpen = false;
  export let loading = false;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      "not-started": "Başlanmadı",
      "in-progress": "Devam Ediyor",
      "completed": "Tamamlandı",
      "cancelled": "İptal Edildi",
      "on-hold": "Beklemede",
    };
    return statusMap[status] || status;
  }

  function getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      "not-started": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "completed": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "cancelled": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "on-hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
        <h2 id="modal-title" class="text-2xl font-bold text-white">
          📊 Rapor Detayları
        </h2>
        <button
          on:click={close}
          class="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/20 rounded-lg"
          aria-label="Kapat"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        {#if loading}
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        {:else if report}
          <!-- User Info -->
          {#if report.user}
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 mb-6">
              <div class="flex items-center gap-4">
                {#if report.user.avatarUrl}
                  <img
                    src={report.user.avatarUrl}
                    alt={`${report.user.firstName} ${report.user.lastName}`}
                    class="w-16 h-16 rounded-full ring-4 ring-white dark:ring-gray-600"
                  />
                {:else}
                  <div class="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white dark:ring-gray-600">
                    {report.user.firstName?.charAt(0) || "?"}
                  </div>
                {/if}
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    {report.user.firstName} {report.user.lastName}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{report.user.email}</p>
                  {#if report.user.squad}
                    <span class="inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      {report.user.squad}
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          {/if}

          <!-- Report Summary -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Rapor Başlığı</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Tarih Aralığı</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {report.startDate} - {report.endDate}
              </p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Görev</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{report.taskCount}</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Saat</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">{report.totalHours || 0}h</p>
            </div>
          </div>

          <!-- Tasks -->
          {#if report.tasks && report.tasks.length > 0}
            <div class="mb-6">
              <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>📋</span> Görevler
              </h4>
              <div class="space-y-3">
                {#each report.tasks as task, index}
                  <div class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <span class="text-sm font-semibold text-gray-500 dark:text-gray-400">#{index + 1}</span>
                          <span class="px-2 py-1 text-xs font-semibold rounded-full {getStatusColor(task.status)}">
                            {getStatusLabel(task.status)}
                          </span>
                        </div>
                        <p class="text-gray-900 dark:text-white font-medium mb-2">{task.description}</p>
                        <div class="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                          {#if task.project}
                            <span class="flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                              {task.project}
                            </span>
                          {/if}
                          {#if task.date}
                            <span class="flex items-center gap-1">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {task.date}
                            </span>
                          {/if}
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">{task.hours}h</span>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {:else}
            <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p class="text-yellow-800 dark:text-yellow-300 text-center">Bu raporda görev bulunmuyor</p>
            </div>
          {/if}

          <!-- Notes -->
          {#if report.notes}
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 class="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                <span>📝</span> Notlar
              </h4>
              <p class="text-amber-800 dark:text-amber-200 whitespace-pre-wrap">{report.notes}</p>
            </div>
          {/if}

          <!-- Additional Info -->
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Oluşturulma Tarihi: {formatDate(report.createdAt)}</span>
              {#if report.totalOvertime && report.totalOvertime > 0}
                <span class="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 rounded-full font-semibold">
                  Fazla Mesai: {report.totalOvertime}h
                </span>
              {/if}
            </div>
          </div>
        {:else}
          <div class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Rapor bulunamadı</p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-600">
        <button
          on:click={close}
          class="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg transition-colors"
        >
          Kapat
        </button>
        {#if report}
          <button
            on:click={() => window.open(`/api/reports/${report.id}/pdf`, '_blank')}
            class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF İndir
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}
