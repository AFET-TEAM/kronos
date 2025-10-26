<script lang="ts">
  import ProfilePage from "$lib/components/modules/Profile/+profilePage.svelte";
  import Sidebar from "$lib/components/layout/Sidebar/+sidebar.svelte";
  import Button from "$lib/components/ui/Button/+button.svelte";

  let isSidebarOpen = true;
</script>

<svelte:head>
  <title>Profil - Kronos</title>
  <meta
    name="description"
    content="Kullanıcı profil sayfası. Kişisel bilgilerinizi, kariyer bilgilerini ve sertifikalarınızı yönetin."
  />
  <link rel="preconnect" href="data:" crossorigin="anonymous" />
  <meta name="theme-color" content="#1e293b" />
</svelte:head>

{#if !isSidebarOpen}
  <Button
    text="☰"
    variant="primary"
    onClick={() => (isSidebarOpen = true)}
    className="fixed top-4 right-6 xl2:left-6 xl2:right-auto z-50 bg-indigo-600 text-white px-3 py-2 rounded text-xl"
  />
{/if}

<Sidebar bind:isOpen={isSidebarOpen} />
<ProfilePage {isSidebarOpen} />
