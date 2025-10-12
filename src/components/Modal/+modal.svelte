<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let isOpen: boolean = false;
  export let title: string = '';
  export let closeOnOverlayClick: boolean = true;
  export let showCloseButton: boolean = true;

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleOverlayClick(event: MouseEvent) {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      close();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      close();
    }
  }

  onMount(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  });
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    on:click={handleOverlayClick}
    on:keydown={handleKeydown}
    role="button"
    tabindex="0"
  >
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 relative p-6 animate-fade-in">
      {#if showCloseButton}
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          on:click={close}
          aria-label="Kapat"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}

      {#if title}
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{title}</h2>
      {/if}

      <slot />
    </div>
  </div>
{/if}

<style>
  .animate-fade-in {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
