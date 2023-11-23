<script lang="ts">
	import type { Comment, MoreChildren } from '@/lib/types/RedditElements';
	import CommentComponent from './CommentComponent.svelte';
	import MoreChildrenComponent from './MoreChildrenComponent.svelte';
	import { CommentSort, Kind } from '@/lib/constants';

	export let replies: (Comment | MoreChildren)[];
	export let commentSort: CommentSort;
	export let username: string | undefined;
	export let canPost: boolean;
	export let canVote: boolean;
</script>

{#each replies as reply (reply.fullId)}
	{#if reply.kind === Kind.COMMENT}
		<CommentComponent
			comment="{reply}"
			username="{username}"
			canPost="{canPost}"
			canVote="{canVote}"
			bind:sort="{commentSort}"
		/>
	{:else}
		<MoreChildrenComponent moreChildren="{reply}" bind:sort="{commentSort}" bind:comments="{replies}" />
	{/if}
{/each}
