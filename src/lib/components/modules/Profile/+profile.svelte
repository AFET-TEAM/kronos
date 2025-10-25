<script lang="ts">
  export let name: string = "John Doe";
  export let squad: string = "Squad Name";
  export let avatarUrl: string = "https://via.placeholder.com/40";
</script>

<div class="flex flex-col items-center text-center px-4 py-4 mb-5 space-y-1 w-full">
  <img
    src={avatarUrl}
    alt={name}
    class="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-400"
  />
  <p class="text-base font-semibold text-gray-800 dark:text-white">{name}</p>
  <p class="text-sm text-gray-500 dark:text-gray-400">{squad}</p>
</div>
