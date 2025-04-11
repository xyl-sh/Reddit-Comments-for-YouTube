<script lang="ts">
  import type { Reply, Thread } from "@/utils/types/Elements";
  import { Kind } from "@/utils/constants";
  import type { VoteRequest } from "@/utils/types/NetworkRequests";
  import { getScore } from "@/utils/tools/StringTools";
  import { sendMessage } from "@/utils/messaging";

  interface VotesProps {
    disabled: boolean;
    element: Thread | Reply;
  }

  let { element = $bindable(), disabled }: VotesProps = $props();

  function vote(direction: 1 | -1) {
    if (disabled) return;
    element.userVote = direction === element.userVote ? 0 : direction;

    const voteRequest: VoteRequest = {
      kind: element.kind,
      website: element.website,
      id: element.fullId,
      vote: element.userVote,
    };

    sendMessage("vote", voteRequest);
  }

  let scoreTotal: number = $derived(element.score + element.userVote);
  let scoreString: string = $derived(getScore(scoreTotal, false));
</script>

<button
  onclick={() => vote(1)}
  class:upvote={element.userVote !== 1}
  class:upvoted={element.userVote === 1}
  {disabled}
  aria-label={i18n.t("upvote")}
></button>
{#if element.kind === Kind.THREAD}
  <span class="score">{scoreString} </span>
{/if}

<button
  onclick={() => vote(-1)}
  class:downvote={element.userVote !== -1}
  class:downvoted={element.userVote === -1}
  {disabled}
  aria-label={i18n.t("downvote")}
></button>

<style lang="postcss">
  @reference "@/assets/css/threads.css";

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
