<script lang="ts">
	import type { Site } from "@/utils/types/Site";
	import type { Thread } from "@/utils/types/Elements";
	import ThreadSelector from "@/components/threads/ThreadSelector.svelte";
	import { onMount } from "svelte";

	let hasPerm: boolean = $state(false);
	let dict: { site: Site; threads: Thread[] } | undefined = $state(undefined);

	const loadingMessage = i18n.t("loadingThreads");
	const noPermsMessage = i18n.t("tabsExplanation");
	const requestLabel = i18n.t("request");

	function requestPermission() {
		browser.permissions.request({
			permissions: ["tabs"],
		});
	}

	onMount(async () => {
		hasPerm = await browser.permissions.contains({
			permissions: ["tabs"],
		});

		const tab = await browser.tabs.query({ active: true, currentWindow: true });
		const id = tab[0].id;
		if (!id) {
			return;
		}

		browser.runtime.onMessage.addListener((data) => {
			if (data.id === "DICTRESPONSE" && data.tab === id) {
				console.log("data", data);
				if (!data.dict.threads) return;
				dict = data.dict;
			}
		});
		browser.runtime.sendMessage({ id: "DICTREQUEST", tab: id });
	});
</script>

<div class="popup-thread">
	{#if !hasPerm}
		<div class="no-perms">
			<span>{noPermsMessage} </span>
			<button onclick={requestPermission}>{requestLabel} </button>
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
		<span>{loadingMessage} </span>
	{/if}
</div>

<style lang="postcss">
	@reference "@/assets/css/popup.css";

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
