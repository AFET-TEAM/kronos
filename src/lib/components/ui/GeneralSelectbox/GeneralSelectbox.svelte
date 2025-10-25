<script lang="ts">
  import { onMount } from "svelte";
  import type { SelectOption } from "./generalSelectbox.types.ts";

  export let label: string = "";
  export let options: SelectOption[] = [];
  export let selected: string = "";
  export let leftIcon: string = "";
  export let placeholder: string = "Select...";

  let open = false;
  let rootEl: HTMLDivElement | null = null;

  function selectOption(value: string) {
    selected = value;
    open = false;
  }

  function toggleDropdown() {
    open = !open;
  }

  function handleClickOutside(event: MouseEvent) {
    if (rootEl && !rootEl.contains(event.target as Node)) {
      open = false;
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
</script>

<div class="selectbox-wrapper" bind:this={rootEl}>
  {#if label}
    <label for="selectbox-btn" class="selectbox-label">{label}</label>
  {/if}
  <div class="selectbox-container">
    {#if leftIcon}
      <img src={leftIcon} alt="left icon" class="selectbox-icon left" />
    {/if}
    <button
      id="selectbox-btn"
      type="button"
      class="selectbox-value"
      on:click={toggleDropdown}
      tabindex="-1"
      aria-label="Seçenek seçmek için tıklayın"
    >
      {#if selected}
        {options.find((opt) => opt.value === selected)?.label}
      {:else}
        <span class="selectbox-placeholder">{placeholder}</span>
      {/if}
    </button>
    <button
      type="button"
      class="selectbox-icon right selectbox-arrow-btn"
      on:click={toggleDropdown}
      tabindex="-1"
      aria-label="Açılır menüyü göster"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path
          d="M6 8L10 12L14 8"
          stroke="#222"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    {#if open}
      <div class="selectbox-dropdown" role="listbox">
        {#each options as opt}
          <button
            type="button"
            class="selectbox-option {selected === opt.value ? 'selected' : ''}"
            on:click={() => selectOption(opt.value)}
            role="option"
            aria-selected={selected === opt.value}
          >
            {opt.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .selectbox-wrapper {
    width: 260px;
  }
  .selectbox-label {
    display: block;
    font-size: 14px;
    color: #222;
    margin-bottom: 4px;
    font-weight: 500;
  }
  .selectbox-container {
    display: flex;
    align-items: center;
    background: #fff;
    border: 1.5px solid #bbb;
    border-radius: 8px;
    height: 38px;
    padding: 0 8px;
    position: relative;
    transition: border-color 0.2s;
    cursor: pointer;
  }
  .selectbox-container:focus-within {
    border-color: #007aff;
  }
  .selectbox-icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
    display: block;
  }
  .selectbox-icon.left {
    margin-right: 8px;
  }
  .selectbox-arrow-btn {
    background: none;
    border: none;
    padding: 0;
    margin-left: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    height: 100%;
  }
  .selectbox-value {
    flex: 1;
    font-size: 15px;
    color: #222;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 2px;
    user-select: none;
    background: none;
    border: none;
    font: inherit;
    cursor: pointer;
    text-align: left;
  }
  .selectbox-placeholder {
    color: #aaa;
  }
  .selectbox-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #fff;
    border: 1.5px solid #bbb;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    z-index: 10;
    margin-top: 2px;
    overflow: hidden;
  }
  .selectbox-option {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 15px;
    color: #222;
    transition: background 0.15s;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font: inherit;
  }
  .selectbox-option:hover,
  .selectbox-option.selected {
    background: #f0f4ff;
  }
  /* Dark mode */
  :global(html.dark) .selectbox-container {
    background: #23272f;
    border-color: #444;
  }
  :global(html.dark) .selectbox-label {
    color: #eee;
  }
  :global(html.dark) .selectbox-value {
    color: #eee;
  }
  :global(html.dark) .selectbox-dropdown {
    background: #23272f;
    border-color: #444;
  }
  :global(html.dark) .selectbox-option {
    color: #eee;
  }
  :global(html.dark) .selectbox-option:hover,
  :global(html.dark) .selectbox-option.selected {
    background: #2d3748;
  }
  :global(html.dark) .selectbox-arrow-btn svg path {
    stroke: #eee;
  }
</style>
