<script lang="ts">
	import type { Thread } from '@/lib/types/RedditElements';
	import { REDDIT_LINK_DOMAIN, CommentSort } from '@/lib/constants';
	import { numberToHms, timestampToRelativeTime } from '@/lib/tools/TimeTools';
	import type { GetCommentsRequest } from '@/lib/types/NetworkRequests';
	import { sendMessage } from '@/lib/messaging';
	import { siteStore } from '../store';
	import Votes from './interactable/Votes.svelte';
	import TextBox from './interactable/TextBox.svelte';
	import type { SelectOption } from './interactable/CustomSelect.svelte';
	import CustomSelect from './interactable/CustomSelect.svelte';
	import { onMount } from 'svelte';
	import CommentContainer from './CommentContainer.svelte';
	import { SettingType, Settings, getSetting } from '@/lib/settings';

	export let thread: Thread;

	async function getComments(o: SelectOption) {
		if (selectedSort === o) {
			return;
		}
		selectedSort = o;
		thread.replies = [];
		thread.info = undefined;
		const getCommentsRequest: GetCommentsRequest = {
			threadId: thread.id,
			sort: selectedSort.id,
			subreddit: thread.subreddit,
		};

		const [replies, info] = await sendMessage(
			'getComments',
			getCommentsRequest
		);
		thread.replies = replies;
		thread.info = info;
		thread = thread;
	}

	function goToTimestamp() {
		document.querySelector<HTMLVideoElement>(
			$siteStore.videoElement
		)!.currentTime = thread.linkedTimestamp!;
	}
	const sortOptions = Object.values(CommentSort).map<SelectOption>((o) => {
		return {
			id: o,
			title: browser.i18n.getMessage(o as any),
		};
	});

	const loadingMessage = browser.i18n.getMessage('loadingComments');
	const sortedByMessage = browser.i18n.getMessage('sortedBy');
	let taglineMessage = browser.i18n.getMessage('threadTagline', [
		timestampToRelativeTime(thread.createdTimestamp),
		thread.author,
		thread.subreddit,
		REDDIT_LINK_DOMAIN,
	]);

	let defaultCommentSort: SelectOption;
	let selectedSort: SelectOption;
	$: selectedSort;

	$: canPost = !(
		thread.info?.isBanned ||
		thread.info?.user.isSuspended ||
		thread.locked ||
		thread.archived
	);
	$: canVote = !(
		!thread.info?.user.username ||
		thread.info?.user.isSuspended ||
		thread.archived
	);

	onMount(async () => {
		const defaultSort = await getSetting(
			Settings.DEFAULTSORT,
			SettingType.OPTION
		).getValue();
		defaultCommentSort = sortOptions.find((o) => o.id === defaultSort)!;
		getComments(defaultCommentSort);
	});
</script>

{#if defaultCommentSort}
	<div>
		<div class="thread-header" class:hidden={!thread.info}>
			<div class="votes">
				<Votes bind:element={thread} disabled={!canVote} />
			</div>
			<div class="thread-info">
				<p class="thread-title">
					<a href={thread.link} class="plain-button" target="_blank"
						>{thread.plainTitle}</a
					>
					{#if thread.linkedTimestamp}
						<span> -- </span>
						<button class="plain-button" on:click={goToTimestamp}
							>{numberToHms(thread.linkedTimestamp)}</button
						>
					{/if}
				</p>
				<p class="thread-tagline">
					{@html taglineMessage}
				</p>
			</div>
		</div>
		{#if thread.info}
			<div class="comment-sorter">
				<span class="">{sortedByMessage}&nbsp;</span>
				<CustomSelect
					options={sortOptions}
					defaultOption={defaultCommentSort}
					callback={getComments}
				/>
			</div>
			{#if canPost}
				<TextBox
					bind:parentElement={thread}
					startingValue={undefined}
					active={true}
				/>
			{/if}
		{/if}
		<div>
			{#if thread.info}
				<CommentContainer
					bind:replies={thread.replies}
					username={thread.info.user.username}
					{canPost}
					{canVote}
					bind:commentSort={selectedSort.id}
				/>
			{:else}
				<h3 class="notice">
					{loadingMessage}
				</h3>
			{/if}
		</div>
	</div>
{/if}

<style lang="postcss">
	.thread-header {
		@apply flex gap-[7px] w-full mx-[5px] my-[10px] box-border;
	}

	.votes {
		@apply font-bold text-sm;
	}

	.thread-info {
		@apply flex flex-col;
	}

	.thread-title {
		@apply overflow-hidden text-[17px] mb-[3px];
	}

	.thread-tagline {
		@apply text-secondary text-[12.5px];
	}

	.comment-sorter {
		@apply flex items-center mx-[5px] [&_span]:text-xs [&_span]:text-secondary;
	}

	.notice {
		@apply text-center font-notice;
	}
</style>
