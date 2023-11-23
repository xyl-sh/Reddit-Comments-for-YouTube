<script lang="ts">
	import { type ArraySetting } from '@/lib/settings';
	import { onMount } from 'svelte';
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

<div class="flex flex-col gap-1 justify-start items-start py-[20px] w-full">
	<span class="text-base">{setting.label}</span>
	<div class="flex gap-2 w-full">
		<input type="text" class="rounded-md flex-grow" bind:value="{value}" /><button
			class="flex-shrink-0"
			on:click="{onAdd}">{addLabel}</button
		>
	</div>

	{#if errorMessage}
		<span class="text-red-600">{errorMessage}</span>
	{/if}
	{#each values as v}
		<div class="flex w-full items-center">
			<span class="flex-grow text-sm">{v}</span><button class="flex-shrink-0" on:click="{() => onRemove(v)}">🗑</button>
		</div>
	{/each}
</div>
