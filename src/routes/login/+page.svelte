<script lang="ts">
  import "../../app.scss";
  import Homepage from "$lib/components/modules/Homepage/Homepage.svelte";

  let isSidebarOpen = false;
</script>

<svelte:head>
  <title>Login - Kronos</title>
  <meta name="description" content="Kronos Raporlama Sistemi - Giriş Yap" />
</svelte:head>

<Homepage {isSidebarOpen} />
