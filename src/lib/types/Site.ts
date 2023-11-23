export enum SiteId {
	YOUTUBE = 'youtube',
	NEBULA = 'nebula',
}

enum AnchorType {
	BEFOREBEGIN = 'beforebegin',
	BEFOREEND = 'beforeend',
	AFTERBEGIN = 'afterbegin',
	AFTEREND = 'afterend',
}

export interface Site {
	id: SiteId;
	idRegex: RegExp;
	anchorType: AnchorType;
	anchorElement: string;
	usernameElement: string;
	titleElement: string;
	videoElement: string;
	canMatchYouTube: boolean;
	domains: string[];
}

const Sites: Site[] = [
	{
		id: SiteId.YOUTUBE,
		idRegex: /(?<=v=|shorts\/)[a-zA-Z0-9\-_]{11}/,
		anchorType: AnchorType.BEFOREBEGIN,
		anchorElement: '#comments',
		usernameElement: 'yt-formatted-string.ytd-channel-name a',
		titleElement: 'h1.ytd-watch-metadata yt-formatted-string',
		videoElement: '.video-stream',
		canMatchYouTube: false,
		domains: ['www.youtube.com', 'youtu.be'],
	},
	{
		id: SiteId.NEBULA,
		idRegex: /(?<=videos\/).*/,
		anchorType: AnchorType.BEFOREEND,
		anchorElement: 'section[aria-label="video description"]',
		usernameElement: 'section[aria-label="video description"] a',
		titleElement: '[aria-label="video description"] h1',
		videoElement: '#video-player video',
		canMatchYouTube: false,
		domains: ['nebula.tv'],
	},
];

export function getSite(domain: string) {
	const match = Sites.find((s) => s.domains.includes(domain));
	if (!match) {
		throw new Error('Invalid site, somehow...');
	}

	return match;
}

export function getSiteById(id: SiteId) {
	const match = Sites.find((s) => s.id === id);
	if (!match) {
		throw new Error('Invalid site, somehow...');
	}

	return match;
}
