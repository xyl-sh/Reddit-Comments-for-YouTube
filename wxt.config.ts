import { defineConfig } from 'wxt';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: 'src',
	vite: () => ({
		plugins: [
			svelte({
				// Using a svelte.config.js file causes a segmentation fault when importing the file
				configFile: false,
				preprocess: [vitePreprocess()],
			}),
		],
	}),
	runner: {
		disabled: true,
	},
	manifest: {
		name: '__MSG_extensionName__',
		description: '__MSG_extensionDescription__',
		default_locale: 'en',
		permissions: [
			'storage',
			'*://www.youtube.com/',
			'*://*.nebula.tv/',
			'*://api.reddit.com/',
		],
		host_permissions: ['*://*.nebula.tv/', '*://api.reddit.com/'],
		optional_permissions: ['https://*/*'],
		optional_host_permissions: ['https://*/*'],
		browser_specific_settings: {
			gecko: {
				id: 'rcfy@xyl.sh',
			},
		},
	},
});
