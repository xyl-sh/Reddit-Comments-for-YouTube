import { Site, getPopupSite } from '@/lib/types/Site';
import { GetThreadsRequest } from '@/lib/types/NetworkRequests';
import { getThreads } from './messages/GetThreads';
import { Thread } from '@/lib/types/Elements';
import { SiteId } from '@/lib/constants';
import { getSetting, Settings, SettingType } from '@/lib/settings';

const dict: Record<number, { url?: URL; threads?: Thread[]; site?: Site }> = [];

function setBadge(tabId: number, text: string) {
	const options = { tabId: tabId, text: text };
	// manifest V2
	try {
		browser.browserAction.setBadgeText(options);
	} catch {}
	// manifest V3
	try {
		browser.action.setBadgeText(options);
	} catch {}
}

export async function getPopup(tabId: number) {
	const enabled = await getSetting(
		Settings.SEARCHALLSITES,
		SettingType.BOOLEAN
	).getValue();
	if (!enabled) return;

	const tab = await browser.tabs.get(tabId);
	if (!tab.url) return;
	const u = new URL(tab.url);
	if (!dict[tabId]) {
		dict[tabId] = {};
	}
	if (dict[tabId] && dict[tabId].url === u) return;
	dict[tabId].url = u;

	const site = getPopupSite(u);

	let path = `${u.pathname}${u.search}`.substring(1);
	if (site.id !== SiteId.POPUP) {
		const urlMatch = u.href.match(site.idRegex);
		path = urlMatch ? urlMatch[0] : path;
	}

	setBadge(tabId, '...');

	const getThreadsRequest: GetThreadsRequest = {
		site: site,
		videoId: path,
		youtubeId: null,
	};

	const response = await getThreads(getThreadsRequest);

	if (dict[tabId].url !== u) {
		return;
	}

	if (!response.success) {
		setBadge(tabId, 'Error');
		return;
	}

	const filteredThreads = response.value.filter((t) => {
		if (site.id !== SiteId.POPUP) return true;
		const threadUrl = new URL(t.submissionLink);
		return threadUrl.href === u.href;
	});

	site.id = SiteId.POPUP;
	dict[tabId].site = site;

	setBadge(tabId, filteredThreads.length.toString());
	dict[tabId].threads = filteredThreads;

	browser.runtime.sendMessage({
		id: 'DICTRESPONSE',
		tab: tabId,
		dict: getPopupThreads(tabId),
	});
}

export function removeFromDicts(tabId: number) {
	delete dict[tabId];
}

export function getPopupThreads(tabId: number) {
	const tab = dict[tabId];
	return { threads: tab.threads || null, site: tab.site || null };
}
