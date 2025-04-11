import { SettingType, Settings, getSetting } from "@/utils/settings";
import ThreadSelector, {
	ThreadSelectorProps,
} from "@/components/threads/ThreadSelector.svelte";
import { SearchYouTubeRequest } from "@/utils/types/NetworkRequests";
import { Site } from "@/utils/types/Site";
import { SiteId } from "@/utils/constants";
import { mount } from "svelte";
import { sendMessage } from "@/utils/messaging";

type ElementTuple = [
	HTMLElement,
	HTMLElement,
	HTMLAnchorElement,
	HTMLVideoElement,
];

let lastVideoId: string;

async function siteEnabled(id: SiteId) {
	switch (id) {
		case SiteId.YOUTUBE:
			return await getSetting(
				Settings.ENABLEYOUTUBE,
				SettingType.BOOLEAN,
			).getValue();

		case SiteId.NEBULA:
			return await getSetting(
				Settings.ENABLENEBULA,
				SettingType.BOOLEAN,
			).getValue();
	}
}

export async function setup(site: Site, ui: HTMLDivElement) {
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
		await new Promise<ElementTuple>((resolve) => {
			function res(elements: ElementTuple) {
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
					res(elements as ElementTuple);
				} else if (!elements.includes(null)) {
					if ((elements[3] as HTMLVideoElement).duration) {
						res(elements as ElementTuple);
					}
					elements[3]!.addEventListener(
						"loadedmetadata",
						function resolvePromise() {
							elements[3]?.removeEventListener(
								"loadedmetadata",
								resolvePromise,
							);
							res(elements as ElementTuple);
						},
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

	const threadSelectorProps: ThreadSelectorProps = $state({
		site: site,
		vId: videoId,
		yId: site.canMatchYouTube ? undefined : null,
	});

	mount(ThreadSelector, {
		target: ui,
		props: threadSelectorProps,
	});

	if (searchYouTubeEnabled) {
		const yId = await searchYouTube(
			titleElement,
			usernameElement,
			videoElement,
		);
		threadSelectorProps.yId = yId;
	}
}

function getVideoId(site: Site) {
	const urlMatch = window.location.href.match(site.idRegex);
	return urlMatch ? urlMatch[0] : null;
}

async function searchYouTube(
	titleElement: HTMLElement,
	usernameElement: HTMLAnchorElement,
	videoElement: HTMLVideoElement,
) {
	const searchYouTubeRequest: SearchYouTubeRequest = {
		title: titleElement.textContent!,
		channelName: usernameElement.textContent!,
		channelId: usernameElement.href.split("/").pop()!,
		videoLength: videoElement.duration,
	};

	const searchYouTubeResponse = await sendMessage(
		"searchYouTube",
		searchYouTubeRequest,
	);

	if (!searchYouTubeResponse.success) {
		console.error("searchYouTube", searchYouTubeResponse.errorMessage);
	}

	return searchYouTubeResponse.success ? searchYouTubeResponse.value : null;
}
