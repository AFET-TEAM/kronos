<script lang="ts">
  import Modal from "$lib/components/layout/Modal/+modal.svelte";
  import LoginForm from "$lib/components/modules/LoginForm/+loginForm.svelte";
  import Image from "$lib/components/ui/Image/+image.svelte";
  import Button from "$lib/components/ui/Button/+button.svelte";

  export let isSidebarOpen: boolean = true;

  let showModal = false;

  const rocketImage = "/images/login-rocket.webp";
</script>

<svelte:head>
  <title>Kronos - Zaman Yönetim Sistemi</title>
  <meta
    name="description"
    content="Kronos ile zamanınızı etkili bir şekilde yönetin. Çalışma saatlerinizi takip edin ve raporlayın."
  />
  <meta
    name="keywords"
    content="zaman yönetimi, kronos, çalışma takibi, iş takibi"
  />
  <meta property="og:title" content="Kronos - Zaman Yönetim Sistemi" />
  <meta
    property="og:description"
    content="Kronos ile zamanınızı etkili bir şekilde yönetin. Çalışma saatlerinizi takip edin ve raporlayın."
  />
  <meta property="og:type" content="website" />
</svelte:head>

<div
  class="homepage min-h-screen transition-all duration-300 flex items-start justify-between py-20 px-28 gap-32 bg-gradient-to-r from-linear1 to-linear2"
  class:ml-64={isSidebarOpen}
>
  <div class="flex flex-col gap-16 w-full max-w-2xl">
    <div class="flex flex-col gap-5">
      <h1 class="text-7xl text-space-purple">KRONOS</h1>
      <span class="text-3xl text-ocean-blue">WELCOME</span>
    </div>

    <LoginForm />

    <Button
      text="Raporu Görüntüle"
      variant="primary"
      onClick={() => (showModal = true)}
      className="bg-blue-700 text-white px-4 py-2 rounded"
    />
    <Modal
      bind:isOpen={showModal}
      title="Haftalık Rapor"
      description="Bu haftaki performans raporunuz burada yer alacak."
      on:close={() => (showModal = false)}
    />
  </div>

  <Image
    src={rocketImage}
    alt="rocket"
    className="hidden md:block max-w-sm"
    objectFit="contain"
    priority={true}
  />
</div>
