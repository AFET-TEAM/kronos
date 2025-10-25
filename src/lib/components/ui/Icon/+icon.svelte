<script>
  export let name;
  export let width = "24";
  export let height = "24";
  export let alt = "";
  export let className = "";

  let iconPath = `/icons/${name}.svg`;
</script>

<img src={iconPath} alt={alt || name} {width} {height} class={className} />
