<script lang="ts">
	import Lemmy from "./settings/Lemmy/Lemmy.svelte";
	import SettingContainer from "./SettingContainer.svelte";
	import { SettingsList } from "@/utils/settings";

	const headerLabel = i18n.t("extensionName");
	const settings = SettingsList.filter(
		(s) =>
			!SettingsList.find((p) => p.children?.includes(s.name)) &&
			s.displayInList,
	);
</script>

<div class="main">
	<div class="header">
		<span class="heading">{headerLabel}</span>
		<span
			>Apologies if your settings reset, or something broke. This extension was
			recently rewritten. If you run into problems, please <a
				href="https://github.com/Xyl-AU/Reddit-Comments-for-YouTube/issues"
				target="_blank">open an issue report</a
			>.</span
		>
	</div>
	<SettingContainer {settings} />
	<Lemmy />
	<div class="links">
		<a
			href="https://github.com/Xyl-AU/Reddit-Comments-for-YouTube"
			target="_blank">GitHub</a
		>
		<a href="https://ko-fi.com/xylau" target="_blank">support the developer</a>
	</div>
</div>

<style lang="postcss">
	@reference "@/assets/css/popup.css";

	.main {
		@apply w-80 leading-normal;

		:global(button) {
			@apply styled-button;
		}
	}

	.header,
	.links {
		@apply flex flex-col text-center;

		.heading {
			@apply text-lg font-bold;
		}

		a {
			@apply text-link;
		}

		span {
			@apply mb-3;
		}
	}
</style>
