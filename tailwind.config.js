/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./**/*.{html,js,svelte,ts}'],
	plugins: [],

	theme: {
		extend: {
			textColor: {
				primary: 'var(--primary-text)',
				secondary: 'var(--secondary-text)',
				link: 'var(--link-text)',
				subtle: 'var(--subtle-link-text)',
			},

			backgroundColor: {
				interactable: 'var(--interactable-background)',
				select: 'var(--select-background)',
				option: 'var(--option-background)',
				hover: 'var(--hover-background)',
			},

			backgroundImage: {
				arrows: 'var(--arrows)',
			},

			fontSize: {
				header: [
					'var(--header-size)',
					{
						fontWeight: 'var(--header-weight)',
					},
				],
				standard: 'var(--notice-size)',
				arrow: 'calc(var(--notice-size) / 2);',
			},

			fontWeight: {
				notice: 'var(--notice-weight)',
			},

			margin: {
				container: 'var(--container-margin)',
			},

			borderColor: {
				interactable: 'var(--interactable-border)',
				separator: 'var(--separator-border)',
				blockquote: 'var(--secondary-text)',
			},

			borderRadius: {
				small: 'var(--border-radius-small)',
				large: 'var(--border-radius-large)',
			},
		},
	},
};
