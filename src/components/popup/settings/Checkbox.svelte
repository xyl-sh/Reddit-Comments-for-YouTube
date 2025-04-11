<script lang="ts">
	import { type BooleanSetting, getChildren } from "@/utils/settings";
	import SettingContainer from "../SettingContainer.svelte";
	import { onMount } from "svelte";

	interface CheckboxSettingProps {
		setting: BooleanSetting;
	}

	let { setting }: CheckboxSettingProps = $props();
	let isEnabled: boolean = $state(false);

	onMount(async () => {
		isEnabled = await setting.getValue();
	});
</script>

<div class="checkbox-container">
	<input
		id={setting.name}
		type="checkbox"
		bind:checked={isEnabled}
		onchange={() => setting.setValue(isEnabled)}
	/><label for={setting.name}>{setting.label} </label>
</div>
{#if setting.children.length && isEnabled}
	<SettingContainer settings={getChildren(setting)} />
{/if}

<style lang="postcss">
	@reference "@/assets/css/popup.css";

	.checkbox-container {
		@apply flex gap-1 justify-start items-start;

		input {
			@apply mt-0.5;
		}
	}
</style>
