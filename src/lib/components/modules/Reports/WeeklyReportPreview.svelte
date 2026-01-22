<script lang="ts">
  import Button from "$lib/components/ui/Button/Button.svelte";
  import type { DailyReport } from "$lib/services/reportService.js";

  export let isOpen = false;
  export let startDate: string = "";
  export let endDate: string = "";
  export let dailyReports: DailyReport[] = [];
  export let onConfirm: () => void;
  export let onClose: () => void;

  function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
      const [year, month, day] = dateStr.split("-");
      return `${day}.${month}.${year}`;
    }

    return dateStr;
  }

  $: formattedStartDate = formatDate(startDate);
  $: formattedEndDate = formatDate(endDate);

  function closeModal() {
    isOpen = false;
    onClose();
  }

  function handleConfirm() {
    if (onConfirm) {
      onConfirm();
    }
    // Don't close modal here - let the parent component handle it after successful submission
  }

  $: totalTasks = dailyReports.reduce(
    (sum, day) => sum + day.tasks.filter((t) => t.taskName).length,
    0
  );
  $: totalHours = dailyReports.reduce(
    (sum, day) =>
      sum + day.tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0),
    0
  );
  $: filledDays = dailyReports.filter(
    (day) =>
      day.isOnLeave ||
      day.tasks.some((t) => t.taskName) ||
      day.blockers ||
      day.meetings ||
      day.untrackedWork
  ).length;
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 cursor-default"
    on:click={closeModal}
    on:keydown={(e) => e.key === "Escape" && closeModal()}
    role="button"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      on:click|stopPropagation={() => {}}
      on:keydown|stopPropagation={() => {}}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div
        class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
      >
        <div>
          <h2
            id="preview-title"
            class="text-xl font-bold text-gray-900 dark:text-white"
          >
            Haftalık Rapor Önizlemesi
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formattedStartDate} - {formattedEndDate}
          </p>
        </div>
        <button
          on:click={closeModal}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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

      <div
        class="px-6 py-4 bg-indigo-50 dark:bg-indigo-950 border-b border-indigo-200 dark:border-indigo-800"
      >
        <div class="flex items-center justify-around">
          <div class="text-center">
            <div
              class="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              {filledDays}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Doldurulmuş Gün
            </div>
          </div>
          <div class="w-px h-12 bg-indigo-200 dark:bg-indigo-800"></div>
          <div class="text-center">
            <div
              class="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              {totalTasks}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Toplam Task
            </div>
          </div>
          <div class="w-px h-12 bg-indigo-200 dark:bg-indigo-800"></div>
          <div class="text-center">
            <div
              class="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
            >
              {totalHours}h
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Toplam Saat
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-y-auto max-h-[50vh] px-6 py-4">
        <div class="space-y-4">
          {#each dailyReports as dayReport}
            {@const hasContent =
              dayReport.isOnLeave ||
              dayReport.tasks.some((t) => t.taskName) ||
              dayReport.blockers ||
              dayReport.meetings ||
              dayReport.untrackedWork}
            {#if hasContent}
              <div
                class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                      {dayReport.day}
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {dayReport.date}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    {#if dayReport.isOnLeave}
                      <span
                        class="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-800 text-sky-700 dark:text-sky-100 text-xs font-medium"
                      >
                        🏖️ İZİNLİ
                      </span>
                    {:else}
                      <span
                        class="px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs"
                      >
                        {dayReport.tasks.filter((t) => t.taskName).length} Task
                      </span>
                      <span
                        class="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs"
                      >
                        {dayReport.tasks.reduce(
                          (s, t) => s + (t.estimatedHours || 0),
                          0
                        )}h
                      </span>
                    {/if}
                  </div>
                </div>

                {#if dayReport.isOnLeave}
                  <div
                    class="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg p-4 text-center"
                  >
                    <div class="text-3xl mb-2">🏖️</div>
                    <p class="text-sky-700 dark:text-sky-100 font-semibold">
                      Bu gün izinliyim
                    </p>
                  </div>
                {:else}
                  {#if dayReport.tasks.some((t) => t.taskName)}
                    <div class="mb-3">
                      <h4
                        class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2"
                      >
                        📋 TASKLAR
                      </h4>
                      <div class="space-y-2">
                        {#each dayReport.tasks.filter((t) => t.taskName) as task}
                          <div
                            class="bg-indigo-50 dark:bg-indigo-950 rounded p-2 text-sm"
                          >
                            <div class="flex items-start justify-between">
                              <div class="flex-1">
                                <div class="flex items-center gap-2">
                                  <span
                                    class="font-medium text-gray-900 dark:text-white"
                                  >
                                    {task.taskName}
                                  </span>
                                  {#if task.status}
                                    <span
                                      class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium {task.status ===
                                      'Tamamlandı'
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        : task.status === 'Devam Ediyor'
                                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}"
                                    >
                                      {task.status}
                                    </span>
                                  {/if}
                                </div>
                              </div>
                              <div class="flex gap-2 text-xs shrink-0 ml-2">
                                <span
                                  class="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                                >
                                  {task.taskNumber}
                                </span>
                                <span
                                  class="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                >
                                  {task.estimatedHours}h
                                </span>
                              </div>
                            </div>
                            {#if task.description}
                              <p
                                class="text-gray-600 dark:text-gray-400 mt-1 text-xs"
                              >
                                {task.description}
                              </p>
                            {/if}
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  {#if dayReport.blockers && (Array.isArray(dayReport.blockers) ? dayReport.blockers.length > 0 : true)}
                    <div class="mb-3">
                      <h4
                        class="text-xs font-semibold text-red-600 dark:text-red-400 mb-1"
                      >
                        ⚠️ BLOKAJLAR / SORUNLAR
                      </h4>
                      <div
                        class="text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-950 rounded p-2"
                      >
                        {#if Array.isArray(dayReport.blockers)}
                          <ul class="list-disc list-inside space-y-0.5">
                            {#each dayReport.blockers as blocker}
                              <li>{blocker}</li>
                            {/each}
                          </ul>
                        {:else}
                          <p>{dayReport.blockers}</p>
                        {/if}
                      </div>
                    </div>
                  {/if}

                  {#if dayReport.meetings && (Array.isArray(dayReport.meetings) ? dayReport.meetings.length > 0 : true)}
                    <div class="mb-3">
                      <h4
                        class="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1"
                      >
                        👥 TOPLANTI VE EĞİTİMLER
                      </h4>
                      <div
                        class="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950 rounded p-2"
                      >
                        {#if Array.isArray(dayReport.meetings)}
                          <ul class="list-disc list-inside space-y-0.5">
                            {#each dayReport.meetings as meeting}
                              <li>
                                {#if typeof meeting === "object" && meeting.name}
                                  {meeting.name}
                                  {#if meeting.duration > 0}
                                    <span
                                      class="text-xs text-blue-600 dark:text-blue-400"
                                      >({meeting.duration}sa)</span
                                    >
                                  {/if}
                                {:else}
                                  {meeting}
                                {/if}
                              </li>
                            {/each}
                          </ul>
                        {:else}
                          <p>{dayReport.meetings}</p>
                        {/if}
                      </div>
                    </div>
                  {/if}

                  {#if dayReport.untrackedWork}
                    <div>
                      <h4
                        class="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1"
                      >
                        ⚡ TASK HARİCİ
                      </h4>
                      <p
                        class="text-sm text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-950 rounded p-2"
                      >
                        {dayReport.untrackedWork}
                      </p>
                    </div>
                  {/if}
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <div
        class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3"
      >
        <Button text="İptal" variant="secondary" onClick={closeModal} />
        <Button
          text="Raporu Oluştur ve Gönder"
          variant="primary"
          onClick={handleConfirm}
        />
      </div>
    </div>
  </div>
{/if}
