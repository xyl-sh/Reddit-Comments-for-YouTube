<script lang="ts">
	import { type ArraySetting } from '@/lib/settings';
	import { onMount } from 'svelte';
	import String from './String.svelte';
	export let setting: ArraySetting<any>;
	let values: string[] = [];
	let value: string;
	let errorMessage: string;

	const addLabel = browser.i18n.getMessage('addButton');

	async function onAdd() {
		const add = await setting.addValue(value);
		if (typeof add === 'string') {
			errorMessage = add;
			return;
		}

		values = add;
		value = '';
	}

	async function onRemove(v: any) {
		const remove = await setting.removeValue(v);
		values = remove;
	}

	onMount(async () => {
		values = await setting.getValue();
	});
</script>

<div class="list-container">
	<span class="heading">{setting.label}</span>
	<String
		bind:value
		callback={onAdd}
		label={addLabel}
		placeholder={undefined}
	/>

	{#if errorMessage}
		<span class="text-[#CC0000]">{errorMessage}</span>
	{/if}
	{#each values as v}
		<div class="entry">
			<span>{v}</span><button on:click={() => onRemove(v)}>🗑</button>
		</div>
	{/each}
</div>

<style lang="postcss">
	.list-container {
		@apply flex flex-col gap-1 justify-start items-start py-[20px] w-full;
	}

	.entry {
		@apply flex w-full items-center gap-1;

		span {
			@apply flex-grow text-sm overflow-hidden text-ellipsis;
		}
	}

	button {
		@apply flex-shrink-0;
	}

	.heading {
		@apply text-sm;
	}
</style>
