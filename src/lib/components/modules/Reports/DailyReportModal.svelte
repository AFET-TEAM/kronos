<script lang="ts">
  import Button from "$lib/components/ui/Button/Button.svelte";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import TextArea from "$lib/components/ui/TextArea/TextArea.svelte";
  import Checkbox from "$lib/components/ui/Checkbox/Checkbox.svelte";
  import GeneralSelectbox from "$lib/components/ui/GeneralSelectbox/GeneralSelectbox.svelte";
  import { saveDailyReport, getDailyReport } from "$lib/store/reportStore.js";
  import { toastStore } from "$lib/store/toastStore.js";
  import { createDailyReport, updateDailyReport } from "$lib/services/reportService.js";
  import { getErrorMessage, getValidationErrors } from "$lib/services/errorHandler.js";

  export let isOpen = false;
  export let selectedDate = "";
  export let existingReport: import("$lib/services/reportService.js").DailyReport | null = null;
  export let onClose: () => void;
  export let onReportSaved: (() => void) | undefined = undefined;

  type Task = {
    taskName: string;
    taskNumber: string;
    estimatedHours: number;
    description: string;
    status?: "Analiz" | "Devam Ediyor" | "Tamamlandı";
  };

  const statusOptions = [
    { value: "Analiz", label: "Analiz" },
    { value: "Devam Ediyor", label: "Devam Ediyor" },
    { value: "Tamamlandı", label: "Tamamlandı" },
  ];

  let tasks: Task[] = [
    {
      taskName: "",
      taskNumber: "",
      estimatedHours: 0,
      description: "",
      status: "Devam Ediyor",
    },
  ];
  let untrackedWork = "";
  let isOnLeave = false;
  let isSaving = false;

  let reportId: string | null = null;
  let isEditMode = false;

  function closeModal() {
    isOpen = false;
    tasks = [
      { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
    ];
    untrackedWork = "";
    isOnLeave = false;
    isSaving = false;
    reportId = null;
    isEditMode = false;
    onClose();
  }

  function addTask() {
    tasks = [
      ...tasks,
      {
        taskName: "",
        taskNumber: "",
        estimatedHours: 0,
        description: "",
        status: "Devam Ediyor",
      },
    ];
  }

  function removeTask(index: number) {
    tasks = tasks.filter((_, i) => i !== index);
  }

  async function handleSubmit() {
    const hasAnyContent =
      isOnLeave ||
      tasks.some((t) => t.taskName) ||
      untrackedWork.trim();

    if (!selectedDate || !hasAnyContent) {
      toastStore.warning(
        "LÃ¼tfen en az bir alan doldurun (Task veya Task Harici)",
      );
      return;
    }

    const dayName = getDayName(selectedDate);
    const formattedDate = formatDate(selectedDate);

    const dailyReportData = {
      day: dayName,
      date: formattedDate,
      tasks: isOnLeave ? [] : tasks.filter((t) => t.taskName),
      untrackedWork: untrackedWork.trim(),
      isOnLeave: isOnLeave,
    };

    // Önce localStorage'a kaydet (haftalık rapor oluştururken kullanılabilir)
    saveDailyReport(selectedDate, dailyReportData);

    // Backend'e kaydet veya güncelle
    isSaving = true;
    try {
      if (isEditMode && reportId) {
        // Mevcut raporu güncelle
        await updateDailyReport(reportId, formattedDate, dailyReportData);
        toastStore.success("Günlük rapor başarıyla güncellendi!");
      } else {
        // Yeni rapor oluştur
        await createDailyReport(formattedDate, dailyReportData);
        toastStore.success("Günlük rapor başarıyla kaydedildi!");
      }
      
      // Dashboard'Ä± yenile
      if (onReportSaved) {
        onReportSaved();
      }
      
      closeModal();
    } catch (error) {
      const validationErrors = getValidationErrors(error);
      if (validationErrors.length > 0) {
        // Validasyon hatalarını göster
        validationErrors.forEach(errMsg => {
          toastStore.error(errMsg);
        });
      } else {
        // Genel hata mesajını göster
        const errorMsg = getErrorMessage(error);
        toastStore.error(`Rapor kaydedilemedi: ${errorMsg}`);
      }
    } finally {
      isSaving = false;
    }
  }

  function formatDate(dateString: string): string {
    if (!dateString) return "";
    
    // YYYY-MM-DD formatÄ±nda gelen tarihi parse et
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}.${month}.${year}`;
    }
    
    // Alternatif: Date objesi ile parse et
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  function getDayName(dateString: string): string {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "";
    }
    
    const dayNames = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ];
    return dayNames[date.getDay()];
  }

  $: hasAnyContent =
    isOnLeave ||
    tasks.some((task) => task.taskName) ||
    untrackedWork.trim();
  $: formattedDate = formatDate(selectedDate);
  $: dayName = getDayName(selectedDate);

  $: if (isOpen && selectedDate) {
    if (existingReport && existingReport.id) {
      // Backend'den gelen raporu yÃ¼kle
      reportId = existingReport.id;
      isEditMode = true;
      loadReportFromBackend(existingReport);
    } else {
      // LocalStorage'dan yÃ¼kle (yeni rapor iÃ§in)
      reportId = null;
      isEditMode = false;
      loadExistingReport();
    }
  }

  // existingReport deÄŸiÅŸtiÄŸinde de yÃ¼kle
  $: if (isOpen && existingReport && existingReport.id) {
    reportId = existingReport.id;
    isEditMode = true;
    loadReportFromBackend(existingReport);
  }

  // Clear all data when on leave is checked
  $: if (isOnLeave) {
    tasks = [
      {
        taskName: "",
        taskNumber: "",
        estimatedHours: 0,
        description: "",
        status: "Devam Ediyor",
      },
    ];
    untrackedWork = "";
  }

  function loadReportFromBackend(report: import("$lib/services/reportService.js").DailyReport) {
    // Backend'den gelen raporu yÃ¼kle
    tasks =
      report.tasks && report.tasks.length > 0
        ? report.tasks.map((t: any) => ({
            taskName: t.taskName || "",
            taskNumber: t.taskNumber || "",
            estimatedHours: t.estimatedHours || 0,
            description: t.description || "",
            status: mapStatusFromBackend(t.status) || "Devam Ediyor",
          }))
        : [
            {
              taskName: "",
              taskNumber: "",
              estimatedHours: 0,
              description: "",
              status: "Devam Ediyor",
            },
          ];

    untrackedWork = report.untrackedWork || "";
    isOnLeave = report.isOnLeave || false;
  }

  function loadExistingReport() {
    const existingReport = getDailyReport(selectedDate);
    if (existingReport) {
      tasks =
        existingReport.tasks.length > 0
          ? existingReport.tasks
          : [
              {
                taskName: "",
                taskNumber: "",
                estimatedHours: 0,
                description: "",
                status: "Devam Ediyor",
              },
            ];

      untrackedWork = existingReport.untrackedWork || "";
      isOnLeave = existingReport.isOnLeave || false;
    } else {
      tasks = [
        {
          taskName: "",
          taskNumber: "",
          estimatedHours: 0,
          description: "",
          status: "Devam Ediyor",
        },
      ];
      untrackedWork = "";
      isOnLeave = false;
    }
  }

  function mapStatusFromBackend(status: string | undefined): string | undefined {
    if (!status) return undefined;
    const statusMap: Record<string, string> = {
      "TODO": "Analiz",
      "IN_PROGRESS": "Devam Ediyor",
      "DONE": "Tamamlandı",
      "WAITING": "Beklemede",
      "XL_BLOCK": "Bloklu"
    };
    return statusMap[status] || status;
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-default"
    on:click={closeModal}
    on:keydown={(e) => e.key === "Escape" && closeModal()}
    role="button"
    tabindex="-1"
    aria-label="Close modal"
  >
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      on:click|stopPropagation={() => {}}
      on:keydown|stopPropagation={() => {}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        class="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 rounded-t-2xl"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="text-xl font-semibold text-slate-900 dark:text-slate-100"
              id="modal-title"
            >
              {isEditMode ? "Günlük Rapor Düzenle" : "Günlük Rapor Ekle"}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {dayName} – {formattedDate}
            </p>
          </div>
          <button
            on:click={closeModal}
            class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg p-1"
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
      </div>

      <!-- Content -->
      <div class="overflow-y-auto max-h-[calc(90vh-180px)]">
        <div class="p-6 space-y-6">
          <!-- On Leave Section -->
          <div
            class="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg p-4"
          >
            <Checkbox
              bind:checked={isOnLeave}
              label="🏖️ Bu gün izinliyim"
              name="isOnLeave-{selectedDate}"
            />
            {#if isOnLeave}
              <p class="text-xs text-sky-700 dark:text-sky-100 mt-2 ml-7">
                İzinli günler için diğer bilgiler girilmez.
              </p>
            {/if}
          </div>

          <!-- Tasks Section -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Görevler
                </h3>
              </div>
              <Button
                text="+ Task Ekle"
                variant="secondary"
                size="small"
                onClick={addTask}
                disabled={isOnLeave}
              />
            </div>

            <div class="space-y-4">
              {#each tasks as task, index}
                <div
                  class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 p-4 space-y-3"
                >
                  <div class="flex items-start justify-between">
                    <span
                      class="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Task #{index + 1}
                    </span>
                    {#if tasks.length > 1}
                      <button
                        on:click={() => removeTask(index)}
                        class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Task'ı sil"
                      >
                        <svg
                          class="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    {/if}
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        for="task-name-{index}"
                        class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                      >
                        Task Adı
                      </label>
                      <Input
                        type="text"
                        placeholder="Örn: Login Sayfası Geliştirme"
                        bind:value={task.taskName}
                        disabled={isOnLeave}
                      />
                    </div>
                    <div>
                      <label
                        for="task-number-{index}"
                        class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                      >
                        Task Numarası
                      </label>
                      <Input
                        type="text"
                        placeholder="Örn: KRON-123"
                        bind:value={task.taskNumber}
                        disabled={isOnLeave}
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        for="task-hours-{index}"
                        class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                      >
                        Tahmini Harcanan Süre (saat)
                      </label>
                      <input
                        id="task-hours-{index}"
                        type="number"
                        placeholder="Örn: 4"
                        bind:value={task.estimatedHours}
                        min="0"
                        step="0.5"
                        disabled={isOnLeave}
                        class="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label
                        for="task-status-{index}"
                        class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                      >
                        Durum
                      </label>
                      <select
                        id="task-status-{index}"
                        bind:value={task.status}
                        disabled={isOnLeave}
                        class="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="Analiz">Analiz</option>
                        <option value="Devam Ediyor">Devam Ediyor</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      for="task-description-{index}"
                      class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                    >
                      Yapılan İşin Açıklaması
                    </label>
                    <TextArea
                      placeholder="Task ile ilgili detaylı açıklama..."
                      bind:value={task.description}
                      rows={3}
                      disabled={isOnLeave}
                    />
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- Untracked Work Section -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex items-center gap-2 mb-3">
              <svg
                class="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Task Harici
              </h3>
            </div>
            <TextArea
              placeholder="Task sisteminde takip edilmeyen işler (code review, yardım, vs.)..."
              bind:value={untrackedWork}
              rows={3}
              disabled={isOnLeave}
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700"
      >
        <Button text="İptal" variant="secondary" onClick={closeModal} />
        <Button
          text={isEditMode ? "Raporu Güncelle" : "Raporu Kaydet"}
          variant="primary"
          onClick={handleSubmit}
          disabled={!hasAnyContent}
        />
      </div>
    </div>
  </div>
{/if}
