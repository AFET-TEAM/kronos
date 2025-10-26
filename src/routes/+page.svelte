<script lang="ts">
  import "../app.scss";
  import Sidebar from "$lib/components/layout/Sidebar/+sidebar.svelte";
  import Homepage from "$lib/components/modules/Homepage/+homepage.svelte";
  import Button from "$lib/components/ui/Button/+button.svelte";

  let isSidebarOpen = true;
</script>

{#if !isSidebarOpen}
  <Button
    text="☰"
    variant="primary"
    onClick={() => (isSidebarOpen = true)}
    className="fixed top-4 right-6 xl2:left-6 xl2:right-auto z-50 bg-indigo-600 text-white px-3 py-2 rounded text-xl"
  />
{/if}

<Sidebar bind:isOpen={isSidebarOpen} />

<slot />

<Homepage {isSidebarOpen} />
