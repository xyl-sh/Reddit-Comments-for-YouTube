<script lang="ts">
	import { type CommentSort, Kind } from "@/utils/constants";
	import type { Replies, Thread } from "@/utils/types/Elements";
	import CommentComponent from "./CommentComponent.svelte";
	import MoreChildrenComponent from "./MoreChildrenComponent.svelte";

	interface CommentContainerProps {
		canPost: boolean;
		canVote: boolean;
		commentSort: CommentSort | undefined;
		replies: Replies;
		thread: Thread;
		username: string | undefined;
	}

	let {
		replies = $bindable(),
		commentSort = $bindable(),
		username,
		canPost,
		canVote,
		thread = $bindable(),
	}: CommentContainerProps = $props();
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
