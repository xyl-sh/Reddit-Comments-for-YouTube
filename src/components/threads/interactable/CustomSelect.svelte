<script module lang="ts">
  export interface SelectOption<T> {
    id: T;
    title: string;
  }
</script>

<script lang="ts" generics="T">
  import { onMount } from "svelte";
  interface CustomSelectProps<T> {
    callback: (o: SelectOption<T>) => void;
    fullWidth?: boolean;
    options: SelectOption<T>[];
    selectedOption: SelectOption<T> | undefined;
  }

  let {
    options,
    selectedOption = $bindable(),
    fullWidth = false,
    callback,
  }: CustomSelectProps<T> = $props();

  let entryWidth: number = $state(0);
  let buttonWidth: number = $state(0);
  let mounted = $state(false);
  let isActive = $state(false);
  let titleWidth = $derived(`width: ${buttonWidth}px;`);

  function setSelectedOption(option: SelectOption<T>) {
    selectedOption = option;
    isActive = false;
    if (callback) {
      callback(option);
    }
  }

  function clickOutside(node: HTMLElement) {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (node && !node.contains(target) && !e.defaultPrevented) {
        isActive = false;
      }
    };

    document.addEventListener("click", handleClick, true);
    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      },
    };
  }

  function setWidth(width: number, ready: boolean) {
    if (buttonWidth !== 0 || !ready) return;
    buttonWidth = width - 9;
  }

  $effect(() => {
    setWidth(entryWidth, mounted);
  });

  onMount(() => {
    mounted = true;
  });
</script>

<div
  class="select"
  class:fill-available={fullWidth}
  class:fit={!fullWidth}
  use:clickOutside
>
  <button
    class="selector"
    class:active={isActive}
    onclick={() => {
      isActive = !isActive;
    }}
  >
    <span style={titleWidth}>{selectedOption?.title} </span>
    <div class="arrow">╲╱</div>
  </button>
  <div
    class="options"
    class:hidden={!isActive}
    class:fill-available={buttonWidth}
    bind:clientWidth={entryWidth}
  >
    {#each options as o (o.id)}
      <button onclick={() => setSelectedOption(o)}>
        {o.title}
      </button>
    {/each}
  </div>
</div>

<style lang="postcss">
  @reference "@/assets/css/threads.css";

  button {
    @apply plain-button;
  }

  .select {
    @apply relative text-standard cursor-pointer;

    * {
      @apply text-primary overflow-hidden whitespace-pre text-ellipsis;
    }
  }

  .fit {
    @apply max-w-fit;
  }

  .selector {
    @apply box-content flex items-center justify-between p-[5px] gap-[5px] rounded-small bg-interactable border-[1px] border-interactable fill-available border-solid;

    &.active {
      @apply rounded-b-none;
    }
  }

  .arrow {
    @apply shrink-0 text-arrow;
  }

  .options {
    @apply bg-select absolute top-full z-10 border-interactable border-solid box-content border-t-0 flex flex-col rounded-b-small max-h-[40vh] overflow-auto;

    button {
      @apply bg-option p-[5px] border-t-0 shrink-0 last:border-b-0 hover:bg-hover;
    }

    &.hidden {
      @apply invisible;
    }
  }
</style>
