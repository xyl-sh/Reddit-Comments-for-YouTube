<script lang="ts">
	import { RedditCommentSort, Website, Kind } from '@/lib/constants';
	import { sendMessage } from '@/lib/messaging';
	import type { Thread, MoreReplies, Replies } from '@/lib/types/Elements';
	import type { GetMoreChildrenRequest } from '@/lib/types/NetworkRequests';

	export let thread: Thread;
	export let moreChildren: MoreReplies;
	export let comments: Replies;
	export let sort: RedditCommentSort;

	let loading: boolean = false;

	$: moreChildren.count;

	const loadMoreMessage = browser.i18n.getMessage('loadMoreComments');
	const loadingMessage = browser.i18n.getMessage('loadingMoreComments');
	$: loadMoreCountMessage = browser.i18n.getMessage('moreCount', [
		moreChildren.count.toString(),
	]);

	async function getMoreChildren() {
		if (loading) {
			return;
		}

		loading = true;

		const getMoreChildrenRequest: GetMoreChildrenRequest = {
			moreChildren: moreChildren,
			sort: sort,
			page: thread.page + 1,
		};

		const response = await sendMessage(
			'getMoreChildren',
			getMoreChildrenRequest
		);

		if (!response.success) {
			return;
		}

		const data = response.value;

		if (moreChildren.website === Website.REDDIT) {
			comments = [...comments.filter((c) => c.kind === Kind.COMMENT), ...data];
		} else {
			if (moreChildren.parent === moreChildren.threadId) {
				thread.replies = [
					...thread.replies.filter((c) => c.kind === Kind.COMMENT),
					...data.filter(
						(c) => !thread.replies.find((p) => p.fullId === c.fullId)
					),
				];
				thread.page++;
			} else {
				comments = data;
			}
		}

		loading = false;
	}
</script>

<button on:click={getMoreChildren} class="load-more" class:loading>
	<span class="label">{loading ? loadingMessage : loadMoreMessage}</span>
	{#if !loading}
		<span>{loadMoreCountMessage}</span>
	{/if}
</button>

<style lang="postcss">
	.load-more {
		@apply plain-button text-subtle px-[4px] ml-[3px] inline-block text-[10px] overflow-hidden;

		&:hover:not(.loading) {
			@apply underline;
		}

		&.loading {
			@apply text-[#CC0000] cursor-default;
		}
	}

	.label {
		@apply font-bold;
	}
</style>
