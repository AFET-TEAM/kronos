<script lang="ts">
  import { onMount } from "svelte";

  export let label: string = "";
  export let type: "text" | "email" | "password" = "text";
  export let value: string = "";
  export let placeholder: string = "";
  export let disabled: boolean = false;
  export let iconLeft: any = null;
  export let iconRight: any = null;
  export let maxLength: number | null = null;
  export let theme: "light" | "dark" = "light";
  export let className: string = "";

  let inputId: string;

  onMount(() => {
    inputId = `input-${Math.random().toString(36).slice(2, 9)}`;
  });

  function handleInput(e: Event) {
    value = (e.target as HTMLInputElement).value;
  }
</script>

<div class={`w-full ${theme === 'dark' ? 'text-white' : 'text-dark-gray'}`}>
  {#if label}
    <label for={inputId} class="block mb-1 font-semibold">{label}</label>
  {/if}

  <div
    class={`flex items-center border rounded-md transition
    ${theme === 'dark'
      ? 'bg-blue-charcoal border-mid-gray focus-within:border-primary'
      : 'bg-white border-light-gray focus-within:border-primary'}
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${className}`}>
    
    {#if iconLeft}
      <span class="pl-3 pr-1 text-light-gray">
        <svelte:component this={iconLeft} />
      </span>
    {/if}

    {#if type === "text"}
      <input
        id={inputId}
        type="text"
        bind:value
        placeholder={placeholder}
        disabled={disabled}
        maxlength={maxLength ?? undefined}
        class="flex-1 py-2 px-3 bg-transparent focus:outline-none"
        on:input={handleInput}
      />
    {:else if type === "email"}
      <input
        id={inputId}
        type="email"
        bind:value
        placeholder={placeholder}
        disabled={disabled}
        maxlength={maxLength ?? undefined}
        class="flex-1 py-2 px-3 bg-transparent focus:outline-none"
        on:input={handleInput}
      />
    {:else if type === "password"}
      <input
        id={inputId}
        type="password"
        bind:value
        placeholder={placeholder}
        disabled={disabled}
        maxlength={maxLength ?? undefined}
        class="flex-1 py-2 px-3 bg-transparent focus:outline-none"
        on:input={handleInput}
      />
    {/if}

    {#if iconRight}
      <span class="pl-1 pr-3 text-light-gray">
        <svelte:component this={iconRight} key={value} />
      </span>
    {/if}
  </div>
</div>
