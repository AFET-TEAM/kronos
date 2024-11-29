<script lang="ts">
    export let checked: boolean = false;
    export let disabled: boolean = false;
    export let label: string = "";
    export let name: string = "";
    export let value: string = "";

    const handleChange = (event: Event) => {
        console.log("checked");
    };
</script>

<div class="checkbox-container">
    <input
        type="checkbox"
        id={name}
        {checked}
        {disabled}
        {name}
        {value}
        on:change={handleChange}
    />
    <label for={name}>{label}</label>
</div>
