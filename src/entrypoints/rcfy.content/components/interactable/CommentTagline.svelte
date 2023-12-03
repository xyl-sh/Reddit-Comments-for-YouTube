<script lang="ts">
	import { REDDIT_LINK_DOMAIN } from '@/lib/constants';
	import { getScore } from '@/lib/tools/StringTools';
	import { timestampToRelativeTime } from '@/lib/tools/TimeTools';
	import type { Reply } from '@/lib/types/Elements';

	export let comment: Reply;
	export let collapsed: boolean;

	const stickiedCommentMessage = browser.i18n.getMessage('stickiedComment');

	$: score = comment.score + comment.userVote;
	$: scoreMessage = comment.scoreHidden
		? browser.i18n.getMessage('commentScoreHidden')
		: getScore(score, true);

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
	<button on:click={() => (collapsed = !collapsed)}
		>{collapsed ? '[＋]' : '[－]'}</button
	>
	{#if comment.author === '[deleted]'}
		<span class="deleted"><em>[deleted]</em></span>
	{:else}
		<a
			class="author"
			style="background: {distinguishedColor}"
			href={comment.authorLink}
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

	a,
	button {
		@apply plain-button;
	}

	button {
		:not(.collapsed) > & {
			@apply text-link;
		}

		.collapsed & {
			@apply text-secondary;
		}
	}

	.deleted {
		@apply mr-[5px];
	}

	.author {
		@apply text-link font-bold mr-[5px];

		&:hover {
			@apply underline;
		}
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

	.collapsed {
		*:not(button):not(.distinguished) {
			@apply text-secondary;
		}

		*:not(button) {
			@apply italic;
		}
	}
</style>
