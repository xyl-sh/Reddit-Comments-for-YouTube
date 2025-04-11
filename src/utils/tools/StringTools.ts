export function cleanString(string: string) {
	return string
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.replace(/\s{2,}/g, " ")
		.toLowerCase();
}

export function getScore(score: number, isComment: boolean) {
	let scoreString = score.toString();
	if (score > 9999) {
		scoreString = i18n.t("tagline.commentThousandUnit", [
			(score / 1000).toFixed(score > 99999 ? 0 : 1),
		]);
	}

	if (!isComment) {
		return scoreString;
	}

	return i18n.t("tagline.commentPoints", score);
}
