<script lang="ts">
  import { toastStore, type Toast } from "$lib/store/toastStore.js";
  import { fly } from "svelte/transition";

  const iconMap: Record<Toast["type"], string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  const colorMap: Record<Toast["type"], string> = {
    success: "bg-green-500 dark:bg-green-600",
    error: "bg-red-500 dark:bg-red-600",
    warning: "bg-yellow-500 dark:bg-yellow-600",
    info: "bg-blue-500 dark:bg-blue-600",
  };
</script>

<div
  class="toast-container fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
>
  {#each $toastStore as toast (toast.id)}
    <div
      transition:fly={{ y: -20, duration: 300 }}
      class="toast pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] max-w-md {colorMap[
        toast.type
      ]}"
    >
      <div
        class="flex-shrink-0 w-6 h-6 flex items-center justify-center font-bold text-lg"
      >
        {iconMap[toast.type]}
      </div>
      <div class="flex-1 text-sm font-medium">
        {toast.message}
      </div>
      <button
        on:click={() => toastStore.dismiss(toast.id)}
        class="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded transition-colors"
        aria-label="Kapat"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
