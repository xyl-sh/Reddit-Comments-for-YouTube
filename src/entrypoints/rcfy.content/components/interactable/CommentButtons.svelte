<script lang="ts">
	import { sendMessage } from '@/lib/messaging';
	import type { DeleteRequest } from '@/lib/types/NetworkRequests';
	import type { Reply } from '@/lib/types/Elements';

	export let comment: Reply;
	export let canPost: boolean;
	export let isUser: boolean;
	export let showHideChildren: boolean;
	export let childrenHidden: boolean;
	export let replying: boolean;
	export let editing: boolean;

	const permalinkLabel = browser.i18n.getMessage('permalink');
	const replyLabel = browser.i18n.getMessage('reply');
	const editLabel = browser.i18n.getMessage('edit');
	const confirmLabel = browser.i18n.getMessage('confirmDelete');
	const yesLabel = browser.i18n.getMessage('yes');
	const noLabel = browser.i18n.getMessage('no');
	const deleteLabel = browser.i18n.getMessage('delete');
	const deletedLabel = browser.i18n.getMessage('deleted');

	function deleteComment() {
		const deleteRequest: DeleteRequest = {
			website: comment.website,
			id: comment.fullId,
		};

		sendMessage('deleteComment', deleteRequest);

		deleted = true;
	}

	let deleting: boolean = false;
	let deleted: boolean = false;

	$: childrenHiddenMessage = childrenHidden
		? browser.i18n.getMessage('showChildComments')
		: browser.i18n.getMessage('hideChildComments');
</script>

<div class="comment-buttons">
	<a href={comment.link} target="_blank">{permalinkLabel}</a>
	{#if canPost}
		<button
			on:click={() => {
				replying = true;
			}}>{replyLabel}</button
		>
	{/if}
	{#if isUser}
		<button
			on:click={() => {
				editing = true;
			}}>{editLabel}</button
		>
		{#if deleted}
			<span>{deletedLabel}</span>
		{:else if deleting}
			<span class="deleting"
				>{confirmLabel} <button on:click={deleteComment}>{yesLabel}</button> /
				<button
					on:click={() => {
						deleting = false;
					}}>{noLabel}</button
				></span
			>
		{:else}
			<button on:click={() => (deleting = true)}>{deleteLabel}</button>
		{/if}
	{/if}
	{#if showHideChildren}
		<button on:click={() => (childrenHidden = !childrenHidden)}
			>{childrenHiddenMessage}</button
		>
	{/if}
</div>

<style lang="postcss">
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
