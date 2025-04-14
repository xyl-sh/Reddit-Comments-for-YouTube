import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: "src",
	modules: [
		"@wxt-dev/module-svelte",
		"@wxt-dev/i18n/module",
		"@wxt-dev/auto-icons",
	],
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	webExt: {
		disabled: true,
	},
	manifest: {
		name: "__MSG_extensionName__",
		description: "__MSG_extensionDescription__",
		default_locale: "en",
		permissions: ["storage"],
		optional_permissions: ["tabs"],
		host_permissions: ["*://*.nebula.tv/", "*://api.reddit.com/"],
		optional_host_permissions: ["https://*/*"],
		browser_specific_settings: {
			gecko: {
				id: "rcfy@xyl.sh",
			},
		},
	},
	imports: {
		eslintrc: {
			enabled: 9,
		},
	},
});
