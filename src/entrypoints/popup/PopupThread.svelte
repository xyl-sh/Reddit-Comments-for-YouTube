<script lang="ts">
	import type { Thread } from '@/lib/types/Elements';
	import type { Site } from '@/lib/types/Site';
	import { onMount } from 'svelte';
	import ThreadSelector from '../rcfy.content/components/ThreadSelector.svelte';

	let hasPerm: boolean;
	let dict: { threads: Thread[]; site: Site } | undefined = undefined;

	const loadingMessage = browser.i18n.getMessage('loadingThreads');
	const noPermsMessage = browser.i18n.getMessage('tabsExplanation');
	const requestLabel = browser.i18n.getMessage('request');

	function requestPermission() {
		browser.permissions.request({
			permissions: ['tabs'],
		});
	}

	onMount(async () => {
		hasPerm = await browser.permissions.contains({
			permissions: ['tabs'],
		});

		const tab = await browser.tabs.query({ active: true, currentWindow: true });
		const id = tab[0].id;
		if (!id) {
			return;
		}

		browser.runtime.onMessage.addListener((data) => {
			if (data.id === 'DICTRESPONSE' && data.tab === id) {
				if (!data.dict.threads) return;
				dict = data.dict;
			}
		});
		browser.runtime.sendMessage({ id: 'DICTREQUEST', tab: id });
	});
</script>

<div class="popup-thread">
	{#if !hasPerm}
		<div class="no-perms">
			<span>{noPermsMessage}</span>
			<button on:click={requestPermission}>{requestLabel}</button>
		</div>
	{:else if dict}
		<ThreadSelector
			site={dict.site}
			threads={dict.threads}
			vId=""
			yId=""
			isPopup={true}
		/>
	{:else}
		<span>{loadingMessage}</span>
	{/if}
</div>

<style lang="postcss">
	.popup-thread {
		@apply w-[36rem];

		span {
			@apply text-center block text-standard;
		}
	}

	.no-perms {
		@apply flex flex-col gap-2 items-center justify-center text-center;

		button {
			@apply styled-button w-auto;
		}
	}
</style>
