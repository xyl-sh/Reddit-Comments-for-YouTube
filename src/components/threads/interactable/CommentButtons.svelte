<script lang="ts">
  import type { DeleteRequest } from "@/utils/types/NetworkRequests";
  import type { Reply } from "@/utils/types/Elements";
  import { sendMessage } from "@/utils/messaging";

  interface CommentButtonsProps {
    canPost: boolean;
    childrenHidden: boolean;
    comment: Reply;
    editing: boolean;
    isUser: boolean;
    replying: boolean;
    showHideChildren: boolean;
  }

  let {
    comment,
    canPost,
    isUser,
    showHideChildren,
    childrenHidden = $bindable(),
    replying = $bindable(),
    editing = $bindable(),
  }: CommentButtonsProps = $props();

  const permalinkLabel = i18n.t("commentButtons.permalink");
  const replyLabel = i18n.t("commentButtons.reply");
  const editLabel = i18n.t("commentButtons.edit");
  const confirmLabel = i18n.t("commentButtons.confirmDelete");
  const yesLabel = i18n.t("commentButtons.yes");
  const noLabel = i18n.t("commentButtons.no");
  const deleteLabel = i18n.t("commentButtons.delete");
  const deletedLabel = i18n.t("commentButtons.deleted");

  function deleteComment() {
    const deleteRequest: DeleteRequest = {
      id: comment.fullId,
      website: comment.website,
    };

    sendMessage("deleteComment", deleteRequest);

    deleted = true;
  }

  let deleting: boolean = $state(false);
  let deleted: boolean = $state(false);

  let childrenHiddenMessage = $derived(
    childrenHidden
      ? i18n.t("commentButtons.childComments.show")
      : i18n.t("commentButtons.childComments.hide"),
  );
</script>

<div class="comment-buttons">
  <a href={comment.link} target="_blank">{permalinkLabel} </a>
  {#if canPost}
    <button
      onclick={() => {
        replying = true;
      }}
      >{replyLabel}
    </button>
  {/if}
  {#if isUser}
    <button
      onclick={() => {
        editing = true;
      }}
      >{editLabel}
    </button>
    {#if deleted}
      <span>{deletedLabel} </span>
    {:else if deleting}
      <span class="deleting"
        >{confirmLabel} <button onclick={deleteComment}>{yesLabel} </button> /
        <button
          onclick={() => {
            deleting = false;
          }}
          >{noLabel}
        </button></span
      >
    {:else}
      <button onclick={() => (deleting = true)}>{deleteLabel} </button>
    {/if}
  {/if}
  {#if showHideChildren}
    <button onclick={() => (childrenHidden = !childrenHidden)}
      >{childrenHiddenMessage}
    </button>
  {/if}
</div>

<style lang="postcss">
  @reference "@/assets/css/threads.css";

  a,
  button {
    @apply plain-button;
  }

  .comment-buttons {
    @apply flex gap-[8px];

    * {
      @apply text-[10px] leading-[16px];
    }

    button,
    a {
      @apply text-secondary font-bold  hover:underline;
    }
  }

  .deleting {
    @apply text-[#CC0000];
  }
</style>
