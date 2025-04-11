<script lang="ts">
  /* eslint svelte/no-at-html-tags: "off" */
  import { type CommentSort, Kind } from "@/utils/constants";
  import type { Reply, Thread } from "@/utils/types/Elements";
  import { SettingType, Settings, getSetting } from "@/utils/settings";
  import CommentButtons from "./interactable/CommentButtons.svelte";
  import CommentContainer from "./CommentContainer.svelte";
  import CommentTagline from "./interactable/CommentTagline.svelte";
  import TextBox from "./interactable/TextBox.svelte";
  import Votes from "./interactable/Votes.svelte";
  import { onMount } from "svelte";

  interface CommentComponentProps {
    canPost: boolean;
    canVote: boolean;
    comment: Reply;
    sort: CommentSort | undefined;
    thread: Thread;
    username: string | undefined;
  }

  let {
    comment = $bindable(),
    thread = $bindable(),
    sort = $bindable(),
    username,
    canPost,
    canVote,
  }: CommentComponentProps = $props();

  let replying: boolean = $state(false);
  let childrenHidden: boolean = $state(false);
  let collapsed: boolean = $state(false);
  let editing: boolean = $state(false);

  onMount(async () => {
    childrenHidden =
      (comment.parent.startsWith(Kind.THREAD) &&
        (await getSetting(
          Settings.CHILDRENHIDDENDEFAULT,
          SettingType.BOOLEAN,
        ).getValue())) ||
      false;
  });
</script>

<div class="comment-container">
  <div class="votes" class:collapsed>
    <Votes bind:element={comment} disabled={!canVote || collapsed} />
  </div>
  <div class="comment" class:collapsed>
    <CommentTagline bind:comment bind:collapsed />
    {#if !collapsed}
      {#if editing}
        <TextBox
          bind:parentElement={comment}
          startingValue={comment.body}
          active={editing}
        />
      {:else}
        <div class="reddit-comment">
          {@html comment.bodyHtml}
        </div>
      {/if}

      <CommentButtons
        {comment}
        canPost={canPost && !comment.locked}
        isUser={comment.authorLink === username}
        showHideChildren={!!comment.replies.find(
          (c) => c.kind === Kind.COMMENT,
        )}
        bind:childrenHidden
        bind:replying
        bind:editing
      />
    {/if}
  </div>

  <div class="children">
    {#if !isNaN(Number(comment?.replies?.length))}
      {#if replying && !collapsed}
        <TextBox
          bind:parentElement={comment}
          startingValue={undefined}
          active={replying}
        />
      {/if}
      <div class:children-hidden={childrenHidden || collapsed}>
        <CommentContainer
          bind:replies={comment.replies}
          bind:thread
          {username}
          {canPost}
          {canVote}
          bind:commentSort={sort}
        />
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  @reference "@/assets/css/threads.css";

  .children-hidden,
  .collapsed *:not(.rcfy-tagline) {
    @apply hidden;
  }

  .votes {
    @apply float-left mr-[7px];

    &.collapsed {
      @apply h-[1px];
    }
  }

  .comment {
    @apply ml-[3px] overflow-hidden;
  }

  .children {
    @apply my-[10px] ml-[15px] border-l-separator border-dotted border-0 border-l-[1px];

    :global(.comment-container) {
      @apply ml-[10px];
    }
  }

  /* wrapped in global to avoid Svelte removing unused classes */
  .reddit-comment {
    @apply text-[14px] text-primary;

    :global(*) {
      @apply my-[5px] break-words;
    }

    :global(p > img) {
      @apply my-0;
    }

    :global(a),
    :global(button) {
      @apply plain-button;

      &:not([onclick*="spoiler"]) {
        @apply text-link;
      }
    }

    :global(.reddit-spoiler) {
      :global(&:not(.show-spoiler)) {
        :global(> button > span) {
          @apply bg-[var(--subtle-link-text)] text-transparent;
        }

        :global(> span) {
          @apply hidden;
        }
      }

      :global(&.show-spoiler > button) {
        @apply hidden;
      }
    }

    :global(blockquote) {
      @apply text-secondary px-2 ml-[5px] border-0 border-l-2 border-l-separator border-solid;
    }

    :global(pre) {
      @apply bg-interactable border-interactable rounded-sm py-1 px-[9px];
    }

    :global(ol),
    :global(ul) {
      @apply pl-10;
    }

    :global(table) {
      @apply border-collapse;
    }

    :global(th),
    :global(td) {
      @apply p-[5px] border-[1px] border-blockquote;
    }

    :global(code) {
      @apply mx-0.5 break-normal leading-5 w-full inline-block overflow-x-auto;
    }
  }
</style>
