<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let label: string = "";
  export let value: string = "";
  export let placeholder: string = "";
  export let disabled: boolean = false;
  export let maxLength: number | null = null;
  export let theme: "light" | "dark" = "light";
  export let className: string = "";
  export let rows: number = 4;

  let textareaId: string;
  let textareaElement: HTMLTextAreaElement;

  // Parent'tan gelen value değiştiğinde textarea'yı güncelle (eğer user yazarken değilse)
  $: if (textareaElement) {
    if (document.activeElement !== textareaElement) {
      textareaElement.value = value;
    }
  }

  onMount(() => {
    textareaId = `textarea-${Math.random().toString(36).slice(2, 9)}`;
    if (textareaElement) {
      textareaElement.value = value;
    }
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    value = target.value;
    dispatch('input', { value: target.value, originalEvent: e });
  }
</script>

<div class={`w-full ${theme === "dark" ? "text-white" : "text-dark-gray"}`}>
  {#if label}
    <label
      for={textareaId}
      class="block mb-1 font-semibold text-gray-900 dark:text-gray-100"
      >{label}</label
    >
  {/if}

  <textarea
    bind:this={textareaElement}
    id={textareaId}
  bind:value
  placeholder={placeholder}
  disabled={disabled}
    maxlength={maxLength ?? undefined}
    {rows}
    class={`w-full resize-none rounded-md border px-3 py-2 focus:outline-none transition
      ${
        theme === "dark"
          ? "bg-blue-charcoal border-mid-gray focus:border-primary placeholder:text-mid-gray"
          : "bg-white border-light-gray focus:border-primary placeholder:text-light-gray"
      }
      ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      ${className}
    `}
    on:input={handleInput}
  />

  {#if maxLength !== null}
    <div
      class={`mt-1 text-right text-sm
      ${theme === "dark" ? "text-mid-gray" : "text-light-gray"}`}
    >
      {value.length} / {maxLength}
    </div>
  {/if}
</div>
