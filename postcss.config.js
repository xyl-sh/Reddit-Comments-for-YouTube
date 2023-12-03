const config = {
	plugins: [
		require('tailwindcss/nesting'),
		require('tailwindcss'),
		require('autoprefixer'),
		require('postcss-nested'),
	],
};

module.exports = config;
