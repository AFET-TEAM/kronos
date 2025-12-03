<script lang="ts">
  import Icon from "../../ui/Icon/Icon.svelte";
  import SearchBar from "../../ui/SearchBar/SearchBar.svelte";
  import { themeStore, toggleTheme } from "$lib/store/themeStore.js";
  
  export let logo: string | null = null;
  export let isSidebarOpen: boolean = true;
  export let onToggleSidebar: () => void = () => {};
  export let searchValue: string = "";

  let isMobileSearchOpen = false;

  function toggleMobileSearch() {
    isMobileSearchOpen = !isMobileSearchOpen;
  }

  function handleThemeToggle() {
    toggleTheme();
  }
</script>

<div class="header {$themeStore}">
  <div class="left-section">
    <button
      on:click={onToggleSidebar}
      class="hamburger-btn"
      aria-label="Toggle sidebar"
    >
      {isSidebarOpen ? "✕" : "☰"}
    </button>
    <div class="logo">
      <img src="/icons/favicon.svg" alt="Kronos" class="logo-icon" />
      {#if logo}
        <Icon name={logo} alt="icon" width="80" height="80" />
      {:else}
        <span class="logo-text">KRONOS</span>
      {/if}
    </div>
  </div>

  <div class="center desktop-search">
    <slot />
  </div>

  <div class="right">
    <button
      on:click={toggleMobileSearch}
      class="mobile-search-btn"
      aria-label="Search"
    >
      🔍
    </button>
    <Icon name={"globe"} alt="icon" width="20" height="20" />
    <button
      on:click={handleThemeToggle}
      class="theme-toggle-btn"
      aria-label="Toggle theme"
    >
      {#key $themeStore}
        <Icon name={$themeStore === "light" ? "theme-dark" : "theme-light"} alt="theme icon" width="20" height="20" />
      {/key}
    </button>
  </div>
</div>

{#if isMobileSearchOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="mobile-search-overlay" on:click={toggleMobileSearch}>
    <div class="mobile-search-container {$themeStore}" on:click|stopPropagation>
      <div class="mobile-search-header {$themeStore}">
        <span>Ara</span>
        <button
          on:click={toggleMobileSearch}
          class="close-btn {$themeStore}"
          aria-label="Close search"
        >
          ✕
        </button>
      </div>
      <div class="mobile-search-content">
        <SearchBar
          placeholder="Rapor ara..."
          bind:value={searchValue}
          icon="search"
          size="medium"
        />
      </div>
    </div>
  </div>
{/if}

<style>
  .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    height: 3rem;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }
  .light {
    background-color: var(--color-ui-header-background);
    color: var(--color-ui-header-text);
  }
  .dark {
    background-color: var(--color-ui-header-background);
    color: var(--color-ui-header-text);
  }

  .left-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .hamburger-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }

  .hamburger-btn {
    color: var(--color-ui-header-icon);
  }

  .hamburger-btn:hover {
    background-color: rgba(79, 70, 229, 0.1);
  }

  .dark .hamburger-btn:hover {
    background-color: rgba(129, 140, 248, 0.1);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.3rem;
  }

  .logo-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
  }

  .logo-text {
    font-weight: 600;
  }

  .center {
    flex: 1;
    display: flex;
    justify-content: center;
    max-width: 100%;
    overflow: hidden;
    padding: 0 0.5rem;
  }

  .desktop-search {
    display: flex;
  }

  .mobile-search-btn {
    display: none;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }

  .mobile-search-btn {
    color: var(--color-ui-header-icon);
  }

  .mobile-search-btn:hover {
    background-color: rgba(79, 70, 229, 0.1);
  }

  .dark .mobile-search-btn:hover {
    background-color: rgba(129, 140, 248, 0.1);
  }

  .mobile-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-background-overlay);
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 3rem;
  }

  .mobile-search-container {
    background: var(--color-ui-card-background);
    border-radius: 0.5rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 6px var(--color-ui-card-shadow);
    overflow: hidden;
  }

  .mobile-search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    font-weight: 600;
  }

  .mobile-search-content {
    padding: 1rem;
    display: flex;
    justify-content: center;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    color: var(--color-text-tertiary);
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: var(--color-text);
  }

  .theme-toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
    color: var(--color-ui-header-icon);
  }

  .theme-toggle-btn:hover {
    background-color: rgba(79, 70, 229, 0.1);
  }

  .dark .theme-toggle-btn:hover {
    background-color: rgba(129, 140, 248, 0.1);
  }

  @media (max-width: 768px) {
    .desktop-search {
      display: none;
    }

    .mobile-search-btn {
      display: block;
    }

    .center {
      padding: 0 0.25rem;
    }

    .right {
      gap: 0.5rem;
    }

    .logo {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .center {
      display: none;
    }

    .hamburger-btn {
      font-size: 1.25rem;
      padding: 0.25rem;
    }

    .logo {
      font-size: 0.85rem;
    }

    .right {
      gap: 0.25rem;
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.75rem;
  }

  .icon {
    font-size: 0.85rem;
    display: flex;
    align-items: center;
  }

  .right :global(img) {
    filter: brightness(0) saturate(100%) invert(0%);
    transition: filter 0.3s ease;
  }

  .dark .right :global(img) {
    filter: brightness(0) saturate(100%) invert(100%);
  }
</style>
