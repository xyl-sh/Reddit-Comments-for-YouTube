<script lang="ts">
	import { CommentSort, Kind } from '@/lib/constants';
	import { sendMessage } from '@/lib/messaging';
	import type { Comment, MoreChildren } from '@/lib/types/RedditElements';
	import type { GetMoreChildrenRequest } from '@/lib/types/NetworkRequests';

	export let moreChildren: MoreChildren;
	export let comments: (Comment | MoreChildren)[];
	export let sort: CommentSort;

	const loadMoreMessage = browser.i18n.getMessage('loadMoreComments');
	const loadMoreCountMessage = browser.i18n.getMessage('moreCount', [
		moreChildren.count.toString(),
	]);

	async function getMoreChildren() {
		const getMoreChildrenRequest: GetMoreChildrenRequest = {
			parent: moreChildren.parent,
			link_id: moreChildren.threadId,
			sort: sort,
			children: moreChildren.children.join(','),
			id: moreChildren.fullId,
		};

		const response = await sendMessage(
			'getMoreChildren',
			getMoreChildrenRequest
		);

		comments = [
			...comments.filter((c) => c.kind === Kind.COMMENT),
			...response,
		];
	}
</script>

<button on:click={getMoreChildren} class="load-more">
	<span class="label">{loadMoreMessage}</span>
	<span>{loadMoreCountMessage}</span>
</button>

<style lang="postcss">
	.load-more {
		@apply plain-button text-subtle leading-4 py-1 inline-block text-[10px];
	}

	.label {
		@apply font-bold;
	}
</style>
