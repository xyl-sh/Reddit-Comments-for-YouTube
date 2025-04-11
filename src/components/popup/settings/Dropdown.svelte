<script lang="ts">
  import { type OptionSetting, type StorageValue } from "@/utils/settings";
  import { onMount } from "svelte";

  interface DropdownSettingProps {
    setting: OptionSetting<StorageValue>;
  }

  let { setting }: DropdownSettingProps = $props();

  let value: string = $state("");

  onMount(async () => {
    value = await setting.getValue();
  });
</script>

<div class="dropdown-container">
  <label for={setting.name}>{setting.label} </label>
  <select id={setting.name} bind:value onchange={() => setting.setValue(value)}>
    {#each setting.availableValues as o (o)}
      <option value={o}>{o} </option>
    {/each}
  </select>
</div>

<style lang="postcss">
  @reference "@/assets/css/popup.css";

  .dropdown-container {
    @apply flex gap-1 justify-start items-start py-[10px];
  }
</style>
