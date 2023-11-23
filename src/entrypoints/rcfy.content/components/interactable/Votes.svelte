<script lang="ts">
	import { Interactions, Kind } from '@/lib/constants';
	import { sendMessage } from '@/lib/messaging';
	import type { VoteRequest } from '@/lib/types/NetworkRequests';
	import type { Comment, Thread } from '@/lib/types/RedditElements';

	export let element: Thread | Comment;
	export let disabled: boolean;

	function vote(direction: 1 | -1) {
		if (disabled) return;
		element.userVote = direction === element.userVote ? 0 : direction;

		const voteRequest: VoteRequest = {
			interaction: Interactions.VOTE,
			formData: {
				id: element.fullId,
				dir: element.userVote,
				rank: 2,
			},
		};

		sendMessage('vote', voteRequest);
	}
</script>

<button
	on:click={() => vote(1)}
	class:upvote={element.userVote !== 1}
	class:upvoted={element.userVote === 1}
	class:votes-disabled={disabled}
></button>
{#if element.kind === Kind.THREAD}
	<span class="score">{element.score + element.userVote}</span>
{/if}
<button
	on:click={() => vote(-1)}
	class:downvote={element.userVote !== -1}
	class:downvoted={element.userVote === -1}
	class:votes-disabled={disabled}
></button>

<style lang="postcss">
	.upvoted {
		@apply bg-left-top;
	}

	.upvote {
		@apply bg-right-top;
	}

	.downvoted {
		@apply bg-left-bottom;
	}

	.downvote {
		@apply bg-right-bottom;
	}

	button {
		@apply mt-0.5 mx-auto h-[14px] w-[15px] bg-arrows block;
	}

	.votes-disabled {
		@apply invisible;
	}

	.score {
		@apply block text-secondary text-center font-bold text-[13px];
	}
</style>
