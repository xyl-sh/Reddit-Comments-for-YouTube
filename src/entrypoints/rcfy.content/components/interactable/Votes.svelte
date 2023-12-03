<script lang="ts">
	import { Kind } from '@/lib/constants';
	import { sendMessage } from '@/lib/messaging';
	import type { VoteRequest } from '@/lib/types/NetworkRequests';
	import type { Reply, Thread } from '@/lib/types/Elements';
	import { getScore } from '@/lib/tools/StringTools';

	export let element: Thread | Reply;
	export let disabled: boolean;

	$: disabled;

	function vote(direction: 1 | -1) {
		if (disabled) return;
		element.userVote = direction === element.userVote ? 0 : direction;

		const voteRequest: VoteRequest = {
			kind: element.kind,
			website: element.website,
			id: element.fullId,
			vote: element.userVote,
		};

		sendMessage('vote', voteRequest);
	}

	let scoreTotal: number;
	let scoreString: string;
	$: scoreTotal = element.score + element.userVote;
	$: scoreString = getScore(scoreTotal, false);
</script>

<button
	on:click={() => vote(1)}
	class:upvote={element.userVote !== 1}
	class:upvoted={element.userVote === 1}
	{disabled}
></button>
{#if element.kind === Kind.THREAD}
	<span class="score">{scoreString}</span>
{/if}
<button
	on:click={() => vote(-1)}
	class:downvote={element.userVote !== -1}
	class:downvoted={element.userVote === -1}
	{disabled}
></button>

<style lang="postcss">
	button {
		@apply plain-button mt-[2px] mx-auto h-[14px] w-[15px] bg-arrows block;

		&.upvoted {
			@apply bg-left-top;
		}

		&.upvote {
			@apply bg-right-top;
		}

		&.downvoted {
			@apply bg-left-bottom;
		}

		&.downvote {
			@apply bg-right-bottom;
		}

		&:disabled {
			@apply invisible;
		}
	}

	.score {
		@apply block text-secondary text-center font-bold text-[13px];
	}
</style>
