import { Site, getSite } from '@/lib/types/Site';
import ThreadSelector from './components/ThreadSelector.svelte';
import { SearchYouTubeRequest } from '@/lib/types/NetworkRequests';
import { sendMessage } from '@/lib/messaging';
import { SettingType, Settings, getSetting } from '@/lib/settings';
import './style.css';
import { SiteId } from '@/lib/constants';

let lastVideoId: string;

export default defineContentScript({
	matches: ['*://www.youtube.com/*', '*://nebula.tv/*'],
	runAt: 'document_start',

	main(ctx: InstanceType<typeof ContentScriptContext>) {
		const site: Site = getSite(window.location.hostname);
		const ui: HTMLDivElement = document.createElement('div');

		site.eventListeners.forEach((e) => {
			document.addEventListener(e, () => setup(site, ui));
		});

		browser.runtime.onMessage.addListener((data) => {
			if (data.hasUrlChanged) {
				setup(site, ui);
			}
		});

		ctx.onInvalidated(() => {
			ui.remove();
		});
	},
});

async function siteEnabled(id: SiteId) {
	switch (id) {
		case SiteId.YOUTUBE:
			return await getSetting(
				Settings.ENABLEYOUTUBE,
				SettingType.BOOLEAN
			).getValue();

		case SiteId.NEBULA:
			return await getSetting(
				Settings.ENABLENEBULA,
				SettingType.BOOLEAN
			).getValue();
	}
}

async function setup(site: Site, ui: HTMLDivElement) {
	const isEnabled = await siteEnabled(site.id);
	if (!isEnabled) {
		return;
	}

	const videoId = getVideoId(site);
	if (!videoId || videoId === lastVideoId) {
		return;
	}
	lastVideoId = videoId;

	ui.replaceChildren();

	const searchYouTubeEnabled =
		site.canMatchYouTube &&
		(await getSetting(Settings.MATCHTOYOUTUBE, SettingType.BOOLEAN).getValue());

	const [anchorElement, titleElement, usernameElement, videoElement] =
		await new Promise<any[]>((resolve) => {
			function res(elements: HTMLElement[]) {
				observer.disconnect();
				resolve(elements);
			}
			function checkElements() {
				const elements = [
					document.querySelector<HTMLElement>(site.anchorElement),
					document.querySelector<HTMLElement>(site.titleElement),
					document.querySelector<HTMLAnchorElement>(site.usernameElement),
					document.querySelector<HTMLVideoElement>(site.videoElement),
				];

				if (!searchYouTubeEnabled && elements[0]) {
					res(elements as HTMLElement[]);
				} else if (!elements.includes(null)) {
					if ((elements[3] as HTMLVideoElement).duration) {
						res(elements as HTMLElement[]);
					}
					elements[3]!.addEventListener(
						'loadedmetadata',
						function resolvePromise() {
							elements[3]?.removeEventListener(
								'loadedmetadata',
								resolvePromise
							);
							res(elements as HTMLElement[]);
						}
					);
				}
			}

			const observer = new MutationObserver(() => {
				checkElements();
			});

			observer.observe(document.documentElement, {
				childList: true,
				subtree: true,
			});
		});

	anchorElement.insertAdjacentElement(site.anchorType, ui);
	const threadSelector = new ThreadSelector({
		target: ui,
		props: {
			site: site,
			vId: videoId,
			yId: site.canMatchYouTube ? undefined : null,
		},
	});

	if (searchYouTubeEnabled) {
		const youtubeId = await searchYouTube(
			titleElement,
			usernameElement,
			videoElement
		);
		threadSelector.$set({ yId: youtubeId });
	}
}

function getVideoId(site: Site) {
	const urlMatch = window.location.href.match(site.idRegex);
	return urlMatch ? urlMatch[0] : null;
}

async function searchYouTube(
	titleElement: HTMLElement,
	usernameElement: HTMLAnchorElement,
	videoElement: HTMLVideoElement
) {
	const searchYouTubeRequest: SearchYouTubeRequest = {
		title: titleElement.textContent!,
		channelName: usernameElement.textContent!,
		channelId: usernameElement.href.split('/').pop()!,
		videoLength: videoElement.duration,
	};

	const searchYouTubeResponse = await sendMessage(
		'searchYouTube',
		searchYouTubeRequest
	);

	if (!searchYouTubeResponse.success) {
		console.error('searchYouTube', searchYouTubeResponse.errorMessage);
	}

	return searchYouTubeResponse.success ? searchYouTubeResponse.value : null;
}
