<script lang="ts">
	import { Interactions } from '@/lib/constants';
	import { sendMessage } from '@/lib/messaging';
	import { type DeleteRequest } from '@/lib/types/NetworkRequests';

	export let id: string;
	export let link: string;
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
			interaction: Interactions.DELETE,
			formData: {
				id: id,
			},
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
	<a href={link} target="_blank">{permalinkLabel}</a>
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
	.comment-buttons {
		@apply flex gap-[8px] [&>*]:plain-button [&>*]:text-secondary [&>*]:font-bold [&_*]:text-[10px] [&_*]:leading-4;
	}

	.comment-buttons > * {
		@apply hover:underline;
	}

	.deleting {
		@apply text-[#CC0000];
	}
</style>
