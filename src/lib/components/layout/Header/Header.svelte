<script lang="ts">
  import Icon from "../../ui/Icon/Icon.svelte";
  import { themeStore, toggleTheme } from "$lib/store/themeStore.js";
  import { userStore } from "$lib/store/store.js";
  
  export let logo: string | null = null;
  export let isSidebarOpen: boolean = true;
  export let onToggleSidebar: () => void = () => {};

  let isHelpVisible = false;

  function handleThemeToggle() {
    toggleTheme();
  }

  function showHelp() {
    isHelpVisible = true;
  }

  function hideHelp() {
    isHelpVisible = false;
  }
</script>

<div class="header {$themeStore}">
  <div class="left-section">
    <button
      on:click={onToggleSidebar}
      class="hamburger-btn"
      aria-label="Kenar çubuğunu aç/kapat"
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

  <div class="center">
  </div>

  <div class="right">
    <div class="help-container">
      <button
        class="help-btn"
        on:mouseenter={showHelp}
        on:mouseleave={hideHelp}
        aria-label="Yardım"
      >
        <svg class="help-icon" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      {#if isHelpVisible}
        <div
          role="tooltip"
          class="help-popup {$themeStore}"
          on:mouseenter={showHelp}
          on:mouseleave={hideHelp}
        >
          <h3 class="help-title">📚 Kronos Kullanım Kılavuzu</h3>
          <ul class="help-list">
            <li>
              <strong>🏠 Dashboard:</strong> Genel istatistikleri ve haftalık rapor
              durumunu görüntüleyin
            </li>
            <li>
              <strong>📝 Günlük Rapor:</strong> "Yeni Rapor Ekle" butonu ile günlük
              çalışmalarınızı kaydedin
            </li>
            <li>
              <strong>📊 Haftalık Rapor:</strong> "Haftalık Rapor Oluştur" ile belirlediğiniz
              tarih aralığındaki raporları birleştirin
            </li>
            <li>
              <strong>🗂️ Arşiv:</strong> Gönderdiğiniz haftalık raporları görüntüleyin
              ve inceleyin
            </li>
            <li>
              <strong>👤 Profil:</strong> Kişisel bilgilerinizi düzenleyin ve şifre
              değiştirin
            </li>
            {#if $userStore.role === "admin"}
              <li>
                <strong>⚙️ Admin Panel:</strong> Kullanıcı ve rapor yönetimi yapın
              </li>
            {/if}
          </ul>
        </div>
      {/if}
    </div>
    <button
      on:click={handleThemeToggle}
      class="theme-toggle-btn"
      aria-label="Tema değiştir (açık/koyu)"
    >
      {#key $themeStore}
        <Icon name={$themeStore === "light" ? "theme-dark" : "theme-light"} alt="theme icon" width="20" height="20" />
      {/key}
    </button>
  </div>
</div>

<style>
  .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.25rem;
    height: 3.5rem;
    box-sizing: border-box;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    border-bottom: 1px solid var(--color-border);
    transition: background-color 0.2s ease, color 0.2s ease;
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
    background-color: var(--color-background-tertiary);
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
    background-color: var(--color-background-tertiary);
  }

  @media (max-width: 768px) {
    .center {
      padding: 0 0.25rem;
    }

    .right {
      gap: 0.5rem;
    }

    .logo {
      font-size: 0.9rem;
    }

    .help-popup {
      width: 280px;
      font-size: 0.85rem;
    }

    .help-title {
      font-size: 0.9rem;
    }

    .help-list li {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
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

    .help-popup {
      width: 260px;
      right: -0.5rem;
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.75rem;
  }

  .help-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .help-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
  }

  .help-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .help-btn {
    color: var(--color-ui-header-icon);
  }

  .help-btn:hover {
    background-color: var(--color-background-tertiary);
    color: var(--color-ui-header-icon-hover);
  }

  .help-popup {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: 320px;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: fadeIn 0.2s ease-in;
  }

  .light .help-popup {
    background: var(--color-background);
    border: 1px solid var(--color-border);
  }

  .dark .help-popup {
    background: var(--color-ui-card-background);
    border: 1px solid var(--color-border);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .help-title {
    margin: 0 0 0.75rem 0;
    font-size: 0.95rem;
    font-weight: 600;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .light .help-title {
    color: var(--color-text);
  }

  .dark .help-title {
    color: var(--color-text);
  }

  .help-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .help-list li {
    margin-bottom: 0.75rem;
    font-size: 0.8rem;
    line-height: 1.4;
    padding-left: 0;
  }

  .help-list li:last-child {
    margin-bottom: 0;
  }

  .help-list li {
    color: var(--color-text-secondary);
  }

  .help-list li strong {
    display: inline-block;
    color: var(--color-text);
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
