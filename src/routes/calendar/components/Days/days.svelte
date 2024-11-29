<script>
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
</script>

<div class="flex justify-between gap-2">
    {#each daysOfWeek as day}
        <div class="day p-3 border text-center border-white text-white flex-1">{day}</div>
    {/each}
</div>