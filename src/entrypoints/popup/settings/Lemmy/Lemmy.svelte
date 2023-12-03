<script lang="ts">
	import { SettingType, Settings, getSetting } from '@/lib/settings';
	import { onMount } from 'svelte';
	import LemmyLogin from './LemmyLogin.svelte';
	import String from '../String.svelte';
	import Checkbox from '../Checkbox.svelte';
	import Dropdown from '../Dropdown.svelte';
	let value: string = '';
	let errorMessage: string;
	let domain: string;
	let username: string;

	const domainSetting = getSetting(Settings.LEMMYDOMAIN, SettingType.STRING);
	const tokenSetting = getSetting(Settings.LEMMYTOKEN, SettingType.STRING);
	const usernameSetting = getSetting(
		Settings.LEMMYUSERNAME,
		SettingType.STRING
	);

	const setLabel = browser.i18n.getMessage('setButton');
	const instanceLabel = browser.i18n.getMessage('instance');

	async function setDomain() {
		errorMessage = '';
		if (domain === value) {
			return;
		}
		if (value) {
			value = value.split('https://')!.pop()!.split('/')[0];

			const permission = `https://${value}/*`;
			const result = await browser.permissions.request({
				origins: [permission],
			});
			if (!result) {
				errorMessage = 'Permission required to access Lemmy.';
				return;
			}
		}

		domainSetting.setValue(value);
		tokenSetting.setValue('');
		usernameSetting.setValue('');
		username = '';
		domain = value;
	}

	onMount(async () => {
		domain = await domainSetting.getValue();
		username = await usernameSetting.getValue();
		value = domain;
	});
</script>

<div class="lemmy-container">
	<span class="header">Lemmy</span>
	<String
		placeholder={instanceLabel}
		callback={setDomain}
		label={setLabel}
		bind:value
	/>
	{#if errorMessage}
		<span class="error-message">{errorMessage}</span>
	{/if}
	{#if domain}
		<LemmyLogin bind:username />
		<Dropdown
			setting={getSetting(Settings.DEFAULTSORTLEMMY, SettingType.OPTION)}
		/>
	{/if}
</div>

<style lang="postcss">
	.lemmy-container {
		@apply flex flex-col gap-1 justify-start items-start py-[20px] w-full;
	}

	.header {
		@apply text-base;
	}
</style>
