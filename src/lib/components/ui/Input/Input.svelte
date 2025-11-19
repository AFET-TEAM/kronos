<script lang="ts">
  import { onMount, tick, createEventDispatcher } from "svelte";
  import Icon from "../Icon/Icon.svelte";
  import Button from "../Button/Button.svelte";

  const dispatch = createEventDispatcher();

  export let label: string = "";
  export let type: "text" | "email" | "password" | "date" = "text";
  export let value: string = "";
  export let placeholder: string = "";
  export let disabled: boolean = false;
  export let iconLeft: string | null = null;
  export let iconRight: string | null = null;
  export let maxLength: number | null = null;
  export let min: string | null = null;
  export let max: string | null = null;
  export let theme: "light" | "dark" = "light";
  export let className: string = "";

  let inputId: string;
  let showPassword = false;
  let focused = false;

  let inputElement: HTMLInputElement;
  let containerElement: HTMLDivElement;
  
  // Parent'tan gelen value değiştiğinde input'u güncelle (eğer user yazarken değilse)
  $: if (inputElement) {
    if (document.activeElement !== inputElement) {
      inputElement.value = value;
    }
  }
  
  onMount(() => {
    inputId = `input-${Math.random().toString(36).slice(2, 9)}`;
    if (inputElement) {
      inputElement.value = value;
    }
  });
  
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    value = newValue;
    dispatch('input', { value: newValue, originalEvent: e });
  }

  async function toggleShowPassword() {
    showPassword = !showPassword;
    await tick();
    if (!inputElement) return;
    inputElement.focus();
    const length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
  }

  function onFocusIn() {
    focused = true;
  }

  function onFocusOut(event: FocusEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement | null;
    if (relatedTarget && containerElement.contains(relatedTarget)) {
      return;
    }
    focused = false;
  }
</script>

<div class={`w-full ${theme === "dark" ? "text-white" : "text-dark-gray"}`}>
  {#if label}
    <label for={inputId} class="block mb-1 font-semibold">{label}</label>
  {/if}

  <div
    bind:this={containerElement}
    tabindex="-1"
    on:focusin={onFocusIn}
    on:focusout={onFocusOut}
    class={`flex items-center border rounded-md transition
    ${
      theme === "dark"
        ? "bg-blue-charcoal border-mid-gray focus-within:border-primary"
        : "bg-white border-light-gray focus-within:border-primary"
    }
    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
    ${className}`}
  >
    {#if iconLeft}
      <span class="pl-3 pr-1 text-light-gray flex items-center">
        <Icon
          name={iconLeft}
          width="16"
          height="16"
          className="text-light-gray"
        />
      </span>
    {/if}

    {#if type === "password"}
      {#if showPassword}
        <input
          bind:this={inputElement}
          id={inputId}
          type="text"
          {placeholder}
          {disabled}
          maxlength={maxLength ?? undefined}
          class="flex-1 py-2 px-3 bg-transparent focus:outline-none"
          on:input={handleInput}
          on:keydown
        />
      {:else}
        <input
          bind:this={inputElement}
          id={inputId}
          type="password"
          {placeholder}
          {disabled}
          maxlength={maxLength ?? undefined}
          class="flex-1 py-2 px-3 bg-transparent focus:outline-none"
          on:input={handleInput}
          on:keydown
        />
      {/if}
    {:else if type === "email"}
      <input
        bind:this={inputElement}
        id={inputId}
        type="email"
        {placeholder}
        {disabled}
        maxlength={maxLength ?? undefined}
        class="flex-1 py-2 px-3 bg-transparent focus:outline-none"
        on:input={handleInput}
        on:keydown
      />
    {:else if type === "date"}
      <input
        bind:this={inputElement}
        id={inputId}
        type="date"
        {placeholder}
        {disabled}
        min={min ?? undefined}
        max={max ?? undefined}
        class="flex-1 py-2 px-3 bg-transparent focus:outline-none"
        on:input={handleInput}
        on:keydown
      />
    {:else}
      <input
        bind:this={inputElement}
        id={inputId}
        type="text"
        {placeholder}
        {disabled}
        maxlength={maxLength ?? undefined}
        class="flex-1 py-2 px-3 bg-transparent focus:outline-none"
        on:input={handleInput}
        on:keydown
      />
    {/if}

    {#if type === "password" && focused && !disabled}
      {#key showPassword}
        <Button
          type="button"
          size="small"
          {theme}
          variant="primary"
          {disabled}
          className="pl-1 pr-3 flex items-center"
          onClick={toggleShowPassword}
        >
          <Icon
            name={showPassword ? "eye-off" : "eye"}
            width="18"
            height="18"
          />
        </Button>
      {/key}
    {/if}

    {#if iconRight}
      <span class="pl-1 pr-3 text-light-gray flex items-center">
        <Icon
          name={iconRight}
          width="16"
          height="16"
          className="text-light-gray"
        />
      </span>
    {/if}
  </div>
</div>

<style>
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none;
  }

  input[type="password"]::-webkit-textfield-decoration-container {
    display: none;
  }

  input[type="password"] {
    -webkit-appearance: none;
    appearance: none;
  }
</style>
