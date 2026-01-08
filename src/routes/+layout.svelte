<script lang="ts">
  import "../app.scss";
  import Toast from "$lib/components/ui/Toast/Toast.svelte";
  import OnboardingModal from "$lib/components/ui/OnboardingModal/OnboardingModal.svelte";
  import { userStore } from "$lib/store/store.js";
  import { isProfileIncomplete } from "$lib/utils/profileUtils.js";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { isAuthenticated } from "$lib/services/auth.service.js";

  let showOnboardingModal = false;
  let hasCheckedOnboarding = false;

  // Public routes - onboarding modal gösterilmemeli
  const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

  $: isPublicRoute = publicRoutes.some((route) => $page.url.pathname.startsWith(route));
  $: isLoggedIn = isAuthenticated();

  // Kullanıcı bilgileri değiştiğinde kontrol et
  $: if (isLoggedIn && !isPublicRoute && typeof window !== "undefined") {
    const user = $userStore;
    if (user && user.email) {
      // Eksik bilgiler varsa modal'ı göster
      const isIncomplete = isProfileIncomplete(user);
      if (isIncomplete && !hasCheckedOnboarding) {
        showOnboardingModal = true;
        hasCheckedOnboarding = true;
      } else if (!isIncomplete) {
        showOnboardingModal = false;
        hasCheckedOnboarding = true;
      }
    }
  }

  function handleOnboardingComplete() {
    showOnboardingModal = false;
    hasCheckedOnboarding = true;
  }
</script>

<slot />

<Toast />

{#if showOnboardingModal && isLoggedIn && !isPublicRoute}
  <OnboardingModal isOpen={showOnboardingModal} onComplete={handleOnboardingComplete} />
{/if}
