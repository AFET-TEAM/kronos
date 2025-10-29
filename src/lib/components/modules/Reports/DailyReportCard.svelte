<script lang="ts">
  import Input from "$lib/components/ui/Input/Input.svelte";
  import TextArea from "$lib/components/ui/TextArea/TextArea.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import Checkbox from "$lib/components/ui/Checkbox/Checkbox.svelte";

  export let day: string;
  export let date: string;
  export let tasks: Task[] = [
    { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
  ];
  export let blockers: string = "";
  export let meetings: string = "";
  export let untrackedWork: string = "";
  export let isExpanded: boolean = false;
  export let isOnLeave: boolean = false;

  type Task = {
    taskName: string;
    taskNumber: string;
    estimatedHours: number;
    description: string;
  };

  function addTask() {
    tasks = [
      ...tasks,
      { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
    ];
  }

  function removeTask(index: number) {
    tasks = tasks.filter((_, i) => i !== index);
  }

  function toggleExpand() {
    isExpanded = !isExpanded;
  }

  // When on leave is checked, clear all other data
  $: if (isOnLeave) {
    tasks = [
      { taskName: "", taskNumber: "", estimatedHours: 0, description: "" },
    ];
    blockers = "";
    meetings = "";
    untrackedWork = "";
  }

  $: hasContent =
    isOnLeave ||
    tasks.some(
      (t) => t.taskName || t.taskNumber || t.estimatedHours || t.description
    ) ||
    blockers ||
    meetings ||
    untrackedWork;

  $: totalHours = tasks.reduce(
    (sum, task) => sum + (task.estimatedHours || 0),
    0
  );
</script>

<div
  class="border rounded-lg overflow-hidden transition-all {hasContent
    ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950'
    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}"
>
  <button
    on:click={toggleExpand}
    class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
    tabindex="0"
  >
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center {hasContent
          ? 'bg-indigo-100 dark:bg-indigo-900'
          : 'bg-gray-100 dark:bg-gray-700'}"
      >
        {#if hasContent}
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        {:else}
          <svg
            class="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        {/if}
      </div>
      <div class="text-left">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          {day}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400">{date}</p>
      </div>
    </div>

    <div class="flex items-center gap-4">
      {#if isOnLeave}
        <span
          class="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-800 text-sky-700 dark:text-sky-100 font-medium"
        >
          🏖️ İZİNLİ
        </span>
      {:else if hasContent}
        <div class="flex items-center gap-3 text-sm">
          <span
            class="px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
          >
            {tasks.filter((t) => t.taskName).length} Task
          </span>
          <span
            class="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          >
            {totalHours}h
          </span>
        </div>
      {/if}

      <svg
        class="w-5 h-5 text-gray-400 transition-transform {isExpanded
          ? 'rotate-180'
          : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </button>

  {#if isExpanded}
    <div
      class="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700"
    >
      <!-- On Leave Checkbox -->
      <div class="pt-4 pb-2">
        <div
          class="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-lg p-3"
        >
          <Checkbox
            bind:checked={isOnLeave}
            label="🏖️ Bu gün izinliyim"
            name="isOnLeave-{date}"
          />
          {#if isOnLeave}
            <p class="text-xs text-sky-700 dark:text-sky-100 mt-2 ml-7">
              İzinli günler için diğer bilgiler girilmez.
            </p>
          {/if}
        </div>
      </div>

      <div class="pt-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg
              class="w-4 h-4 text-indigo-600 dark:text-indigo-400"
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
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              Tasklar
            </span>
          </div>
          <Button
            text="+ Task"
            variant="secondary"
            size="small"
            onClick={addTask}
            disabled={isOnLeave}
          />
        </div>

        <div class="space-y-3">
          {#each tasks as task, index}
            <div class="bg-white dark:bg-gray-900 rounded-lg p-3 space-y-2">
              <div class="flex items-start justify-between">
                <span
                  class="text-xs font-medium text-gray-600 dark:text-gray-400"
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
                      class="w-4 h-4"
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
                {/if}
              </div>

              <div class="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  placeholder="Task Adı"
                  bind:value={task.taskName}
                  disabled={isOnLeave}
                />
                <Input
                  type="text"
                  placeholder="Task No (KRON-123)"
                  bind:value={task.taskNumber}
                  disabled={isOnLeave}
                />
              </div>

              <input
                type="number"
                placeholder="Saat"
                bind:value={task.estimatedHours}
                min="0"
                step="0.5"
                disabled={isOnLeave}
                class="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <TextArea
                placeholder="Yapılan iş açıklaması..."
                bind:value={task.description}
                rows={2}
                disabled={isOnLeave}
              />
            </div>
          {/each}
        </div>
      </div>

      <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-red-600 dark:text-red-400"
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
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            Blokajlar / Sorunlar
          </span>
        </div>
        <TextArea
          placeholder="Opsiyonel..."
          bind:value={blockers}
          rows={2}
          disabled={isOnLeave}
        />
      </div>

      <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-blue-600 dark:text-blue-400"
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
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            Toplantılar ve Eğitimler
          </span>
        </div>
        <TextArea
          placeholder="Opsiyonel..."
          bind:value={meetings}
          rows={2}
          disabled={isOnLeave}
        />
      </div>

      <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-2 mb-2">
          <svg
            class="w-4 h-4 text-yellow-600 dark:text-yellow-400"
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
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            Task Harici
          </span>
        </div>
        <TextArea
          placeholder="Opsiyonel..."
          bind:value={untrackedWork}
          rows={2}
          disabled={isOnLeave}
        />
      </div>
    </div>
  {/if}
</div>
