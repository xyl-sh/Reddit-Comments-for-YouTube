<script lang="ts">
  import { SettingType, Settings, getSetting } from "@/utils/settings";
  import PopupSettings from "./PopupSettings.svelte";
  import PopupThread from "./PopupThread.svelte";
  import { onMount } from "svelte";

  let threadsOptionEnabled = $state(false);
  let showingThreads = $state(false);

  let settingsMessage = $derived(
    i18n.t(`popupTabs.${showingThreads ? "settings" : "threads"}`),
  );

  onMount(async () => {
    threadsOptionEnabled = await getSetting(
      Settings.SEARCHALLSITES,
      SettingType.BOOLEAN,
    ).getValue();

    showingThreads = threadsOptionEnabled;
  });
</script>

<main>
  {#if threadsOptionEnabled}
    <button
      onclick={() => {
        showingThreads = !showingThreads;
      }}
      >{settingsMessage}
    </button>
  {/if}
  {#if showingThreads}
    <PopupThread />
  {:else}
    <PopupSettings />
  {/if}
</main>

<style lang="postcss">
  @reference "@/assets/css/popup.css";

  main {
    @apply p-8 flex flex-col items-end gap-4;

    :global(p) {
      @apply m-0;
    }
  }

  button {
    @apply plain-button text-link hover:underline text-standard;
  }
</style>
