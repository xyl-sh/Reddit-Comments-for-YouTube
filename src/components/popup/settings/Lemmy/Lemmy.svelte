<script lang="ts">
	import { SettingType, Settings, getSetting } from "@/utils/settings";
	import Dropdown from "../Dropdown.svelte";
	import LemmyLogin from "./LemmyLogin.svelte";
	import String from "../String.svelte";
	import { onMount } from "svelte";

	let username: string = $state("");
	let domain: string = $state("");
	let value: string = $state("");
	let errorMessage: string | undefined = $state();

	const domainSetting = getSetting(Settings.LEMMYDOMAIN, SettingType.STRING);
	const tokenSetting = getSetting(Settings.LEMMYTOKEN, SettingType.STRING);
	const usernameSetting = getSetting(
		Settings.LEMMYUSERNAME,
		SettingType.STRING,
	);

	const setLabel = i18n.t("popupButtons.set");
	const instanceLabel = i18n.t("instance");

	async function setDomain() {
		errorMessage = "";
		if (domain === value) {
			return;
		}
		if (value) {
			value = value.split("https://")!.pop()!.split("/")[0];

			const permission = `https://${value}/* `;
			const result = await browser.permissions.request({
				origins: [permission],
			});
			if (!result) {
				errorMessage = "Permission required to access Lemmy.";
				return;
			}
		}

		domainSetting.setValue(value);
		tokenSetting.setValue("");
		usernameSetting.setValue("");
		username = "";
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
	@reference "@/assets/css/threads.css";

	.lemmy-container {
		@apply flex flex-col gap-1 justify-start items-start py-[20px] w-full;
	}

	.header {
		@apply text-base;
	}
</style>
