<script lang="ts">
  export let checked = false;
  export let disabled = false;
  export let label = "";
  export let name = "";
  export let value = "";
  export let theme: "light" | "dark" = "light";

  function handleChange(e: Event) {
    checked = (e.target as HTMLInputElement).checked;
  }
</script>

<div class="flex items-center space-x-2">
  <input
    type="checkbox"
    id={name}
    name={name}
    value={value}
    bind:checked
    disabled={disabled}
    on:change={handleChange}
    class={`appearance-none w-5 h-5 rounded border-2 cursor-pointer
      ${
        theme === "dark"
          ? "border-mid-gray bg-blue-charcoal checked:bg-primary checked:border-primary"
          : "border-light-gray bg-white checked:bg-primary checked:border-primary"
      }
      disabled:opacity-60 disabled:cursor-not-allowed
      checked:before:block checked:before:content-['✓'] checked:before:text-white checked:before:text-center checked:before:text-lg checked:before:leading-[18px]
    `}
  />
  <label for={name} class={`${theme === "dark" ? "text-white" : "text-dark-gray"} cursor-pointer select-none`}>
    {label}
  </label>
</div>
