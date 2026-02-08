<script lang="ts">
  import "../app.scss";
  import Toast from "$lib/components/ui/Toast/Toast.svelte";
  import OnboardingModal from "$lib/components/ui/OnboardingModal/OnboardingModal.svelte";
  import { userStore } from "$lib/store/store.js";
  import { isProfileIncomplete } from "$lib/utils/profileUtils.js";
  import { page } from "$app/stores";
  import { isAuthenticated } from "$lib/services/auth.service.js";
  import { getMyProfile } from "$lib/services/user.service.js";

  let showOnboardingModal = false;
  let hasCheckedOnboarding = false;
  let hasSyncedProfileSinceLogin = false;

  // Public routes - onboarding modal gösterilmemeli
  const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

  $: isPublicRoute = publicRoutes.some((route) => $page.url.pathname.startsWith(route));
  $: isLoggedIn = isAuthenticated();

  // Çıkış yapıldığında bir sonraki girişte tekrar senkronize ve kontrol edilebilsin
  $: if (!isLoggedIn) {
    hasCheckedOnboarding = false;
    hasSyncedProfileSinceLogin = false;
  }

  // Giriş sonrası korunan sayfaya girince: login'de bırakılan bayrak varsa hemen modal aç; yoksa profili senkronize et
  $: if (isLoggedIn && !isPublicRoute && typeof window !== "undefined") {
    const pendingOnboarding = typeof sessionStorage !== "undefined" && sessionStorage.getItem("showOnboardingAfterLogin") === "1";
    if (pendingOnboarding) {
      sessionStorage.removeItem("showOnboardingAfterLogin");
      showOnboardingModal = true;
      hasCheckedOnboarding = true;
    } else if (!hasSyncedProfileSinceLogin) {
      hasSyncedProfileSinceLogin = true;
      getMyProfile()
        .then((profile) => {
          const userData = {
            email: profile.email,
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            title: profile.title || "",
            squad: profile.squad || "",
            department: profile.department || "",
            avatarUrl: profile.avatarUrl || "",
            role: profile.role || "user",
            startDate: profile.startDate || "",
            projects: profile.projects || [],
            trainings: profile.trainings || [],
            awards: profile.awards || [],
            certifications: profile.certifications || [],
          };
          userStore.set(userData);
          if (typeof window !== "undefined") {
            localStorage.setItem("userProfile", JSON.stringify(userData));
          }
          const incomplete = isProfileIncomplete(userData);
          if (incomplete) {
            showOnboardingModal = true;
          }
          hasCheckedOnboarding = true;
        })
        .catch(() => {
          hasCheckedOnboarding = true;
        });
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
