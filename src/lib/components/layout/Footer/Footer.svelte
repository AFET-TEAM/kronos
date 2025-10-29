<script lang="ts">
  import Icon from "../../ui/Icon/Icon.svelte";
  export let theme: "light" | "dark" = "light";
  export let icon: string = "atmosware";
</script>

<div class="footer {theme}">
  <div class="icon">
    <Icon name={icon} alt="footer icon" width="100" height="20" />
  </div>
</div>

<style>
  .footer {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0.5rem 1rem;
    height: 2.5rem;
    font-size: 0.75rem;
    box-sizing: border-box;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  .light {
    background-color: #f7f3f3;
    color: #000;
  }

  .dark {
    background-color: #2c2c2c;
    color: #e0e0e0;
  }

  .icon {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
  }
</style>
