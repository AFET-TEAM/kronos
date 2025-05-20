<script>
  export let region = "Türkiye";
  export let logo = null;
</script>

<style>
  .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f7f3f3;
    padding: 0.5rem 1rem;
    height: 40px;
    font-family: sans-serif;
    box-sizing: border-box;
  }

  .logo {
    display: flex;
    align-items: center;
  }

  .center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 0.3rem;
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
      <img src={logo} alt="logo" class="h-6" />
      Kronos
    {:else}
      KRONOS
    {/if}
  </div>

  <div class="center">
    <slot />
  </div>

  <div class="right">
    {region}
    <span class="icon">🌐</span>
    <span class="icon">🕒</span>
  </div>
</div>
