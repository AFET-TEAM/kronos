<script lang="ts">
  import Input from "$lib/components/ui/Input/+input.svelte";
  import Button from "$lib/components/ui/Button/+button.svelte";
  import Checkbox from "$lib/components/ui/Checkbox/+checkbox.svelte";
  import TextArea from "$lib/components/ui/TextArea/+textArea.svelte";
  import {
    login as authLogin,
    setAuthToken,
  } from "$lib/services/auth.service.js";
  import { userStore, extractNameFromEmail } from "$lib/store/store.js";

  let email = "";
  let password = "";
  let message = "";
  let userEmail = "";
  let userUid = "";
  let description = "";

  async function handleLogin() {
    message = "";
    userEmail = "";
    userUid = "";

    try {
      const result = await authLogin({ email, password });

      setAuthToken(result.token);

      if (!result.registered) {
        message =
          "Hata oluştu: " + (result.errors?.[0]?.message || "Giriş başarısız");
        userEmail = "";
        userUid = "";
      } else {
        userEmail = result.email;
        userUid = result.idToken;
        message = "Giriş Başarılı";

        const { firstName, lastName } = extractNameFromEmail(email);

        userStore.set({
          email: email,
          firstName: firstName,
          lastName: lastName,
          title: "",
          squad: "",
          avatarUrl: "",
        });

        setTimeout(() => {
          window.location.href = "/profile";
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      message = "Bir hata oluştu. Lütfen tekrar deneyin.";
    }
  }
</script>

<div class="flex flex-col gap-16 w-full max-w-2xl">
  <form class="flex flex-col gap-4" on:submit|preventDefault={handleLogin}>
    <Input
      className="w-full rounded-md"
      placeholder="@atmosware.turkcell.com.tr"
      label="USERNAME/E-MAIL"
      bind:value={email}
      type="email"
      iconRight="globe"
      theme="light"
    />
    <Input
      placeholder="Password"
      label="PASSWORD"
      maxLength={12}
      bind:value={password}
      type="password"
      theme="light"
    />
    <TextArea
      label="Açıklama"
      placeholder="Bir açıklama yazınız..."
      bind:value={description}
      theme="light"
      className="w-100 rounded-md"
    />
    <Checkbox label="Kabul ediyorum" name="accept" theme="light" />

    <Checkbox label="Gizlilik koşullarını okudum" name="privacy" theme="dark" />

    <Button
      className="bg-gradient-to-r from-pacific-gradient-1 to-pacific-gradient-2 rounded-md p-3 text-white"
      text="Giriş Yap"
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
