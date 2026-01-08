<script lang="ts">
  import Button from "$lib/components/ui/Button/Button.svelte";
  import { API_URL } from "$lib/services/api.config.js";

  export let name = "John Doe";
  export let title = "Role";
  export let squad = "Squad Name";
  export let avatarUrl = "";
  export let onClick: () => void = () => {};

  const colors = [
    "from-cyan-400 to-blue-500",
    "from-purple-400 to-pink-500",
    "from-blue-400 to-cyan-500",
    "from-teal-400 to-blue-500",
    "from-indigo-400 to-blue-500",
  ];

  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const parts = fullName.split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : fullName[0]?.toUpperCase() || "U";
  };

  const getAvatarColor = (fullName: string) => {
    if (!fullName) return colors[0];
    const index =
      (fullName.charCodeAt(0) + (fullName.charCodeAt(1) || 0)) % colors.length;
    return colors[index];
  };

  // Avatar URL'ini düzelt (relative path ise API_URL ile birleştir)
  function getAvatarUrl(url: string | undefined): string {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    if (url.startsWith("/uploads/")) {
      return `${API_URL}${url}`;
    }
    return url;
  }

  let avatarError = false;

  $: hasAvatar = avatarUrl && avatarUrl.trim() !== "" && !avatarError;
  $: initials = getInitials(name);
  $: gradientColor = getAvatarColor(name);
  $: displayAvatarUrl = getAvatarUrl(avatarUrl);

  function handleAvatarError() {
    avatarError = true;
  }

  // Avatar URL değiştiğinde hatayı sıfırla
  $: if (avatarUrl) {
    avatarError = false;
  }
</script>

<div
  class="flex flex-col items-center text-center px-4 py-4 mb-5 space-y-1 w-full"
>
  {#if hasAvatar}
    <img
      src={displayAvatarUrl}
      alt={name}
      loading="lazy"
      decoding="async"
      class="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-400"
      on:error={handleAvatarError}
    />
  {/if}
  {#if !hasAvatar}
    <div
      class="w-14 h-14 rounded-full bg-gradient-to-br {gradientColor} flex items-center justify-center ring-2 ring-indigo-400"
    >
      <span class="text-lg font-bold text-white">{initials}</span>
    </div>
  {/if}
  <p class="text-base font-semibold text-blue-200 dark:text-white">{name}</p>
  <p class="text-sm text-blue-300 dark:text-gray-400">{title}</p>
  <p class="text-sm text-blue-300 dark:text-gray-400">{squad}</p>
</div>

<Button
  text="Profil"
  variant="tertiary"
  size="medium"
  {onClick}
  className="w-full"
/>
