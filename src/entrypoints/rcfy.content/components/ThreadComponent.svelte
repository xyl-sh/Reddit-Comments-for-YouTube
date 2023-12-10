<script lang="ts">
	import {
		RedditCommentSort,
		LemmyCommentSort,
		Kind,
		Website,
	} from '@/lib/constants';
	import { sendMessage } from '@/lib/messaging';
	import { getSetting, Settings, SettingType } from '@/lib/settings';
	import { timestampToRelativeTime, numberToHms } from '@/lib/tools/TimeTools';
	import type {
		Thread,
		User,
		MoreReplies,
		Replies,
	} from '@/lib/types/Elements';
	import type { GetCommentsRequest } from '@/lib/types/NetworkRequests';
	import { onDestroy, onMount } from 'svelte';
	import { siteStore } from '../store';
	import CommentContainer from './CommentContainer.svelte';
	import CustomSelect, {
		type SelectOption,
	} from './interactable/CustomSelect.svelte';
	import TextBox from './interactable/TextBox.svelte';
	import Votes from './interactable/Votes.svelte';

	export let thread: Thread;

	let hidden: boolean;
	let user: User | undefined;
	let isBanned: boolean | undefined;
	let errorMessage: string;
	let lastPage: number;

	async function getComments(o: SelectOption) {
		if (selectedSort === o) {
			return;
		}
		hidden = true;
		selectedSort = o;
		thread.replies = [];
		thread.page = 1;
		const getCommentsRequest: GetCommentsRequest = {
			thread: thread,
			sort: selectedSort.id,
		};

		const response = await sendMessage('getComments', getCommentsRequest);
		if (!response.success) {
			errorMessage = response.errorMessage;
			return;
		}

		thread.replies = response.value.replies;
		user = response.value.user;
		isBanned = response.value.isBanned;
		hidden = false;
		hidden = hidden;
	}

	function goToTimestamp(timestamp: number | undefined) {
		if (!timestamp) return;
		window.scrollTo(0, 0);
		document.querySelector<HTMLVideoElement>(
			$siteStore.videoElement
		)!.currentTime = timestamp;
	}
	const sortOptions = Object.values(
		thread.website === Website.REDDIT ? RedditCommentSort : LemmyCommentSort
	).map<SelectOption>((o) => {
		return {
			id: o,
			title: browser.i18n.getMessage(o.toLowerCase() as any),
		};
	});

	function calculateRemaining(replies: Replies) {
		if (!replies || thread.website !== Website.LEMMY) return;
		const childComments = thread.replies.reduce((previousValue, c) => {
			if (c.kind === Kind.MORE) return previousValue;
			return previousValue + (c.childCount + 1);
		}, 0);
		const remainingChildren = thread.comments - childComments;

		if (
			remainingChildren < 1 ||
			(remainingChildren === thread.remainingChildren &&
				lastPage === thread.page)
		) {
			thread.remainingChildren = remainingChildren;
			return;
		}

		thread.remainingChildren = remainingChildren;
		lastPage = thread.page;

		const moreChildren: MoreReplies = {
			kind: Kind.MORE,
			id: '',
			fullId: '',
			parent: thread.id,
			threadId: thread.id,
			count: remainingChildren,
			children: [],
			page: thread.page,
			website: Website.LEMMY,
		};
		thread.replies.push(moreChildren);
		thread.replies = thread.replies;
	}

	const loadingMessage = browser.i18n.getMessage('loadingComments');
	const sortedByMessage = browser.i18n.getMessage('sortedBy');

	const submittedMessage = browser.i18n.getMessage('submitted');
	const byMessage = browser.i18n.getMessage('by');
	const toMessage = browser.i18n.getMessage('to');

	let defaultCommentSort: SelectOption;
	let selectedSort: SelectOption;
	$: selectedSort;

	$: canPost = !(
		isBanned ||
		!user?.token ||
		user?.isSuspended ||
		thread?.locked ||
		thread?.archived
	);
	$: canVote = !(!user?.token || user?.isSuspended || thread?.archived);

	let commentRepliesLength: number;
	$: commentRepliesLength = thread?.replies?.filter(
		(c) => c.kind === Kind.COMMENT
	).length;
	$: calculateRemaining(thread?.replies);

	onMount(async () => {
		document.addEventListener('timestampClicked', ((e: CustomEvent) => {
			goToTimestamp(e.detail!.time as number);
		}) as EventListener);

		let defaultSort: RedditCommentSort | LemmyCommentSort;
		if (thread.website === Website.REDDIT) {
			defaultSort = (await getSetting(
				Settings.DEFAULTSORT,
				SettingType.OPTION
			).getValue()) as RedditCommentSort;
		} else {
			defaultSort = (await getSetting(
				Settings.DEFAULTSORTLEMMY,
				SettingType.OPTION
			).getValue()) as LemmyCommentSort;
		}

		defaultCommentSort = sortOptions.find(
			(o) => o.id.toLowerCase() === defaultSort.toLowerCase()
		)!;

		getComments(defaultCommentSort);
	});

	onDestroy(() => {
		document.removeEventListener('timestampClicked', ((e: CustomEvent) => {
			goToTimestamp(e.detail!.time as number);
		}) as EventListener);
	});
</script>

{#if defaultCommentSort}
	<div class="thread-container">
		<div class="thread-header" class:loading={hidden}>
			<div class="votes">
				<Votes bind:element={thread} disabled={!canVote} />
			</div>
			<div class="thread-info">
				<p class="thread-title">
					<a href={thread.link} target="_blank">{thread.plainTitle}</a>
					{#if thread.linkedTimestamp}
						<span> -- </span>
						<button on:click={() => goToTimestamp(thread.linkedTimestamp)}
							>{numberToHms(thread.linkedTimestamp)}</button
						>
					{/if}
				</p>
				<p class="thread-tagline">
					{submittedMessage}
					{timestampToRelativeTime(thread.createdTimestamp)}
					{byMessage}
					<a href={thread.authorLink} target="_blank">{thread.author}</a>
					{toMessage}
					<a href={thread.communityLink} target="_blank">{thread.community}</a>
				</p>
			</div>
		</div>
		{#if !hidden}
			<div class="comment-sorter">
				<span>{sortedByMessage}&nbsp;</span>
				<CustomSelect
					options={sortOptions}
					selectedOption={selectedSort}
					callback={getComments}
				/>
			</div>
		{/if}
		{#if canPost && !hidden}
			<TextBox
				bind:parentElement={thread}
				startingValue={undefined}
				active={true}
			/>
		{/if}
		<div>
			{#if hidden === false}
				<CommentContainer
					bind:replies={thread.replies}
					username={user?.username}
					{canPost}
					{canVote}
					bind:commentSort={selectedSort.id}
					bind:thread
				/>
			{:else}
				<span class="notice">
					{loadingMessage}
				</span>
			{/if}
		</div>
	</div>
{/if}

<style lang="postcss">
	.thread-container {
		@apply flex flex-col mx-[5px] my-[10px] gap-[10px];
	}

	.thread-header {
		@apply flex gap-[7px] w-full box-border;

		&.loading {
			@apply hidden;
		}

		.votes {
			@apply font-bold w-[6.1ex] flex-shrink-0;
		}

		a,
		button {
			@apply plain-button;
		}

		.thread-info {
			@apply flex flex-col;
		}

		.thread-title {
			@apply overflow-hidden text-link text-[17px] mb-[3px];
		}

		.thread-tagline {
			@apply text-secondary text-[12.5px];

			a {
				@apply text-link;

				&:hover {
					@apply underline;
				}
			}
		}
	}

	.comment-sorter {
		@apply flex items-center;

		span {
			@apply text-secondary text-[12px];
		}
	}

	.notice {
		@apply text-center font-notice w-full inline-block text-standard;
	}
</style>
