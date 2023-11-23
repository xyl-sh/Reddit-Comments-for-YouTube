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
		permissions: ['storage'],
		host_permissions: ['*://*.nebula.tv/', '*://api.reddit.com/'],
	},
});
