<script lang="ts">
	import { Kind } from '@/lib/constants';
	import { sendMessage } from '@/lib/messaging';
	import type { CommentRequest } from '@/lib/types/NetworkRequests';
	import type { Reply, Thread } from '@/lib/types/Elements';

	export let parentElement: Reply | Thread;
	export let startingValue: string | undefined;
	export let active: boolean;

	const saveLabel = browser.i18n.getMessage('save');
	const cancelLabel = browser.i18n.getMessage('cancel');

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

		const response = await sendMessage('comment', commentRequest);

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
			textAreaValue = '';
		}
	}

	let errorNotice: string;
	let textAreaValue = startingValue ?? '';
</script>

<div class="textbox">
	<textarea bind:value={textAreaValue}></textarea>
	<div class="buttons">
		<button on:click={submit}>{saveLabel}</button>
		{#if parentElement.kind === Kind.COMMENT}
			<button
				on:click={() => {
					active = !active;
				}}>{cancelLabel}</button
			>
		{/if}
		{#if errorNotice}
			<span class="error">{errorNotice}</span>
		{/if}
	</div>
</div>

<style lang="postcss">
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
