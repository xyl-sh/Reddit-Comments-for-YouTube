<script lang="ts">
	import { type OptionSetting } from '@/lib/settings';
	import { onMount } from 'svelte';

	export let setting: OptionSetting<any>;

	let value: string;

	onMount(async () => {
		value = await setting.getValue();
	});
</script>

<div class="dropdown-container">
	<label for={setting.name}>{setting.label}</label>
	<select
		id={setting.name}
		bind:value
		on:change={() => setting.setValue(value)}
	>
		{#each setting.availableValues as o}
			<option value={o}>{o}</option>
		{/each}
	</select>
</div>

<style lang="postcss">
	.dropdown-container {
		@apply flex gap-1 justify-start items-start py-[10px];
	}
</style>
