<script lang="ts">
  export let type: "button" | "submit" | "reset" = "button";
  export let size: "small" | "medium" | "large" = "medium";
  export let disabled: boolean = false;
  export let variant: "primary" | "secondary" | "tertiary" = "primary";
  export let className: string = "";
  export let text: string = "";
  export let onClick: (event: MouseEvent) => void = () => {};

  $: computedClass = `${className} btn ${variant} ${size}`.trim();
  function handleClick(e: MouseEvent) {
    if (!disabled) {
      onClick(e);
    }
  }
</script>

<button {type} {disabled} class={computedClass} on:click={handleClick}>
  {text}
</button>

<style>

  button {
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s all;
    border: 1px solid transparent;
  }

  /* Primary Button */
  .primary {
    background-color: var(--color-ui-button-primary);
    color: var(--color-ui-button-primary-text);
  }

  /* Secondary Button */
  .secondary {
    background-color: var(--color-ui-button-secondary);
    color: var(--color-ui-button-secondary-text);
    border-color: var(--color-ui-button-secondary-border);
  }

  /* Tertiary Button */
  .tertiary {
    background-color: var(--color-ui-button-tertiary);
    color: var(--color-ui-button-primary-text);
  }
  .tertiary:hover {
    background-color: var(--color-ui-button-tertiary-hover);
  }
  /* Button Sizes */
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

  /* Disabled Button */
  button:disabled {
    background-color: var(--color-ui-button-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }

  button:not(:disabled).primary:hover {
    background-color: var(--color-ui-button-primary-hover);
    color: var(--color-text-inverse);
  }

  button:not(:disabled).secondary:hover {
    background-color: var(--color-ui-button-secondary-hover);
    color: var(--color-text-inverse);
  }
</style>
