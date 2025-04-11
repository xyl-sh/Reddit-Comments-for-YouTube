<script lang="ts">
  interface StringSettingProps {
    callback: (value: string) => void;
    label: string;
    placeholder: string | undefined;
    value: string;
  }

  let {
    callback,
    placeholder,
    value = $bindable(),
    label,
  }: StringSettingProps = $props();
</script>

<div class="string-container">
  <input type="text" bind:value placeholder={placeholder || ""} /><button
    onclick={() => callback(value)}>{label}</button
  >
</div>

<style lang="postcss">
  @reference "@/assets/css/popup.css";

  .string-container {
    @apply flex gap-2 w-full;

    input {
      @apply min-w-0;
    }
  }
</style>
