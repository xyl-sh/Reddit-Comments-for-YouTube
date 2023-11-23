export function cleanString(string: string) {
	return string
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.replace(/\s{2,}/g, ' ')
		.toLowerCase();
}
