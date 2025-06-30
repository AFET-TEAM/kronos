<script lang="ts">
    export let type: "button" | "submit" | "reset" = "button";
    export let size: "small" | "medium" | "large" = "medium";
    export let theme: "light" | "dark" = "light";
    export let disabled: boolean = false;
    export let variant: "primary" | "secondary" = "primary";
    export let className: string = "";
    export let buttonText: string = "";
    export let onClick: (event: MouseEvent) => void = () => {};

    $: computedClass = className || `btn ${variant} ${size} ${theme}`;
  </script>
  
  <style>
    button {
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s all;
      border: 1px solid transparent;
    }
    /* === Variant === */
    .primary.light { background-color: #0e82ff; color: #fff; }
    .primary.light:hover { background-color: #0963c3; }
    .secondary.light { background-color: transparent; color: #0e82ff; border-color: #0e82ff; }
    .secondary.light:hover { background-color: #fff; color: #0e82ff; }
    .primary.dark { background-color: #333; color: #ccc; }
    .primary.dark:hover { background-color: #555; }
    .secondary.dark { background-color: transparent; color: #333; border-color: #333; }
    .secondary.dark:hover { background-color: #333; color: #fff; }

    /* === Size === */
    .small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .medium { padding: 0.5rem 1rem; font-size: 1rem; }
    .large { padding: 0.75rem 1.5rem; font-size: 1.2rem; }

    /* === Disabled State === */
    button:disabled { opacity: 0.6; cursor: not-allowed; }
  </style>
  
  <button type={type} disabled={disabled} class={computedClass} on:click={onClick}>
    <slot>{buttonText}</slot>
  </button>
  
  