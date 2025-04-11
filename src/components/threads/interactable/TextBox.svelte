<script lang="ts">
	import type { Reply, Thread } from "@/utils/types/Elements";
	import type { CommentRequest } from "@/utils/types/NetworkRequests";
	import { Kind } from "@/utils/constants";
	import { sendMessage } from "@/utils/messaging";

	interface TextBoxProps {
		active: boolean;
		parentElement: Reply | Thread;
		startingValue: string | undefined;
	}

	let {
		parentElement = $bindable(),
		startingValue,
		active = $bindable(),
	}: TextBoxProps = $props();

	const saveLabel = i18n.t("save");
	const cancelLabel = i18n.t("cancel");

	async function submit() {
		const commentRequest: CommentRequest = {
			website: parentElement.website,
			id: parentElement.fullId,
			text: textAreaValue,
			isEdit: !!startingValue,
			threadId:
				parentElement.kind === Kind.COMMENT
					? parentElement.thread
					: parentElement.fullId,
		};

		const response = await sendMessage("comment", commentRequest);

		if (!response.success) {
			errorNotice = response.errorMessage;
			return;
		}

		if (startingValue && parentElement.kind === Kind.COMMENT) {
			parentElement.body = response.value.body;
			parentElement.bodyHtml = response.value.bodyHtml;
			parentElement.editedTimestamp = response.value.editedTimestamp;
		} else {
			parentElement.replies.unshift(response.value);
			parentElement.replies = parentElement.replies;
			parentElement = parentElement;
		}

		if (parentElement.kind === Kind.COMMENT) {
			active = false;
		}

		if (startingValue === undefined) {
			textAreaValue = "";
		}
	}

	let errorNotice: string = $state("");

	let textAreaValue = $state(startingValue ?? "");
</script>

<div class="textbox">
	<textarea bind:value={textAreaValue}></textarea>
	<div class="buttons">
		<button onclick={submit}>{saveLabel} </button>
		{#if parentElement.kind === Kind.COMMENT}
			<button
				onclick={() => {
					active = !active;
				}}
				>{cancelLabel}
			</button>
		{/if}
		{#if errorNotice}
			<span class="error">{errorNotice} </span>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "@/assets/css/threads.css";

	.textbox {
		@apply flex flex-col gap-[5px];
	}

	textarea {
		@apply w-[500px] h-[100px] text-[14px] block text-primary bg-interactable border-interactable border-[1px] rounded-large;
	}

	.buttons {
		@apply flex gap-[5px] mb-[5px] items-center;
	}

	.error {
		@apply text-[#CC0000] text-xs;
	}

	button {
		@apply plain-button text-primary bg-interactable border-interactable border-solid border-[1px] rounded-small p-[3px];

		font-size: revert;
	}
</style>
