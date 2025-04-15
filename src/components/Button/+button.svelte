<script lang="ts">
    export let type: "button" | "submit" | "reset" = "button";
    export let disabled: boolean = false;
    export let onClick: (event: MouseEvent) => void = () => {};
    export let variant: "primary" | "secondary" = "primary";
    export let size: "small" | "medium" | "large" = "medium";
    export let theme: "light" | "dark" = "light";
    export let className: string = "";
    export let buttonText: string = "";
  
    $: computedClass = className
      ? className
      : `button ${variant} ${size} ${theme}`;
  </script>
  
  <style>
    button {
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s all;
      border: 2px solid transparent;
    }
  
    /* === Variant + Light Theme === */
    .primary.light {
      background-color: #0e82ff;
      color: white;
      border-color: #0e82ff;
    }
  
    .primary.light:hover {
      background-color: rgba(0, 123, 255, 0.1);
      color: #0e82ff;
    }
  
    .secondary.light {
      background-color: #ffffff;
      color: #0e82ff;
      border-color: #0e82ff;
    }
  
    .secondary.light:hover {
      background-color: rgba(0, 123, 255, 0.1);
    }
  
    /* === Variant + Dark Theme === */
    .primary.dark {
      background-color: #444;
      color: #ccc;
      border-color: #777;
    }
  
    .primary.dark:hover {
      background-color: #555;
    }
  
    .secondary.dark {
      background-color: transparent;
      color: #ccc;
      border-color: #999;
    }
  
    .secondary.dark:hover {
      background-color: #333;
    }
  
    /* === Size === */
    .small {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }
  
    .medium {
      padding: 0.5rem 1rem;
      font-size: 1rem;
    }
  
    .large {
      padding: 0.75rem 1.5rem;
      font-size: 1.2rem;
    }
  
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  </style>
  
  <button
    type={type}
    disabled={disabled}
    class={computedClass}
    on:click={onClick}
  >
    <slot>{buttonText}</slot>
  </button>
  