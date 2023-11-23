<script lang="ts">
	import { REDDIT_LINK_DOMAIN, Kind, CommentSort } from '@/lib/constants';
	import type { Comment } from '@/lib/types/RedditElements';
	import CommentContainer from './CommentContainer.svelte';
	import Votes from './interactable/Votes.svelte';
	import CommentButtons from './interactable/CommentButtons.svelte';
	import CommentTagline from './interactable/CommentTagline.svelte';
	import { onMount } from 'svelte';
	import TextBox from './interactable/TextBox.svelte';
	import { SettingType, Settings, getSetting } from '@/lib/settings';

	export let comment: Comment;
	export let sort: CommentSort;
	export let username: string | undefined;
	export let canPost: boolean;
	export let canVote: boolean;

	function fillContainer(commentElement: HTMLElement, bodyHtml: string) {
		if (!commentElement) return;
		commentElement.innerHTML = bodyHtml;
		commentElement.querySelectorAll<HTMLAnchorElement>('a')!.forEach((e) => {
			const href = e.getAttribute('href');
			if (href?.startsWith('/')) {
				e.href = `${REDDIT_LINK_DOMAIN}${href}`;
			}
			e.target = '_blank';
		});
	}

	let commentElement: HTMLElement;
	let childrenHidden: boolean;
	let collapsed: boolean = false;
	let editing: boolean = false;
	let replying: boolean = false;

	$: fillContainer(commentElement, comment.bodyHtml);

	onMount(async () => {
		childrenHidden =
			(comment.parent.startsWith(Kind.THREAD) &&
				(await getSetting(
					Settings.CHILDRENHIDDENDEFAULT,
					SettingType.BOOLEAN
				).getValue())) ||
			false;
	});
</script>

<div>
	<div class="votes" class:h-[1px]={collapsed}>
		<Votes bind:element={comment} disabled={!canVote || collapsed} />
	</div>
	<div class="comment" class:collapsed>
		<CommentTagline bind:comment bind:collapsed />
		{#if !collapsed}
			{#if editing}
				<TextBox
					bind:parentElement={comment}
					startingValue={comment.body}
					bind:active={editing}
				/>
			{:else}
				<div class="reddit-comment" bind:this={commentElement}></div>
			{/if}
			<CommentButtons
				id={comment.fullId}
				link={comment.link}
				canPost={canPost && !comment.locked}
				isUser={comment.author === username}
				showHideChildren={!!comment.replies.find(
					(c) => c.kind === Kind.COMMENT
				)}
				bind:childrenHidden
				bind:replying
				bind:editing
			/>
		{/if}
	</div>
</div>
<div class="children">
	{#if !isNaN(Number(comment?.replies?.length))}
		{#if replying && !collapsed}
			<TextBox
				bind:parentElement={comment}
				startingValue={undefined}
				bind:active={replying}
			/>
		{/if}
		<div class:children-hidden={childrenHidden || collapsed}>
			<CommentContainer
				bind:replies={comment.replies}
				{username}
				{canPost}
				{canVote}
				bind:commentSort={sort}
			/>
		</div>
	{/if}
</div>

<style lang="postcss">
	.children-hidden,
	.collapsed *:not(.rcfy-tagline) {
		@apply hidden;
	}

	.votes {
		@apply float-left mr-[7px];
	}

	.comment {
		@apply ml-[3px] overflow-hidden;
	}

	.children {
		@apply my-[10px] ml-[15px] border-l-separator border-dotted;
	}

	.reddit-comment {
		@apply text-[14px] text-primary [&_*]:my-[5px] [&_blockquote]:text-secondary;
	}

	.reddit-comment a {
		@apply text-link;
	}

	.reddit-comment blockquote {
		@apply text-secondary px-2 ml-[5px] border-l-2 border-l-separator;
	}

	.reddit-comment pre {
		@apply bg-interactable border-interactable rounded-sm py-1 px-[9px];
	}

	.reddit-comment ol,
	.reddit-comment ul {
		@apply list-decimal pl-10;
	}

	.reddit-comment table {
		@apply border-collapse;
	}

	.reddit-comment th,
	.reddit-comment td {
		@apply p-[5px] border-[1px] border-blockquote;
	}

	.reddit-comment code {
		@apply mx-0.5 break-normal leading-5;
	}
</style>
