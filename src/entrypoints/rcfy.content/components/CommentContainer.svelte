<script lang="ts">
	import type { Replies, Thread } from '@/lib/types/Elements';
	import CommentComponent from './CommentComponent.svelte';
	import MoreChildrenComponent from './MoreChildrenComponent.svelte';
	import { RedditCommentSort, Kind } from '@/lib/constants';

	export let replies: Replies;
	export let commentSort: RedditCommentSort;
	export let username: string | undefined;
	export let canPost: boolean;
	export let canVote: boolean;
	export let thread: Thread;
</script>

{#each replies as reply (reply.fullId)}
	{#if reply.kind === Kind.COMMENT}
		<CommentComponent
			comment={reply}
			bind:thread
			{username}
			{canPost}
			{canVote}
			bind:sort={commentSort}
		/>
	{:else}
		<MoreChildrenComponent
			moreChildren={reply}
			bind:sort={commentSort}
			bind:comments={replies}
			bind:thread
		/>
	{/if}
{/each}
