<script lang="ts">
	import {
		ArraySetting,
		type BooleanSetting,
		OptionSetting,
		type SettingClass,
		SettingType,
		type StorageValue,
		StringSetting,
	} from "@/utils/settings";
	import Checkbox from "./settings/Checkbox.svelte";
	import Dropdown from "./settings/Dropdown.svelte";
	import List from "./settings/List.svelte";

	interface SettingContainerProps {
		settings: (
			| BooleanSetting
			| StringSetting
			| OptionSetting<StorageValue>
			| ArraySetting<StorageValue>
		)[];
	}

	let { settings }: SettingContainerProps = $props();

	export function getSetting(
		setting: SettingClass,
		type: SettingType.BOOLEAN,
	): BooleanSetting;
	export function getSetting(
		setting: SettingClass,
		type: SettingType.STRING,
	): StringSetting;
	export function getSetting<T extends StorageValue>(
		setting: SettingClass,
		type: SettingType.OPTION,
	): OptionSetting<T>;
	export function getSetting<T extends StorageValue>(
		setting: SettingClass,
		type: SettingType.ARRAY,
	): ArraySetting<T>;
	export function getSetting(setting: SettingClass): SettingClass {
		return setting;
	}
</script>

<div class="flex flex-col items-start justify-start text-left gap-1">
	{#each settings as s (s.name)}
		{#if s.type === SettingType.BOOLEAN}
			<Checkbox setting={getSetting(s, SettingType.BOOLEAN)} />
		{:else if s.type === SettingType.OPTION}
			<Dropdown setting={getSetting(s, SettingType.OPTION)} />
		{:else if s.type === SettingType.ARRAY}
			<List setting={getSetting(s, SettingType.ARRAY)} />
		{/if}
	{/each}
</div>
