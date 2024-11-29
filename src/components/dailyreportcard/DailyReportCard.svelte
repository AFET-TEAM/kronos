<script lang="ts">
  export let dayName: string = "Pazartesi"; 
  export let items: string[] = []; 
</script>

<div class="w-48 min-h-[15rem] max-h-[20rem] rounded-xl bg-gray-100 shadow-md flex flex-col items-center justify-start p-4">
  <div class="text-md font-semibold text-center mb-4">{dayName}</div>
  <div class="flex-1 overflow-y-auto w-full">
    <ul class="list-disc pl-4 space-y-2 text-left">
      {#each items as item}
        <li class="text-sm">{item}</li>
      {/each}
    </ul>
  </div>
</div>
