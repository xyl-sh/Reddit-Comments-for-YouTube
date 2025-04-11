<script lang="ts">
  import { type CommentSort, Kind, Website } from "@/utils/constants";
  import CustomSelect, {
    type SelectOption,
  } from "./interactable/CustomSelect.svelte";
  import type {
    MoreReplies,
    Replies,
    Thread,
    User,
  } from "@/utils/types/Elements";
  import { SettingType, Settings, getSetting } from "@/utils/settings";
  import {
    numberToHms,
    timestampToRelativeTime,
  } from "@/utils/tools/TimeTools";
  import { onDestroy, onMount } from "svelte";
  import CommentContainer from "./CommentContainer.svelte";
  import type { GetCommentsRequest } from "@/utils/types/NetworkRequests";
  import type { Site } from "@/utils/types/Site";
  import TextBox from "./interactable/TextBox.svelte";
  import Votes from "./interactable/Votes.svelte";
  import { sendMessage } from "@/utils/messaging";

  interface ThreadComponentProps {
    site: Site;
    thread: Thread;
  }

  let { thread = $bindable(), site }: ThreadComponentProps = $props();
  let hidden: boolean = $state(false);
  let user: User | undefined = $state();
  let isBanned: boolean = $state(false);
  let lastPage: number;

  async function getComments(o: SelectOption<CommentSort>) {
    if (selectedSort === o) {
      return;
    }

    hidden = true;
    selectedSort = o;
    thread.replies = [];
    thread.page = 1;
    const getCommentsRequest: GetCommentsRequest = {
      sort: selectedSort.id,
      thread: thread,
    };

    const response = await sendMessage("getComments", getCommentsRequest);
    if (!response.success) {
      return;
    }

    thread.replies = response.value.replies;
    user = response.value.user;
    isBanned = response.value.isBanned ?? false;
    hidden = false;
    hidden = hidden;
  }

  function goToTimestamp(timestamp: number | undefined) {
    if (!timestamp) return;
    window.scrollTo(0, 0);
    document.querySelector<HTMLVideoElement>(site.videoElement)!.currentTime =
      timestamp;
  }

  let sortOptions: SelectOption<CommentSort>[] = $state([]);
  switch (thread.website) {
    case Website.REDDIT:
      sortOptions = Object.values(RedditCommentSort).map<
        SelectOption<CommentSort>
      >((o) => {
        return {
          id: o,
          title: i18n.t(`redditCommentSortOptions.${o}`),
        };
      });
      break;
    case Website.LEMMY:
      sortOptions = Object.values(LemmyCommentSort).map<
        SelectOption<CommentSort>
      >((o) => {
        return {
          id: o,
          title: i18n.t(`lemmyCommentSortOptions.${o}`),
        };
      });
      break;
  }

  function calculateRemaining(replies: Replies) {
    if (!replies || thread.website !== Website.LEMMY) return;
    const childComments = thread.replies.reduce((previousValue, c) => {
      if (c.kind === Kind.MORE) return previousValue;
      return previousValue + (c.childCount + 1);
    }, 0);
    const remainingChildren = thread.comments - childComments;

    if (
      remainingChildren < 1 ||
      (remainingChildren === thread.remainingChildren &&
        lastPage === thread.page)
    ) {
      thread.remainingChildren = remainingChildren;
      return;
    }

    thread.remainingChildren = remainingChildren;
    lastPage = thread.page;

    const moreChildren: MoreReplies = {
      kind: Kind.MORE,
      id: "",
      fullId: "",
      parent: thread.id,
      threadId: thread.id,
      count: remainingChildren,
      children: [],
      page: thread.page,
      website: Website.LEMMY,
    };
    thread.replies.push(moreChildren);
    thread.replies = thread.replies;
  }

  const loadingMessage = i18n.t("loadingComments");
  const sortedByMessage = i18n.t("sortedBy");

  const submittedMessage = i18n.t("tagline.submitted");
  const byMessage = i18n.t("tagline.by");
  const toMessage = i18n.t("tagline.to");

  let defaultCommentSort: SelectOption<CommentSort> | undefined = $state();
  let selectedSort: SelectOption<CommentSort> | undefined = $state();

  let canPost = $derived(
    !(
      isBanned ||
      !user?.token ||
      user?.isSuspended ||
      thread?.locked ||
      thread?.archived
    ),
  );
  let canVote = $derived(
    !(!user?.token || user?.isSuspended || thread?.archived),
  );

  $effect(() => {
    calculateRemaining(thread?.replies);
  });

  onMount(async () => {
    document.addEventListener("timestampClicked", ((e: CustomEvent) => {
      goToTimestamp(e.detail!.time as number);
    }) as EventListener);

    let defaultSort: CommentSort;
    if (thread.website === Website.REDDIT) {
      defaultSort = (await getSetting(
        Settings.DEFAULTSORT,
        SettingType.OPTION,
      ).getValue()) as RedditCommentSort;
    } else {
      defaultSort = (await getSetting(
        Settings.DEFAULTSORTLEMMY,
        SettingType.OPTION,
      ).getValue()) as LemmyCommentSort;
    }

    defaultCommentSort = sortOptions.find(
      (o) => o.id.toLowerCase() === defaultSort.toLowerCase(),
    )!;

    getComments(defaultCommentSort);
  });

  onDestroy(() => {
    document.removeEventListener("timestampClicked", ((e: CustomEvent) => {
      goToTimestamp(e.detail!.time as number);
    }) as EventListener);
  });
</script>

{#if defaultCommentSort}
  <div class="thread-container">
    <div class="thread-header" class:loading={hidden}>
      <div class="votes">
        <Votes bind:element={thread} disabled={!canVote} />
      </div>
      <div class="thread-info">
        <p class="thread-title">
          <a href={thread.link} target="_blank">{thread.plainTitle} </a>
          {#if thread.linkedTimestamp}
            <span> -- </span>
            <button onclick={() => goToTimestamp(thread.linkedTimestamp)}
              >{numberToHms(thread.linkedTimestamp)}
            </button>
          {/if}
        </p>
        <p class="thread-tagline">
          {submittedMessage}
          {timestampToRelativeTime(thread.createdTimestamp)}
          {byMessage}
          <a href={thread.authorLink} target="_blank">{thread.author} </a>
          {toMessage}
          <a href={thread.communityLink} target="_blank">{thread.community} </a>
        </p>
      </div>
    </div>
    {#if !hidden}
      <div class="comment-sorter">
        <span
          >{sortedByMessage}

          &nbsp;</span
        >
        <CustomSelect
          options={sortOptions}
          selectedOption={selectedSort}
          callback={getComments}
        />
      </div>
    {/if}
    {#if canPost && !hidden}
      <TextBox
        bind:parentElement={thread}
        startingValue={undefined}
        active={true}
      />
    {/if}

    <div>
      {#if hidden === false && selectedSort}
        <CommentContainer
          bind:replies={thread.replies}
          username={user?.username}
          {canPost}
          {canVote}
          bind:commentSort={selectedSort.id}
          bind:thread
        />
      {:else}
        <span class="notice">
          {loadingMessage}
        </span>
      {/if}
    </div>
  </div>
{/if}

<style lang="postcss">
  @reference "@/assets/css/threads.css";

  .thread-container {
    @apply flex flex-col mx-[5px] my-[10px] gap-[10px];
  }

  .thread-header {
    @apply flex gap-[7px] w-full box-border;

    &.loading {
      @apply hidden;
    }

    .votes {
      @apply font-bold w-[6.1ex] flex-shrink-0;
    }

    a,
    button {
      @apply plain-button;
    }

    .thread-info {
      @apply flex flex-col;
    }

    .thread-title {
      @apply overflow-hidden text-link text-[17px] mb-[3px];
    }

    .thread-tagline {
      @apply text-secondary text-[12.5px];

      a {
        @apply text-link;

        &:hover {
          @apply underline;
        }
      }
    }
  }

  .comment-sorter {
    @apply flex items-center;

    span {
      @apply text-secondary text-[12px];
    }
  }

  .notice {
    @apply text-center font-notice w-full inline-block text-standard;
  }
</style>
