<script lang="ts">
  export let activeTab: string = "profile";
</script>

<div class="tab-navigation">
  <button
    class="tab-button"
    class:tab-active={activeTab === "profile"}
    on:click={() => (activeTab = "profile")}
  >
    Profil Bilgisi
  </button>
  <button
    class="tab-button"
    class:tab-active={activeTab === "corporate"}
    on:click={() => (activeTab = "corporate")}
  >
    Kurumsal Bilgiler
  </button>
  <button
    class="tab-button"
    class:tab-active={activeTab === "settings"}
    on:click={() => (activeTab = "settings")}
  >
    Ayarlar
  </button>
</div>

<style>
  .tab-navigation {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--color-border);
  }

  .tab-button {
    flex: 1;
    min-width: 120px;
    padding: 0.75rem 1rem;
    font-weight: 600;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    cursor: pointer;
    background: transparent;
    color: var(--color-text-tertiary);
  }

  @media (min-width: 768px) {
    .tab-button {
      min-width: auto;
      padding: 1rem 1.5rem;
    }
  }

  .tab-button.tab-active {
    color: var(--color-text);
    border-bottom-color: var(--color-primary);
    background-color: var(--color-background-secondary);
  }
</style>
