export function cleanString(string: string) {
	return string
		.replace(/[^a-zA-Z0-9]+/g, ' ')
		.replace(/\s{2,}/g, ' ')
		.toLowerCase();
}

export function getScore(score: number, isComment: boolean) {
	let scoreString = score.toString();
	if (score > 9999) {
		scoreString = browser.i18n.getMessage('commentThousandUnit', [
			(score / 1000).toFixed(score > 99999 ? 0 : 1),
		]);
	}

	if (!isComment) {
		return scoreString;
	}

	if (score === 1) {
		return browser.i18n.getMessage('commentPoint');
	} else {
		return browser.i18n.getMessage('commentPoints', [scoreString]);
	}
}
