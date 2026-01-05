<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let checked = false;
  export let disabled = false;
  export let label = "";
  export let name = "";
  export let value = "";
  export let theme: "light" | "dark" = "light";

  let checkboxElement: HTMLInputElement;

  // Parent'tan gelen checked değiştiğinde checkbox'ı güncelle
  $: if (checkboxElement) {
    checkboxElement.checked = checked;
  }

  onMount(() => {
    if (checkboxElement) {
      checkboxElement.checked = checked;
    }
  });

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    dispatch('change', { checked: target.checked, originalEvent: e });
  }
</script>

<div class="flex items-center space-x-2">
  <input
    bind:this={checkboxElement}
    type="checkbox"
    id={name}
    {name}
    {value}
    {disabled}
    on:change={handleChange}
    class={`appearance-none w-5 h-5 rounded border-2 cursor-pointer
      ${
        theme === "dark"
          ? "border-mid-gray bg-blue-charcoal checked:bg-primary checked:border-primary"
          : "border-light-gray bg-white checked:bg-primary checked:border-primary"
      }
      disabled:opacity-60 disabled:cursor-not-allowed
      checked:before:block checked:before:content-['✓'] checked:before:text-white checked:before:text-center checked:before:text-lg checked:before:leading-[18px]
    `}
  />
  <label
    for={name}
    class="text-gray-900 dark:text-white cursor-pointer select-none"
  >
    {label}
  </label>
</div>
