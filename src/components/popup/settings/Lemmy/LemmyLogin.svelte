<script lang="ts">
	import { SettingType, Settings, getSetting } from "@/utils/settings";
	import { type LemmyLoginRequest } from "@/utils/types/NetworkRequests";
	import String from "../String.svelte";
	import { sendMessage } from "@/utils/messaging";

	interface LemmyLoginProps {
		username: string;
	}

	let { username = $bindable() }: LemmyLoginProps = $props();

	let usernameValue: string = $state("");
	let passwordValue: string = $state("");
	let totpValue: string = $state("");
	let loggingIn: boolean = $state(false);

	let errorMessage: string | undefined = $state();
	const loginHeader = i18n.t("loginToLemmy");
	const usernameLabel = i18n.t("username");
	const passwordLabel = i18n.t("password");
	const twoFactorLabel = i18n.t("twoFactorAuth");
	let loginLabel: string = $derived(loggingIn ? "..." : i18n.t("login"));
	const logoutLabel = i18n.t("logout");
	let loggedInMessage: string = $derived(i18n.t("loggedIn", [username]));

	const tokenSetting = getSetting(Settings.LEMMYTOKEN, SettingType.STRING);
	const usernameSetting = getSetting(
		Settings.LEMMYUSERNAME,
		SettingType.STRING,
	);

	async function login() {
		errorMessage = undefined;

		if (loggingIn) {
			return;
		}
		loggingIn = true;

		const lemmyLoginRequest: LemmyLoginRequest = {
			password: passwordValue,
			totp_2fa_token: totpValue,
			username_or_email: usernameValue,
		};

		const response = await sendMessage("lemmyLogin", lemmyLoginRequest);

		if (!response.success) {
			errorMessage = response.errorMessage;
			loggingIn = false;
			return;
		}

		tokenSetting.setValue(response.value);
		usernameSetting.setValue(usernameValue);

		username = usernameValue;
	}

	function logout() {
		tokenSetting.setValue(null);
		usernameSetting.setValue(null);
		username = "";
	}
</script>

{#if username}
	<div class="logged-in">
		<span>{loggedInMessage} </span>
		<button onclick={logout}>{logoutLabel} </button>
	</div>
{:else}
	<div class="logged-out">
		<span class="heading">{loginHeader} </span>
		<input type="text" bind:value={usernameValue} placeholder={usernameLabel} />
		<input
			type="password"
			bind:value={passwordValue}
			placeholder={passwordLabel}
		/>
		<div class="flex flex-row">
			<String
				bind:value={totpValue}
				placeholder={twoFactorLabel}
				callback={login}
				label={loginLabel}
			/>
		</div>
	</div>

	{#if errorMessage}
		<span class="error-message">{errorMessage} </span>
	{/if}
{/if}

<style lang="postcss">
	@reference "@/assets/css/threads.css";

	.logged-in {
		@apply flex flex-row w-full items-center my-2;

		span {
			@apply inline-block flex-grow;
		}
	}

	.logged-out {
		@apply flex flex-col w-full gap-0.5 my-2;
	}

	.heading {
		@apply text-sm;
	}
</style>
