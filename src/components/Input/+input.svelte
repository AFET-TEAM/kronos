<!-- Input.svelte -->
<script lang="ts">
    export let type = "text";
    export let placeholder = "";
    export let value = "";
    export let label = "";
    export let customClass = "";
    export let onInput = (value: any) => {};

    function handleInput(event: any) {
        onInput(event.target.value);
    }
</script>

<div class="flex flex-col gap-4">
    <label class="text-2xl text-ocean-blue">{label}</label>
    <input
        class="w-full border border-white rounded-md p-2"
        {type}
        {placeholder}
        {value}
        on:input={handleInput}
    />
</div>
