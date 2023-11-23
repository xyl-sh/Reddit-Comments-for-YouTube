<script lang="ts">
	import { siteStore, videoIdStore, youtubeIdStore } from '../store';
	import { sendMessage } from '@/lib/messaging';
	import type { Thread } from '@/lib/types/RedditElements';
	import type { GetThreadsRequest } from '@/lib/types/NetworkRequests';
	import { onMount } from 'svelte';
	import ThreadComponent from './ThreadComponent.svelte';
	import { ThreadSort } from '@/lib/constants';
	import CustomSelect from './interactable/CustomSelect.svelte';
	import type { SelectOption } from './interactable/CustomSelect.svelte';
	import { SettingType, Settings, getSetting } from '@/lib/settings';

	let defaultThreadSort: SelectOption;

	function sortThreads(o: SelectOption) {
		selectedSort = o;

		if (selectedSort === undefined) {
			return;
		}

		let sort: ThreadSort = selectedSort.id;

		if (!selectedSort || !threads) {
			return;
		}
		storage.setItem<ThreadSort>('local:lastSort', sort);
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

				case ThreadSort.SUBREDDIT:
					conditionA = a.subreddit.toLowerCase();
					conditionB = b.subreddit.toLowerCase();
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
	}

	async function getThreads() {
		const getThreadsRequest: GetThreadsRequest = {
			site: $siteStore,
			videoId: $videoIdStore,
			youtubeId: $youtubeIdStore!,
		};

		threads = await sendMessage('getThreads', getThreadsRequest);

		statusMessage =
			threads?.length === 1
				? browser.i18n.getMessage('oneThread')
				: browser.i18n.getMessage('threadCount', [`${threads.length}`]);

		sortThreads(selectedSort);
	}

	const headerMessage = browser.i18n.getMessage('header');
	const sortMessage = browser.i18n.getMessage('sortThreads');
	const noThreadsMessage = browser.i18n.getMessage('noThreads');
	let statusMessage = browser.i18n.getMessage('loadingThreads');

	const sortOptions = Object.values(ThreadSort).map<SelectOption>((o) => ({
		id: o,
		title: browser.i18n.getMessage(o as any),
	}));

	let isCollapsed: boolean;
	let threads: Thread[];
	let threadOptions: SelectOption[];
	let selectedThread: undefined | Thread;
	let selectedSort: SelectOption;

	youtubeIdStore.subscribe((r) => {
		if (!$siteStore.canMatchYouTube || r !== undefined) {
			getThreads();
		}
	});

	function setThread(o: SelectOption) {
		selectedThread = threads.find((t) => t.fullId === o.id)!;
	}

	onMount(async () => {
		isCollapsed = await getSetting(
			Settings.COLLAPSEONLOAD,
			SettingType.BOOLEAN
		).getValue();

		const lastSort =
			(await storage.getItem('local:lastSort')) || ThreadSort.SCORE;
		defaultThreadSort = sortOptions.find((o) => o.id === lastSort)!;
	});
</script>

<div class="{$siteStore.id} container">
	<div class="header">
		<h2>
			<button
				class="plain-button-link"
				on:click={() => (isCollapsed = !isCollapsed)}
				>{isCollapsed ? '[＋]' : '[－]'}</button
			>
			{headerMessage}
		</h2>
		<h2 class="status">{statusMessage}</h2>
		<div class="sort">
			<h2>{sortMessage}&nbsp;</h2>
			{#if defaultThreadSort}
				<CustomSelect
					options={sortOptions}
					defaultOption={defaultThreadSort}
					callback={sortThreads}
				/>
			{/if}
		</div>
	</div>
	<div class:collapsed={isCollapsed}>
		{#if threadOptions?.length}
			<CustomSelect
				options={threadOptions}
				fullWidth={true}
				defaultOption={undefined}
				callback={setThread}
			/>
		{:else}
			<span class="status">{noThreadsMessage}</span>
		{/if}
		{#if selectedThread !== undefined}
			{#key selectedThread?.fullId}
				<ThreadComponent thread={selectedThread} />
			{/key}
		{/if}
	</div>
</div>

<style lang="postcss">
	.container {
		@apply leading-normal w-full text-primary;
	}

	.header {
		@apply flex justify-between items-center mb-2.5 text-standard [&>*]:w-full;
	}

	.collapsed {
		@apply overflow-hidden h-0;
	}

	.status {
		@apply text-center text-standard;
	}

	.sort {
		@apply flex justify-end items-center;
	}
</style>
