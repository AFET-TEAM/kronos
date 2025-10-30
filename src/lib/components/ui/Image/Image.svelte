<script lang="ts">
  export let src: string;
  export let alt: string;
  export let width: number | undefined = undefined;
  export let height: number | undefined = undefined;
  export let className: string = "";
  export let priority: boolean = false;
  export let objectFit: "contain" | "cover" | "fill" | "none" | "scale-down" =
    "cover";
  export let loading: "lazy" | "eager" = priority ? "eager" : "lazy";
</script>

<picture>
  <img
    {src}
    {alt}
    {width}
    {height}
    {loading}
    style="object-fit: {objectFit};"
    class={className}
    fetchpriority={priority ? "high" : "auto"}
  />
</picture>

<style>
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
</style>
