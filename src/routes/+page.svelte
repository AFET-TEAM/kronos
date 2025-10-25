<script lang="ts">
  import "../app.scss";
  import Sidebar from "$lib/components/layout/Sidebar/+sidebar.svelte";
  import Homepage from "$lib/components/modules/Homepage/+homepage.svelte";

  let isSidebarOpen = true;
</script>

<Sidebar bind:isOpen={isSidebarOpen} />

<slot />

<Homepage bind:isSidebarOpen />
