<script>
    export let name;
    export let width = "24";
    export let height = "24";
    export let alt = "";
    export let className = "";
  
    let iconPath = new URL(`../../assets/icons/${name}.svg`, import.meta.url).href;
  </script>
  
  <img
    src={iconPath}
    alt={alt || name}
    width={width}
    height={height}
    class={className}
  />
  