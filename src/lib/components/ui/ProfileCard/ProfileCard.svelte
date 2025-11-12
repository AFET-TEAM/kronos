<script lang="ts">
  import Button from "$lib/components/ui/Button/Button.svelte";

  export let name = "John Doe";
  export let title = "Role";
  export let squad = "Squad Name";
  export let avatarUrl = "https://via.placeholder.com/40";
  export let onClick: () => void = () => {};

  const colors = [
    "from-cyan-400 to-blue-500",
    "from-purple-400 to-pink-500",
    "from-blue-400 to-cyan-500",
    "from-teal-400 to-blue-500",
    "from-indigo-400 to-blue-500",
  ];

  const getInitials = (fullName: string) => {
    const parts = fullName.split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : fullName[0].toUpperCase();
  };

  const getAvatarColor = (fullName: string) => {
    const index =
      (fullName.charCodeAt(0) + (fullName.charCodeAt(1) || 0)) % colors.length;
    return colors[index];
  };

  const hasAvatar = avatarUrl && avatarUrl !== "https://via.placeholder.com/40";
  const initials = getInitials(name);
  const gradientColor = getAvatarColor(name);
</script>

<div
  class="flex flex-col items-center text-center px-4 py-4 mb-5 space-y-1 w-full"
>
  {#if hasAvatar}
    <img
      src={avatarUrl}
      alt={name}
      loading="lazy"
      decoding="async"
      class="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-400"
    />
  {:else}
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
  type="button"
  text="Profil"
  variant="secondary"
  size="medium"
  theme="light"
  {onClick}
  className="w-full bg-yellow-100 text-gray-900 hover:bg-yellow-200"
/>
