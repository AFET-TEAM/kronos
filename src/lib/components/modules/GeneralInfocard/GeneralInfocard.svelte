<script lang="ts">
  import type { GeneralInfocardProps } from "./generalInfocard.types.ts";

  export let value: GeneralInfocardProps["value"] = "";
  export let label: GeneralInfocardProps["label"] = "";
  export let leftIcon: GeneralInfocardProps["leftIcon"] = "";
  export let rightIcon: GeneralInfocardProps["rightIcon"] = "";
  export let borderColor: GeneralInfocardProps["borderColor"] = "#ffb366";
  export let darkBorderColor: GeneralInfocardProps["darkBorderColor"] =
    "#fbbf24";
  export let className: GeneralInfocardProps["className"] = "";
</script>

<div
  class="infocard {className} flex items-center justify-between p-4 rounded-2xl shadow-md bg-white dark:bg-gray-800 min-w-[220px] max-w-xs gap-3"
  style="--icon-border: {borderColor}; --icon-border-dark: {darkBorderColor}"
>
  {#if leftIcon}
    <div class="icon-box left flex items-center justify-center">
      <img src={leftIcon} alt="icon" class="w-6 h-6 object-contain" />
    </div>
  {/if}
  <div class="flex flex-col justify-center flex-1">
    <span
      class="text-3xl font-extrabold text-gray-900 dark:text-white leading-none"
      >{value}</span
    >
    <span class="text-sm text-gray-500 dark:text-gray-300 mt-1">{label}</span>
    <slot />
  </div>
  {#if rightIcon}
    <div class="icon-box right flex items-center justify-center">
      <img src={rightIcon} alt="icon" class="w-6 h-6 object-contain" />
    </div>
  {/if}
</div>

<style>
  .infocard {
    box-sizing: border-box;
    background: #fff;
    border-radius: 1rem;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
    min-width: 220px;
    max-width: 300px;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    transition: background 0.2s;
  }
  .icon-box {
    border: 2px solid var(--icon-border, #ffb366);
    border-radius: 0.5rem;
    width: 40px;
    height: 40px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s;
  }
  .dark .icon-box {
    border-color: var(--icon-border-dark, #fbbf24);
  }
  .icon-box.left {
    margin-right: 0.75rem;
  }
  .icon-box.right {
    margin-left: 0.75rem;
  }
</style>
