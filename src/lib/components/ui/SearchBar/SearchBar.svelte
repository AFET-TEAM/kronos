<script lang="ts">
  import Icon from "../Icon/Icon.svelte";

  export let placeholder = "Search...";
  export let size: "small" | "medium" | "large" = "medium";
  export let bgColor = "#4f46e5";
  export let value = "";
  export let icon: string | null = null;

  const sizes = {
    small: {
      class: "text-sm py-1 px-2",
      maxWidth: "300px",
      radius: "12px",
      iconSize: "18px",
    },
    medium: {
      class: "text-base py-2 px-3",
      maxWidth: "400px",
      radius: "14px",
      iconSize: "20px",
    },
    large: {
      class: "text-lg py-3 px-4",
      maxWidth: "500px",
      radius: "16px",
      iconSize: "22px",
    },
  };
</script>

<div
  class="search-bar"
  style="background-color: {bgColor}; max-width: {sizes[size]
    .maxWidth}; border-radius: {sizes[size].radius};"
>
  <input
    type="text"
    class={`search-input ${sizes[size].class}`}
    {placeholder}
    bind:value
  />
  {#if icon}
    <Icon
      name={icon}
      width={sizes[size].iconSize}
      height={sizes[size].iconSize}
      alt="search icon"
    />
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.75rem;
    box-sizing: border-box;
    transition:
      box-shadow 0.3s ease,
      background-color 0.3s ease;
    cursor: text;
    width: 100%;
    min-width: 150px;
  }
  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: white;
    font-family: inherit;
    border-radius: 0.5rem;
  }
  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
</style>
