<script lang="ts">
	import { Interactions, Kind } from '@/lib/constants';
	import { sendMessage } from '@/lib/messaging';
	import type { CommentRequest } from '@/lib/types/NetworkRequests';
	import type { Comment, Thread } from '@/lib/types/RedditElements';

	export let parentElement: Comment | Thread;
	export let startingValue: string | undefined;
	export let active: boolean;

	const saveLabel = browser.i18n.getMessage('save');
	const cancelLabel = browser.i18n.getMessage('cancel');

	async function submit() {
		const commentRequest: CommentRequest = {
			interaction:
				startingValue === undefined ? Interactions.COMMENT : Interactions.EDIT,
			formData: {
				thing_id: parentElement.fullId,
				text: textAreaValue,
			},
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
		@apply flex flex-col gap-[5px] m-[5px];
	}

	textarea {
		@apply w-[500px] h-[100px] text-sm block text-primary bg-interactable border-interactable border-[1px] rounded-large;
	}

	.buttons {
		@apply flex gap-[5px] mb-[5px] items-center;
	}

	.error {
		@apply text-red-600 text-xs;
	}

	button {
		@apply text-primary bg-interactable border-interactable border-[1px] rounded-small p-[3px];
		font-size: revert;
	}
</style>
