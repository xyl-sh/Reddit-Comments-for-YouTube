<script lang="ts">
	import { onMount } from 'svelte';
	import Main from './Main.svelte';
	import PopupThread from './PopupThread.svelte';
	import { SettingType, Settings, getSetting } from '@/lib/settings';

	let threadsOptionEnabled = false;
	let showingThreads = false;

	$: settingsMessage = showingThreads
		? browser.i18n.getMessage('goToSettings')
		: browser.i18n.getMessage('goToThreads');

	onMount(async () => {
		threadsOptionEnabled = await getSetting(
			Settings.SEARCHALLSITES,
			SettingType.BOOLEAN
		).getValue();

		showingThreads = threadsOptionEnabled;
	});
</script>

<main>
	{#if threadsOptionEnabled}
		<button
			on:click={() => {
				showingThreads = !showingThreads;
			}}>{settingsMessage}</button
		>
	{/if}
	{#if showingThreads}
		<PopupThread />
	{:else}
		<Main />
	{/if}
</main>

<style lang="postcss">
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
