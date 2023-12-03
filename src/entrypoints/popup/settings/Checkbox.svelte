<script lang="ts">
	import { getChildren, type BooleanSetting } from '@/lib/settings';
	import { onMount } from 'svelte';
	export let setting: BooleanSetting;
	import SettingContainer from '../SettingContainer.svelte';
	let isEnabled: boolean;

	onMount(async () => {
		isEnabled = await setting.getValue();
	});
</script>

<div class="checkbox-container">
	<input
		id={setting.name}
		type="checkbox"
		bind:checked={isEnabled}
		on:change={() => setting.setValue(isEnabled)}
	/><label for={setting.name}>{setting.label}</label>
</div>
{#if setting.children.length && isEnabled}
	<SettingContainer settings={getChildren(setting)} />
{/if}

<style lang="postcss">
	.checkbox-container {
		@apply flex gap-1 justify-start items-start;

		input {
			@apply mt-0.5;
		}
	}
</style>
