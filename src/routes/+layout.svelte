<script lang="ts">
  import "../app.scss";
  import Toast from "$lib/components/ui/Toast/Toast.svelte";
</script>

<div class="min-h-screen kronos-bg-gradient">
  <slot />
</div>

<style>
  .kronos-bg-gradient {
    background: linear-gradient(to top right, var(--color-brand-blue-ribbon), var(--color-success));
  }
  :global(.dark) .kronos-bg-gradient {
    background: linear-gradient(
      to top right,
      var(--color-gradient-body-gray1),
      var(--color-gradient-body-gray2)
    );
  }
</style>

<Toast />
