<!-- button.svelte -->
<script lang="ts">
    export let type: "button" | "submit" | "reset" = "button";
    export let disabled: boolean = false;
    export let onClick: (event: MouseEvent) => void = () => {};
    export let className: string = "";
    export let buttonText: string = "";
</script>

<button {type} {disabled} class={className} on:click={onClick}>
    <slot>{buttonText}</slot>
</button>
