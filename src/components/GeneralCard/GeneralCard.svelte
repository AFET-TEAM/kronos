<script lang="ts">
  import Button from "../Button/+button.svelte";

  export let title: string = "Default Title";
  export let subtitle: string = "";
  export let content: string = "Default content goes here...";

  export let buttons: {
    text: string;
    variant?: "primary" | "secondary";
    size?: "small" | "medium" | "large";
    theme?: "light" | "dark";
    disabled?: boolean;
    onClick?: () => void;
  }[] = [];

  export let variant: "default" | "outlined" | "shadowless" | "flat" = "default";
  export let width: string = "max-w-md";
  export let dark: boolean = false;

  $: variantClasses = {
    default: "bg-white shadow rounded-lg",
    outlined: "bg-white border border-gray-300 rounded-lg",
    shadowless: "bg-white rounded-lg",
    flat: "bg-transparent rounded-lg border border-transparent"
  }[variant];

  $: buttonCount = buttons.length;
</script>

<div
  class={`${variantClasses} py-[12px] px-[24px] ${width} mx-auto flex flex-col ${dark ? "bg-gray-800 text-white" : "text-gray-900"}`}
>
  {#if $$slots.header}
    <header class="mb-4">
      <slot name="header" />
    </header>
  {:else}
    <header class="mb-4 text-center">
      <h2 class="font-montserrat font-bold text-[22px] leading-[36px] tracking-[-0.015em] text-center">
        {title}
      </h2>
      {#if subtitle}
        <p class="font-montserrat font-medium text-[16px] leading-[36px] tracking-[-0.015em] text-center text-gray-500 mt-1">
          {subtitle}
        </p>
      {/if}
    </header>
  {/if}

  {#if $$slots.body}
    <main class="flex-1 mb-4">
      <slot name="body" />
    </main>
  {:else}
    <main class="flex-1 mb-4 font-montserrat font-medium text-[16px] leading-[36px] tracking-[-0.015em] text-center text-gray-700 dark:text-gray-300">
      {content}
    </main>
  {/if}

  {#if $$slots.footer}
    <footer class="mb-4 text-sm text-gray-500 dark:text-gray-400">
      <slot name="footer" />
    </footer>
  {/if}

  {#if buttonCount > 0}
    <div
      class={`mt-4 flex w-full ${
        buttonCount === 2 ? 'gap-0' : 'justify-center'
      }`}
    >
      {#each buttons as btn, i}
        <Button
          className={`${buttonCount === 2 ? 'w-1/2' : 'w-full'} ${
            buttonCount === 2 && i === 0 ? 'rounded-l-lg' : ''
          } ${buttonCount === 2 && i === 1 ? 'rounded-r-lg' : ''}`}
          variant={btn.variant || "primary"}
          size={btn.size || "large"}
          theme={btn.theme || "light"}
          disabled={btn.disabled || false}
          buttonText={btn.text}
          onClick={btn.onClick}
        />
      {/each}
    </div>
  {/if}
</div>
