<script>
  import { clsx } from "clsx";
  import { createEventDispatcher, onMount, onDestroy } from "svelte";

  export let totalItems = 0;
  export let itemsPerPage = 10;
  export let currentPage = 1;
  export let classes = {
    wrapper: "",
    button: "",
    activeButton: "",
    inactiveButton: "",
    prevNext: "",
  };
  export let showPrevNext = true;

  const dispatch = createEventDispatcher();

  $: totalPages = Math.ceil(totalItems / itemsPerPage);
  $: pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    dispatch("pageChange", { page });
  };

  const handleKeydown = (e) => {
    switch (e.key) {
      case "ArrowLeft":
        changePage(currentPage - 1);
        break;
      case "ArrowRight":
        changePage(currentPage + 1);
        break;
      case "Home":
        changePage(1);
        break;
      case "End":
        changePage(totalPages);
        break;
    }
  };

  //   onMount(() => {
  //     window.addEventListener("keydown", handleKeydown);
  //   });

  //   onDestroy(() => {
  //     window.removeEventListener("keydown", handleKeydown);
  //   });

  const prevNextButtonClass =
    "w-[35px] h-[35px] rounded-full border border-solid border-orange-400 border-[1.5px] flex items-center justify-center text-[12px] font-medium disabled:opacity-40";
</script>

<div
  class={clsx(
    "flex items-center gap-2 justify-center flex-wrap",
    classes.wrapper
  )}
  tabindex="0"
  on:keydown={handleKeydown}
>
  {#if showPrevNext}
    <button
      class={clsx(prevNextButtonClass, classes.prevNext)}
      on:click={() => changePage(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <slot name="prev">‹</slot>
    </button>
  {/if}

  {#each pages as page}
    <button
      class={clsx(
        "w-[35px] h-[35px] rounded-full border border-solid border-orange-400 flex items-center justify-center text-[12px] font-medium",
        page === currentPage
          ? "bg-orange-400 text-white"
          : "bg-white text-black hover:bg-orange-100",
        classes.button
      )}
      on:click={() => changePage(page)}
    >
      {page}
    </button>
  {/each}
  {#if showPrevNext}
    <button
      class={clsx(prevNextButtonClass, classes.prevNext)}
      on:click={() => changePage(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      <slot name="next">›</slot>
    </button>
  {/if}
</div>
