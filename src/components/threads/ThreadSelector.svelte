<script lang="ts">
	import CustomSelect, {
		type SelectOption,
	} from "./interactable/CustomSelect.svelte";
	import { SettingType, Settings, getSetting } from "@/utils/settings";
	import type { GetThreadsRequest } from "@/utils/types/NetworkRequests";
	import type { Site } from "@/utils/types/Site";
	import type { Thread } from "@/utils/types/Elements";
	import ThreadComponent from "./ThreadComponent.svelte";
	import { ThreadSort } from "@/utils/constants";
	import { onMount } from "svelte";
	import { sendMessage } from "@/utils/messaging";

	export interface ThreadSelectorProps {
		isPopup?: boolean;
		site: Site;
		threads?: Thread[] | undefined;
		vId: string;
		yId: string | null | undefined;
	}

	let {
		site,
		vId,
		yId,
		threads = undefined,
		isPopup = false,
	}: ThreadSelectorProps = $props();

	console.log("threads", threads);

	const lastSortSetting = getSetting(Settings.LASTSORT, SettingType.OPTION);
	let hasSorted: boolean = false;

	function sortThreads(o: SelectOption<ThreadSort> | undefined) {
		console.log("is we");
		if (selectedSort === undefined || (o === selectedSort && hasSorted)) {
			console.log("awa");
			return;
		}

		hasSorted = true;
		let sort: ThreadSort = selectedSort.id;

		if (!selectedSort || !threads) {
			return;
		}
		lastSortSetting.setValue(sort);
		threads.sort((a, b) => {
			let conditionA, conditionB;
			switch (sort) {
				case ThreadSort.COMMENTS:
					conditionA = b.comments;
					conditionB = a.comments;
					break;

				case ThreadSort.NEWEST:
					conditionA = b.createdTimestamp;
					conditionB = a.createdTimestamp;
					break;

				case ThreadSort.SCORE:
					conditionA = b.score;
					conditionB = a.score;
					break;

				case ThreadSort.COMMUNITY:
					conditionA = a.community.toLowerCase();
					conditionB = b.community.toLowerCase();
					break;

				default:
					throw new Error("Invalid sort, somehow...");
			}
			const nameA = a.plainTitle;
			const nameB = b.plainTitle;

			return conditionA < conditionB
				? -1
				: conditionA > conditionB
					? 1
					: nameA < nameB
						? -1
						: 1;
		});
		threadOptions = threads.map(
			(t) =>
				<SelectOption<string>>{
					id: t.fullId,
					title: t.title,
				},
		);

		threadCount = i18n.t("threadCount", threads.length);

		setThread(threadOptions[0]);

		isLoading = false;
	}

	async function getThreads(
		site: Site,
		videoId: string,
		youtubeId: string | null | undefined,
		sort: SelectOption<ThreadSort> | undefined,
	) {
		if (youtubeId === undefined || sort === undefined) return;
		if (threads !== undefined) {
			sortThreads(selectedSort);
			return;
		}

		errorMessage = undefined;

		const getThreadsRequest: GetThreadsRequest = {
			site,
			url: videoId,
			youtubeId,
		};

		const response = await sendMessage("getThreads", getThreadsRequest);

		if (!response.success) {
			errorMessage = response.errorMessage;
			return;
		}

		threads = response.value;

		sortThreads(selectedSort);
	}

	$effect(() => {
		getThreads(site, vId, yId, selectedSort);
	});

	const headerMessage = i18n.t("header");
	const sortMessage = i18n.t("threadSort");
	const noThreadsMessage = i18n.t("noThreads");
	let threadCount = $state(i18n.t("loadingThreads"));
	let errorMessage: string | undefined = $state();
	const sortOptions = Object.values(ThreadSort).map<SelectOption<ThreadSort>>(
		(o) => ({
			id: o,
			title: i18n.t(`threadSortOptions.${o}`),
		}),
	);
	let isLoading: boolean = $state(true);
	let isCollapsed: boolean = $state(false);
	let threadOptions: SelectOption<string>[] = $state([]);
	let selectedThread: Thread | undefined = $state();
	let selectedSort: SelectOption<ThreadSort> | undefined = $state();

	function setThread(o: SelectOption<string>) {
		selectedThread = threads!.find((t) => t.fullId === o.id)!;
	}

	onMount(async () => {
		isCollapsed =
			(await getSetting(
				Settings.COLLAPSEONLOAD,
				SettingType.BOOLEAN,
			).getValue()) && !isPopup;

		const lastSort = await lastSortSetting.getValue();
		selectedSort = sortOptions.find((o) => o.id === lastSort)!;
	});
</script>

<div class="{site.id} reddit-comments">
	<div class="header">
		<span>
			{#if !isPopup}
				<button
					class="thread-collapser"
					onclick={() => (isCollapsed = !isCollapsed)}
					>{isCollapsed ? "[＋]" : "[－]"}
				</button>
			{/if}
			{headerMessage}
		</span>
		<span class="thread-count">{threadCount} </span>
		<div class="sort">
			{#if selectedSort}
				<span>{sortMessage}&nbsp;</span>
				<CustomSelect
					options={sortOptions}
					bind:selectedOption={selectedSort}
					callback={sortThreads}
				/>
			{/if}
		</div>
	</div>
	<div class:collapsed={isCollapsed}>
		{#if selectedThread}
			<CustomSelect
				options={threadOptions}
				fullWidth={true}
				bind:selectedOption={selectedThread}
				callback={setThread}
			/>
		{:else if !isLoading}
			<span class="status">{noThreadsMessage} </span>
		{/if}
		{#if errorMessage}
			<span class="status">{errorMessage} </span>
		{/if}
		{#if selectedThread !== undefined}
			{#key selectedThread.fullId}
				<ThreadComponent thread={selectedThread} {site} />
			{/key}
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "@/assets/css/threads.css";

	.reddit-comments {
		@apply leading-tight w-full text-primary;

		&:not(.popup) {
			@apply my-[20px];
		}
	}

	.header {
		@apply flex justify-between items-center mb-[10px] text-standard;

		.thread-collapser {
			@apply plain-button text-link;
		}

		& > * {
			@apply w-full;
		}

		* {
			@apply text-header;
		}

		.thread-count {
			@apply text-center;
		}
	}

	.collapsed {
		@apply overflow-hidden h-0;
	}

	.status {
		@apply text-center text-standard w-full inline-block;
	}

	.sort {
		@apply flex justify-end items-center;
	}
</style>
