<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import type { RecentReport } from "$lib/services/reportService.js";
  import {
    getReportDetails,
    downloadReportPdf,
    type ReportDetails,
  } from "$lib/services/reportService.js";
  import { toastStore } from "$lib/store/toastStore.js";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { getErrorMessage } from "$lib/services/errorHandler.js";

  export let isOpen: boolean = false;
  export let report: RecentReport | null = null;

  let reportDetails: ReportDetails | null = null;
  let loading = true;

  $: if (isOpen && report) {
    loadReportDetails();
  }

  async function loadReportDetails() {
    loading = true;
    reportDetails = null;

    if (report) {
      try {
        reportDetails = await getReportDetails(report.id);
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        toastStore.error(errorMsg);
      } finally {
        loading = false;
      }
    }
  }

  function closeModal() {
    isOpen = false;
    reportDetails = null;
  }

  function viewFullReport() {
    if (report && reportDetails) {
      // Haftalık raporun haftasını belirle (startDate'in haftası)
      const [day, month, year] = reportDetails.startDate.split('.');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Haftanın başlangıcını bul (Pazartesi)
      const dayOfWeek = startDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + daysToMonday);
      
      // Haftanın bitişini bul (Cuma)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4);
      
      // Tarihleri DD.MM.YYYY formatına çevir
      const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
      };
      
      const weekStartStr = formatDate(weekStart);
      const weekEndStr = formatDate(weekEnd);
      
      // Rapor detay sayfasına git ve hafta filtresi ekle
      goto(`/archive/${report.id}?weekStart=${weekStartStr}&weekEnd=${weekEndStr}`);
      closeModal();
    }
  }

  async function handleDownloadPdf() {
    if (report) {
      try {
        toastStore.info("PDF indiriliyor...");
        await downloadReportPdf(report.id);
        toastStore.success("PDF başarıyla indirildi!");
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        toastStore.error(errorMsg);
      }
    }
  }

  function getDailySummary(): string {
    if (!reportDetails?.dailyReports) return "";

    return reportDetails.dailyReports
      .map((day) => {
        const taskCount = day.tasks.length;
        const totalHours = day.tasks.reduce(
          (sum, task) => sum + task.estimatedHours,
          0
        );
        return `${day.day}: ${taskCount} Task, ${totalHours} Saat`;
      })
      .join(" • ");
  }
</script>

{#if isOpen && report}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 cursor-default"
    on:click={closeModal}
    on:keydown={(e) => e.key === "Escape" && closeModal()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  >
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      on:click|stopPropagation={() => {}}
      on:keydown|stopPropagation={() => {}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between"
      >
        <h2
          id="modal-title"
          class="text-2xl font-bold text-gray-900 dark:text-white"
        >
          Rapor Önizleme
        </h2>
        <button
          on:click={closeModal}
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Kapat"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-6">
        {#if loading}
          <!-- Loading Skeleton -->
          <div class="animate-pulse space-y-4">
            <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            <div class="flex items-center gap-4">
              <div
                class="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"
              ></div>
              <div class="flex-1 space-y-2">
                <div
                  class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"
                ></div>
                <div
                  class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"
                ></div>
              </div>
            </div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          </div>
        {:else if reportDetails}
          <div class="mb-4">
            <p class="text-lg text-gray-600 dark:text-gray-400">
              {reportDetails.startDate} - {reportDetails.endDate}
            </p>
          </div>

          <div
            class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
          >
            <img
              src={reportDetails.user.avatarUrl}
              alt={`${reportDetails.user.firstName} ${reportDetails.user.lastName}`}
              width="64"
              height="64"
              class="w-16 h-16 rounded-full border-2 border-blue-100"
            />
            <div class="flex-1 space-y-1">
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {reportDetails.user.firstName} - {reportDetails.user.lastName}
              </p>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">EKİP</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{reportDetails.user.squad || "—"}</p>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-1">DİREKTÖRLÜK</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{reportDetails.user.department || "—"}</p>
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-1">MAİL</p>
              <p class="text-sm text-gray-700 dark:text-gray-300">{reportDetails.user.email}</p>
            </div>
          </div>

          <div>
            <h4
              class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
            >
              Haftalık Özet
            </h4>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {getDailySummary()}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-400">Toplam Gün</p>
              <p
                class="text-2xl font-bold text-blue-100 dark:text-indigo-400"
              >
                {reportDetails.dailyReports.length}
              </p>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Toplam Task
              </p>
              <p class="text-2xl font-bold text-green-100 dark:text-green-400">
                {reportDetails.dailyReports.reduce(
                  (sum, day) => sum + day.tasks.length,
                  0
                )}
              </p>
            </div>
          </div>
        {:else}
          <div class="text-center py-8">
            <p class="text-gray-600 dark:text-gray-400">
              Rapor detayları yüklenemedi.
            </p>
          </div>
        {/if}
      </div>

      <div
        class="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700"
      >
        <Button
          text="PDF İndir"
          variant="secondary"
          on:click={handleDownloadPdf}
          disabled={loading || !reportDetails}
        />
        <Button
          text="Raporun Tamamını Görüntüle"
          variant="primary"
          on:click={viewFullReport}
          disabled={loading || !reportDetails}
        />
      </div>
    </div>
  </div>
{/if}
