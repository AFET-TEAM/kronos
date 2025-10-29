<script lang="ts">
  import Button from "$lib/components/ui/Button/Button.svelte";
  import Input from "$lib/components/ui/Input/Input.svelte";
  import TextArea from "$lib/components/ui/TextArea/TextArea.svelte";
  import Checkbox from "$lib/components/ui/Checkbox/Checkbox.svelte";
  import { saveDailyReport, getDailyReport } from "$lib/store/reportStore.js";
  import { toastStore } from "$lib/store/toastStore.js";

  export let isOpen = false;
  export let selectedDate = "";
  export let onClose: () => void;

  type Task = {
    taskName: string;
    taskNumber: string;
    estimatedHours: number;
    description: string;
  };

  let tasks: Task[] = [
    { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
  ];
  let blockers = "";
  let meetings = "";
  let untrackedWork = "";
  let isOnLeave = false;

  function closeModal() {
    isOpen = false;
    tasks = [
      { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
    ];
    blockers = "";
    meetings = "";
    untrackedWork = "";
    isOnLeave = false;
    onClose();
  }

  function addTask() {
    tasks = [
      ...tasks,
      { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
    ];
  }

  function removeTask(index: number) {
    tasks = tasks.filter((_, i) => i !== index);
  }

  function handleSubmit() {
    const hasAnyContent =
      isOnLeave ||
      tasks.some((t) => t.taskName) ||
      blockers.trim() ||
      meetings.trim() ||
      untrackedWork.trim();

    if (!selectedDate || !hasAnyContent) {
      toastStore.warning(
        "Lütfen en az bir alan doldurun (Task, Blokaj, Toplantı veya Task Harici)"
      );
      return;
    }

    const dayName = getDayName(selectedDate);
    const formattedDate = formatDate(selectedDate);

    saveDailyReport(selectedDate, {
      day: dayName,
      date: formattedDate,
      tasks: isOnLeave ? [] : tasks.filter((t) => t.taskName),
      blockers: blockers.trim(),
      meetings: meetings.trim(),
      untrackedWork: untrackedWork.trim(),
      isOnLeave: isOnLeave,
    });

    toastStore.success("Günlük rapor başarıyla kaydedildi!");
    closeModal();
  }

  function formatDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  function getDayName(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
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
    blockers.trim() ||
    meetings.trim() ||
    untrackedWork.trim();
  $: formattedDate = formatDate(selectedDate);
  $: dayName = getDayName(selectedDate);

  $: if (isOpen && selectedDate) {
    loadExistingReport();
  }

  // Clear all data when on leave is checked
  $: if (isOnLeave) {
    tasks = [
      { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
    ];
    blockers = "";
    meetings = "";
    untrackedWork = "";
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
              },
            ];
      blockers = existingReport.blockers || "";
      meetings = existingReport.meetings || "";
      untrackedWork = existingReport.untrackedWork || "";
      isOnLeave = existingReport.isOnLeave || false;
    } else {
      tasks = [
        { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
      ];
      blockers = "";
      meetings = "";
      untrackedWork = "";
      isOnLeave = false;
    }
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
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
      on:click|stopPropagation={() => {}}
      on:keydown|stopPropagation={() => {}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2
              class="text-2xl font-bold text-gray-900 dark:text-white"
              id="modal-title"
            >
              Günlük Rapor Ekle
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {dayName} - {formattedDate}
            </p>
          </div>
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
                  class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
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
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Tasklar
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
                  class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3"
                >
                  <div class="flex items-start justify-between">
                    <span
                      class="text-sm font-medium text-gray-700 dark:text-gray-300"
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

          <!-- Blockers Section -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex items-center gap-2 mb-3">
              <svg
                class="w-5 h-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Blokajlar / Sorunlar
              </h3>
            </div>
            <TextArea
              placeholder="Karşılaşılan blokajlar veya sorunlar varsa belirtiniz..."
              bind:value={blockers}
              rows={3}
              disabled={isOnLeave}
            />
          </div>

          <!-- Meetings Section -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div class="flex items-center gap-2 mb-3">
              <svg
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Katılım Sağlanan Toplantılar ve Eğitimler
              </h3>
            </div>
            <TextArea
              placeholder="Katıldığınız toplantı ve eğitimleri belirtiniz..."
              bind:value={meetings}
              rows={3}
              disabled={isOnLeave}
            />
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
          text="Raporu Kaydet"
          variant="primary"
          onClick={handleSubmit}
          disabled={!hasAnyContent}
        />
      </div>
    </div>
  </div>
{/if}
