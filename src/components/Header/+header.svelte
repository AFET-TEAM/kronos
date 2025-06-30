<script>
  import Icon from "../../components/Icon/+icon.svelte";
  export let region = "Türkiye";
  export let logo;
</script>

<style>
  .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f7f3f3;
    padding: 0.5rem 1rem;
    height: 3rem;
    box-sizing: border-box;
  }
  .logo {
    display: flex;
    align-items: center;
    margin-top: 0.3rem;
  }
  .center {
    flex: 1;
    display: flex;
    justify-content: center;
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
</style>

<div class="header">
  <div class="logo">
    {#if logo}
    <!-- geçici "kronos" svg logosu eklendi -->
      <Icon name={logo} alt="icon" width="80" height="80" />
    {:else}
      KRONOS
    {/if}
  </div>

  <div class="center">
    <slot />
  </div>

  <div class="right">
    {region}
    <Icon name={"globe"} alt="icon" width="20" height="20" />
    <Icon name={"theme"} alt="icon" width="20" height="20" />
  </div>
</div>
