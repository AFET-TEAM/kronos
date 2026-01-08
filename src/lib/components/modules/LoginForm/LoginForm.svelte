<script lang="ts">
  import Input from "$lib/components/ui/Input/Input.svelte";
  import Button from "$lib/components/ui/Button/Button.svelte";
  import Checkbox from "$lib/components/ui/Checkbox/Checkbox.svelte";
  import TextArea from "$lib/components/ui/TextArea/TextArea.svelte";
  import {
    login as authLogin,
    setAuthToken,
  } from "$lib/services/auth.service.js";
  import { userStore } from "$lib/store/store.js";
  import { getErrorMessage } from "$lib/services/errorHandler.js";

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
        userUid = result.idToken || "";
        message = "Giriş Başarılı";

        userStore.set({
          email: result.user?.email || email,
          firstName: result.user?.firstName || "",
          lastName: result.user?.lastName || "",
          title: result.user?.title || "",
          squad: result.user?.squad || "",
          avatarUrl: result.user?.avatarUrl || "",
          role: result.user?.role || "user",
          startDate: "",
          projects: [],
          trainings: [],
          awards: [],
          certifications: [],
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      message = getErrorMessage(error);
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
