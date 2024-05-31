function colonToNumber(timestamp: string): number {
	const sections = timestamp.split(':').reverse();
	if (sections.length > 3) {
		throw new Error('Invalid timestamp: too many sections.');
	}

	const seconds = Number(sections[0]);
	const minutes = Number(sections[1] || 0) * 60;
	const hours = Number(sections[2] || 0) * 3600;

	return seconds + minutes + hours;
}

function hmsToNumber(timestamp: string): number {
	const secondsMatch = timestamp.match(/\d*(?=s)/);
	const minutesMatch = timestamp.match(/\d*(?=m)/);
	const hoursMatch = timestamp.match(/\d*(?=h)/);

	const seconds = secondsMatch ? parseInt(secondsMatch[0]) : 0;
	const minutes = minutesMatch ? parseInt(minutesMatch[0]) * 60 : 0;
	const hours = hoursMatch ? parseInt(hoursMatch[0]) * 3600 : 0;

	return seconds + minutes + hours;
}

export function numberToHms(timestamp: number): string {
	const hours = Math.trunc(timestamp / 3600);
	const remaining = timestamp % 3600;
	const minutes = Math.trunc(remaining / 60);
	const seconds = Math.trunc(remaining % 60);

	return `${hours > 0 ? hours + ':' + ('0' + minutes).slice(-2) : minutes}:${(
		'0' + seconds
	).slice(-2)}`;
}

export function parseTimestamp(timestamp: string): number {
	const parsed = Number(timestamp);
	if (!isNaN(parsed)) {
		return parsed;
	}

	if (timestamp.includes(':')) {
		return colonToNumber(timestamp);
	}

	if (timestamp.match(/[hms]/)) {
		return hmsToNumber(timestamp);
	}

	throw new Error('Invalid timestamp: unsupported format.');
}

export function timestampToRelativeTime(timestamp: number) {
	const currentTime = Math.floor(Date.now() / 1000);
	const difference = currentTime - timestamp;

	if (difference < 10) {
		return browser.i18n.getMessage('timeJustNow');
	} else if (difference < 60) {
		return browser.i18n.getMessage('timeSecondsAgo', [`${difference}`]);
	} else if (difference < 120) {
		return browser.i18n.getMessage('timeMinuteAgo');
	} else if (difference < 3600) {
		return browser.i18n.getMessage('timeMinutesAgo', [
			`${Math.floor(difference / 60)}`,
		]);
	} else if (difference < 7200) {
		return browser.i18n.getMessage('timeHourAgo');
	} else if (difference < 86400) {
		return browser.i18n.getMessage('timeHoursAgo', [
			`${Math.floor(difference / 3600)}`,
		]);
	} else if (difference < 172800) {
		return browser.i18n.getMessage('timeDayAgo');
	} else if (difference < 2678400) {
		return browser.i18n.getMessage('timeDaysAgo', [
			`${Math.floor(difference / 86400)}`,
		]);
	} else if (difference < 5356800) {
		return browser.i18n.getMessage('timeMonthAgo');
	} else if (difference < 31536000) {
		return browser.i18n.getMessage('timeMonthsAgo', [
			`${Math.floor(difference / 2678400)}`,
		]);
	} else if (difference < 63072000) {
		return browser.i18n.getMessage('timeYearAgo');
	} else {
		return browser.i18n.getMessage('timeYearsAgo', [
			`${Math.floor(difference / 31536000)}`,
		]);
	}
}

export function lemmyTimestampToEpoch(timestamp: string) {
	return Math.floor(Date.parse(timestamp) / 1000);
}
