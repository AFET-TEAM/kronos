<script lang="ts">
  import "../app.scss";
  import Input from "../components/Input/+Input.svelte";
  import Textarea from "../components/TextArea/+TextArea.svelte";
  import Button from "../components/Button/+button.svelte";
  import Checkbox from "../components/Checkbox/+checkbox.svelte";
  import rocketImage from "../assets/images/login-rocket.png";

  let email = '';
  let password = '';
  let message = '';
  let userEmail = '';
  let userUid = '';
  let description = "";

  const API_URL = "https://backend-api-gateway.vercel.app";

  async function login() {
    message = '';
    userEmail = '';
    userUid = '';

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok) {
        throw new Error(result.message || 'Giriş başarısız');
      }

      localStorage.setItem('token', result.token);

      if (response.status !== 200) {
        message = 'Hata oluştu: ' + result.errors[0].message;
        userEmail = '';
        userUid = '';
      } else {
        userEmail = result.email;
        userUid = result.idToken;
        message = result?.registered 
          ? "Giriş Başarılı"
          : "Giriş başarısız";
      }
    } catch (error) {
      console.error('Error:', error);
      message = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }
</script>

<slot />

<div
  class="flex flex-row items-start justify-between item h-screen border border-cyan-950 py-20 px-28 gap-32 bg-gradient-to-r from-linear1 to-linear2"
>
  <div class="flex gap-16 flex-col">
    <div class="flex flex-col gap-5">
      <h1 class="text-7xl text-space-purple">KRONOS</h1>
      <span class="text-3xl text-ocean-blue">WELCOME</span>
    </div>

    <form class="flex flex-col gap-4" on:submit|preventDefault={login}>
      <Input
        placeholder="@atmosware.turkcell.com.tr"
        label="USERNAME/E-MAIL"
        bind:value={email}
        type="email"
        iconRight="globe"
        theme="light"
        className="w-100 rounded-md"
      />
      <Input
        placeholder="Password"
        label="PASSWORD"
        maxLength={12}
        bind:value={password}
        type="password"
        theme="light"
        className="w-100 rounded-md"
      />
      <Textarea
        label="Açıklama"
        placeholder="Bir açıklama yazınız..."
        bind:value={description}
        theme="light"
        className="w-100 rounded-md"
      />
      <!-- Light mode -->
      <Checkbox
        label="Kabul ediyorum"
        name="accept"
        theme="light"
      />

      <!-- Dark mode -->
      <Checkbox
        label="Gizlilik koşullarını okudum"
        name="privacy"
        theme="dark"
      />


      <Button
        className="bg-gradient-to-r from-pacific-gradient-1 to-pacific-gradient-2 rounded-md p-3 text-white"
        onClick={login} 
        buttonText="Giriş Yap"
        variant="primary"
        type="submit"
      />

      {#if message}
        <p class="text-sm text-dark-gray">{message}</p>
      {/if}

      {#if message && userEmail && userUid}
        <div>
          <p>Kullanıcı: {userEmail}</p>
        </div>
      {/if}
    </form>
  </div>

  <img src={rocketImage} alt="rocket" />
</div>
