<script lang="ts">
  import { createEventDispatcher } from "svelte";

  type SizeKey = "sm" | "md" | "lg";

  const sizeMap: Record<SizeKey, { text: string; h: string }> = {
    sm: { text: "text-[14px] leading-[20px]", h: "36px" },
    md: { text: "text-[20px] leading-[28px]", h: "44px" },
    lg: { text: "text-[24px] leading-[32px]", h: "52px" },
  };

  export let start = "01";
  export let end = "07";
  export let monthLabel = "October 2025";
  export let label = "";

  export let width = "100%";
  export let height = "44px";
  export let bgClass =
    "bg-gradient-to-r from-cyan-400 via-teal-300 to-yellow-300";
  export let rounded = "rounded-lg";
  export let padding = "px-4";
  export let textClass =
    "font-montserrat font-bold text-[20px] leading-[28px] tracking-[-0.015em] text-black";

  export let size: SizeKey = "md";

  export let disabled = false;
  export let loading = false;
  export let icon: string | null = null;
  export let onClick: () => void = () => {};

  export let bordered = true;

  const dispatch = createEventDispatcher();

  $: current = sizeMap[size] ?? sizeMap.md;
  $: computedHeight = current.h || height;
  $: computedText = `${textClass} ${current.text || ""}`;

  function handleActivate() {
    if (disabled || loading) return;
    onClick?.();
    dispatch("click");
    dispatch("select", { start, end, monthLabel });
  }

  function onKeydown(e: KeyboardEvent) {
    if (disabled || loading) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
  }
</script>

<div
  class={`flex items-center cursor-pointer ${rounded} 
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-95"} 
          ${bordered ? `p-[2px] ${bgClass}` : "bg-white"}`}
  style={`width:${width}; height:${computedHeight};`}
  role="button"
  tabindex={disabled ? undefined : 0}
  aria-disabled={disabled}
  aria-label={label || `${start} - ${end} ${monthLabel}`}
  on:click={handleActivate}
  on:keydown={onKeydown}
>
  <div
    class={`flex w-full items-center justify-between ${rounded} ${padding}
            ${bgClass}
            ring-0 focus-within:ring-2 focus-within:ring-black/20 transition`}
  >
    <span class={computedText}>
      {#if label}
        {label}
      {:else}
        {start} - {end} {monthLabel}
      {/if}
    </span>

    <span class="ml-3 flex items-center justify-center">
      <slot name="icon">
        {#if icon}
          {@html icon}
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-black"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </slot>
    </span>
  </div>
</div>
