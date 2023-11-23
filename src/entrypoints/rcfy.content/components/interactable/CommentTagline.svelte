<script lang="ts">
	import { REDDIT_LINK_DOMAIN } from '@/lib/constants';
	import { timestampToRelativeTime } from '@/lib/tools/TimeTools';
	import type { Comment } from '@/lib/types/RedditElements';

	export let comment: Comment;
	export let collapsed: boolean;

	const stickiedCommentMessage = browser.i18n.getMessage('stickiedComment');

	$: score = comment.score + comment.userVote;
	$: scoreMessage = comment.scoreHidden
		? browser.i18n.getMessage('commentScoreHidden')
		: Math.abs(score) === 1
		  ? browser.i18n.getMessage('commentPoint', score.toString())
		  : browser.i18n.getMessage('commentPoints', score.toString());

	const editedTimestamp = comment.editedTimestamp
		? browser.i18n.getMessage('commentEdited', [
				timestampToRelativeTime(comment.editedTimestamp),
		  ])
		: null;

	const distinguishedColor =
		comment.distinguishedPoster === 'op'
			? '#0055DF'
			: comment.distinguishedPoster === 'moderator'
			  ? '#228822'
			  : comment.distinguishedPoster === 'admin'
			    ? '#FF0011'
			    : 'none';
</script>

<p class:collapsed>
	<button
		class:plain-button-link={!collapsed}
		class:plain-button={collapsed}
		on:click={() => (collapsed = !collapsed)}
		>{collapsed ? '[＋]' : '[－]'}</button
	>
	{#if comment.author === '[deleted]'}
		<span class="deleted"><em>[deleted]</em></span>
	{:else}
		<a
			class="author"
			style="background: {distinguishedColor}"
			href="{REDDIT_LINK_DOMAIN}/user/{comment.author}"
			target="_blank"
			class:distinguished={comment.distinguishedPoster}>{comment.author}</a
		>
	{/if}
	<span class="score">{scoreMessage}</span>
	{#if comment.controversial}
		<sup class="controversial">†</sup>
	{/if}
	<span>{timestampToRelativeTime(comment.createdTimestamp)}</span>
	{#if comment.editedTimestamp}
		<span title={editedTimestamp}>*</span>
	{/if}
	{#if comment.locked}
		<span>🔒</span>
	{/if}
	{#if comment.stickied}
		<span>{stickiedCommentMessage}</span>
	{/if}
</p>

<style lang="postcss">
	p {
		@apply text-secondary text-[11px];
	}

	button {
	}

	.deleted {
		@apply mr-[5px];
	}

	.author {
		@apply text-link font-bold mr-[5px];
	}

	.score {
		@apply text-primary;
	}

	.controversial {
		@apply text-[#CC0000];
	}

	.distinguished {
		@apply font-bold text-white p-0.5 rounded-sm;
	}

	.collapsed *:not(button) {
		@apply text-secondary italic;
	}
</style>
