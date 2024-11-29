<script>
  import "../app.css";
  import Input from "../components/Input/+input.svelte";
  import Button from "../components/Button/+button.svelte";
  import Checkbox from "../components/Checkbox/+checkbox.svelte";
  import rocketImage from "../assets/images/login-rocket.png";
</script>

<slot />

<div
  class="flex flex-row items-start justify-between item h-screen border border-cyan-950 py-20 px-28 gap-32 bg-gradient-to-r from-linear1 to-linear2"
>
  <div class="flex gap-32 flex-col">
    <div class="flex flex-col gap-5">
      <h1 class="text-7xl text-space-purple">KRONOS</h1>
      <span class="text-3xl text-ocean-blue">WELCOME</span>
    </div>
    <form class="flex flex-col gap-4">
      <Input
        customClass="w-100 rounded-md"
        placeholder="@atmosware.turkcell.com.tr"
        label="USERNAME/E-MAIL"
      />
      <Input placeholder="password" label="PASSWORD" />
      <Checkbox label="Beni Hatırla" />
      <Button
        buttonText="Giriş Yap"
        className=" bg-gradient-to-r from-pacific-gradient-1 to-pacific-gradient-2 rounded-md p-3 text-white"
      />
    </form>
  </div>
  <img src={rocketImage} alt="rocket" />
</div>
