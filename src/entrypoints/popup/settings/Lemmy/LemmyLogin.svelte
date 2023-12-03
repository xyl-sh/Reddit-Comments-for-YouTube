<script lang="ts">
	import { sendMessage } from '@/lib/messaging';
	import { SettingType, Settings, getSetting } from '@/lib/settings';
	import { type LemmyLoginRequest } from '@/lib/types/NetworkRequests';
	import String from '../String.svelte';

	export let username: string;

	let usernameValue: string = '';
	let passwordValue: string = '';
	let totpValue: string = '';

	let loggingIn: boolean = false;

	let errorMessage: string | undefined;

	const loginHeader = browser.i18n.getMessage('loginToLemmy');
	const usernameLabel = browser.i18n.getMessage('username');
	const passwordLabel = browser.i18n.getMessage('password');
	const twoFactorLabel = browser.i18n.getMessage('twoFactorAuth');
	let loginLabel: string;
	$: loginLabel = loggingIn ? '...' : browser.i18n.getMessage('login');
	const logoutLabel = browser.i18n.getMessage('logout');
	let loggedInMessage: string;
	$: loggedInMessage = browser.i18n.getMessage('loggedIn', username);

	const tokenSetting = getSetting(Settings.LEMMYTOKEN, SettingType.STRING);
	const usernameSetting = getSetting(
		Settings.LEMMYUSERNAME,
		SettingType.STRING
	);

	async function login() {
		errorMessage = undefined;

		if (loggingIn) {
			return;
		}
		loggingIn = true;

		const lemmyLoginRequest: LemmyLoginRequest = {
			username_or_email: usernameValue,
			password: passwordValue,
			totp_2fa_token: totpValue,
		};

		const response = await sendMessage('lemmyLogin', lemmyLoginRequest);

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
		username = '';
	}
</script>

{#if username}
	<div class="logged-in">
		<span>{loggedInMessage}</span>
		<button on:click={logout}>{logoutLabel}</button>
	</div>
{:else}
	<div class="logged-out">
		<span class="heading">{loginHeader}</span>
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
		<span class="error-message">{errorMessage}</span>
	{/if}
{/if}

<style lang="postcss">
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
