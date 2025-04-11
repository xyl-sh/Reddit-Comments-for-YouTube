<script lang="ts">
  import { type ArraySetting, type StorageValue } from "@/utils/settings";
  import String from "./String.svelte";
  import { onMount } from "svelte";

  interface ListSettingProps {
    setting: ArraySetting<StorageValue>;
  }

  let { setting }: ListSettingProps = $props();
  let values: StorageValue[] = $state([]);
  let value: string = $state("");
  let errorMessage: string = $state("");

  const addLabel = i18n.t("popupButtons.add");

  async function onAdd() {
    const add = await setting.addValue(value);
    if (typeof add === "string") {
      errorMessage = add;
      return;
    }

    values = add;
    value = "";
  }

  async function onRemove(v: StorageValue) {
    const remove = await setting.removeValue(v);
    values = remove;
  }

  onMount(async () => {
    values = await setting.getValue();
  });
</script>

<div class="list-container">
  <span class="heading">{setting.label} </span>
  <String
    bind:value
    callback={onAdd}
    label={addLabel}
    placeholder={undefined}
  />

  {#if errorMessage}
    <span class="text-[#CC0000]">{errorMessage} </span>
  {/if}
  {#each values as v (v)}
    <div class="entry">
      <span>{v}</span><button onclick={() => onRemove(v)}>🗑</button>
    </div>
  {/each}
</div>

<style lang="postcss">
  @reference "@/assets/css/popup.css";

  .list-container {
    @apply flex flex-col gap-1 justify-start items-start py-[20px] w-full;
  }

  .entry {
    @apply flex w-full items-center gap-1;

    span {
      @apply grow text-sm overflow-hidden text-ellipsis;
    }
  }

  button {
    @apply flex-shrink-0;
  }

  .heading {
    @apply text-sm;
  }
</style>
