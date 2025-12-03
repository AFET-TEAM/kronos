<script lang="ts">
  import Icon from "../Icon/Icon.svelte";

  export let placeholder = "Ara...";
  export let size: "small" | "medium" | "large" = "medium";
  export let value = "";
  export let icon: string | null = null;

  const sizes = {
    small: {
      class: "text-sm py-1 px-2",
      maxWidth: "300px",
      radius: "12px",
      iconSize: "20px",
    },
    medium: {
      class: "text-base py-2 px-3",
      maxWidth: "400px",
      radius: "14px",
      iconSize: "24px",
    },
    large: {
      class: "text-lg py-3 px-4",
      maxWidth: "500px",
      radius: "16px",
      iconSize: "26px",
    },
  };
</script>

<div
  class="search-bar"
  style="max-width: {sizes[size]
    .maxWidth}; border-radius: {sizes[size].radius};"
>
  <input
    type="text"
    class={`search-input ${sizes[size].class}`}
    {placeholder}
    bind:value
  />
  {#if icon}
  <div
    class="search-icon p-2 flex items-center justify-center"
    style="border-radius: 0 {parseInt(sizes[size].radius) / 2}px {parseInt(sizes[size].radius) / 2}px 0;"
  >
    <Icon
      name={icon}
      width={sizes[size].iconSize}
      height={sizes[size].iconSize}
      alt="search icon"
    />
  </div>
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-sizing: border-box;
    transition:
      box-shadow 0.3s ease,
      background-color 0.3s ease;
    cursor: text;
    width: 100%;
    min-width: 150px;
    border: 2px solid var(--color-ui-searchbar-border);
    color: var( --color-ui-searchbar-border);
  }
  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-family: inherit;
    border-radius: 0.5rem;
  }

  .search-icon {
    background-color: var(--color-ui-searchbar-border);
  }

  .search-input::placeholder {
    color: var(--color-text-tertiary);
  }
</style>
