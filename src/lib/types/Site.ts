import { SiteId } from '../constants';

enum AnchorType {
	BEFOREBEGIN = 'beforebegin',
	BEFOREEND = 'beforeend',
	AFTERBEGIN = 'afterbegin',
	AFTEREND = 'afterend',
}

export type Site = {
	id: SiteId;
	idRegex: RegExp;
	anchorType: AnchorType;
	anchorElement: string;
	usernameElement: string;
	titleElement: string;
	videoElement: string;
	canMatchYouTube: boolean;
	domains: string[];
	templates: string[];
	eventListeners: string[];
};

const Sites: Site[] = [
	{
		id: SiteId.YOUTUBE,
		idRegex: /(?<=v=|shorts\/)[a-zA-Z0-9\-_]*/,
		anchorType: AnchorType.BEFOREBEGIN,
		anchorElement: '#comments',
		usernameElement: 'yt-formatted-string.ytd-channel-name a',
		titleElement: 'h1.ytd-watch-metadata yt-formatted-string',
		videoElement: '.video-stream',
		canMatchYouTube: false,
		domains: ['www.youtube.com', 'youtu.be'],
		templates: [
			'https://www.youtube.com/watch?v=videoId',
			'https://youtu.be/videoId',
		],
		eventListeners: ['yt-navigate-finish', 'spfdone', 'DOMContentLoaded'],
	},
	{
		id: SiteId.NEBULA,
		idRegex: /(?<=videos\/).*/,
		anchorType: AnchorType.AFTEREND,
		anchorElement: 'section[aria-label="video description"] > div:last-of-type',
		usernameElement: 'section[aria-label="video description"] a',
		titleElement: '[aria-label="video description"] h1',
		videoElement: '#video-player video',
		canMatchYouTube: true,
		domains: ['nebula.tv'],
		templates: ['https://nebula.tv/videos/videoId'],
		eventListeners: ['DOMContentLoaded'],
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

export function getPopupSite(url: URL) {
	const domain = url.hostname;
	try {
		const site = getSite(domain);
		if (url.href.match(site.idRegex)) {
			return site;
		}
	} catch { }

	return <Site>{
		id: SiteId.POPUP,
		canMatchYouTube: false,
		domains: [domain],
		templates: [`https://${domain}/videoId`],
	};
}
