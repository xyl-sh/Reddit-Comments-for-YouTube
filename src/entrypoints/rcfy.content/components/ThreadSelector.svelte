<script lang="ts">
	import { sendMessage } from '@/lib/messaging';
	import type { Thread } from '@/lib/types/Elements';
	import type { GetThreadsRequest } from '@/lib/types/NetworkRequests';
	import { onMount } from 'svelte';
	import ThreadComponent from './ThreadComponent.svelte';
	import { ThreadSort } from '@/lib/constants';
	import CustomSelect from './interactable/CustomSelect.svelte';
	import type { SelectOption } from './interactable/CustomSelect.svelte';
	import { SettingType, Settings, getSetting } from '@/lib/settings';
	import type { Site } from '@/lib/types/Site';

	export let site: Site;
	export let vId: string;
	export let yId: string | null | undefined;
	export let threads: Thread[] | undefined = undefined;
	export let isPopup: boolean = false;

	const lastSortSetting = getSetting(Settings.LASTSORT, SettingType.OPTION);

	function sortThreads(o: SelectOption) {
		selectedSort = o;

		if (selectedSort === undefined) {
			return;
		}

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
					throw new Error('Invalid sort, somehow...');
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
				<SelectOption>{
					id: t.fullId,
					title: t.title,
				}
		);

		threadCount =
			threads?.length === 1
				? browser.i18n.getMessage('oneThread')
				: browser.i18n.getMessage('threadCount', [`${threads.length}`]);

		setThread(threadOptions[0]);

		isLoading = false;
	}

	async function getThreads(
		site: Site,
		videoId: string,
		youtubeId: string | null | undefined,
		sort: SelectOption
	) {
		if (youtubeId === undefined || sort === undefined) return;

		if (threads !== undefined) {
			sortThreads(selectedSort);
			return;
		}

		errorMessage = undefined;

		const getThreadsRequest: GetThreadsRequest = {
			site: site,
			videoId: videoId,
			youtubeId: youtubeId,
		};

		const response = await sendMessage('getThreads', getThreadsRequest);

		if (!response.success) {
			errorMessage = response.errorMessage;
			return;
		}

		threads = response.value;

		sortThreads(selectedSort);
	}

	$: getThreads(site, vId, yId, selectedSort);

	const headerMessage = browser.i18n.getMessage('header');
	const sortMessage = browser.i18n.getMessage('sortThreads');
	const noThreadsMessage = browser.i18n.getMessage('noThreads');
	let threadCount = browser.i18n.getMessage('loadingThreads');
	let errorMessage: string | undefined;

	const sortOptions = Object.values(ThreadSort).map<SelectOption>((o) => ({
		id: o,
		title: browser.i18n.getMessage(o as any),
	}));

	let isLoading: boolean = true;
	let isCollapsed: boolean;
	let threadOptions: SelectOption[];
	let selectedThread: Thread;
	let selectedSort: SelectOption;

	function setThread(o: SelectOption) {
		selectedThread = threads!.find((t) => t.fullId === o.id)!;
	}

	onMount(async () => {
		isCollapsed =
			(await getSetting(
				Settings.COLLAPSEONLOAD,
				SettingType.BOOLEAN
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
					on:click={() => (isCollapsed = !isCollapsed)}
					>{isCollapsed ? '[＋]' : '[－]'}</button
				>
			{/if}
			{headerMessage}
		</span>
		<span class="thread-count">{threadCount}</span>
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
			<span class="status">{noThreadsMessage}</span>
		{/if}
		{#if errorMessage}
			<span class="status">{errorMessage}</span>
		{/if}
		{#if selectedThread !== undefined}
			{#key selectedThread.fullId}
				<ThreadComponent thread={selectedThread} {site} />
			{/key}
		{/if}
	</div>
</div>

<style lang="postcss">
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
