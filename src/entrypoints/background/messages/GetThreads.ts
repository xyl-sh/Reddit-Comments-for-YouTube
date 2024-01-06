import { REDDIT_API_DOMAIN, SiteId } from '@/lib/constants';
import {
	lemmyThreadToThread,
	redditThreadToThread,
} from '@/lib/mappers/ThreadMapper';
import { SettingType, Settings, getSetting } from '@/lib/settings';
import { buildLemmyUrl, fetchCatch } from '@/lib/tools/RequestTools';
import type { GetThreadsRequest } from '@/lib/types/NetworkRequests';
import type { FetchResponse } from '@/lib/types/NetworkResponses';
import type { Thread } from '@/lib/types/Elements';
import { getSiteById, type Site } from '@/lib/types/Site';
import { resetUser } from './GetUser';

const lemmyDomain = getSetting(Settings.LEMMYDOMAIN, SettingType.STRING);

async function getRedditPage(url: URL): Promise<FetchResponse<Thread[]>> {
	const threads: Thread[] = [];
	const response = await fetchCatch(url);

	if (!response.success) {
		return response;
	}

	const responseJson = await response.value.json();
	const nextPage = responseJson?.data?.after;

	responseJson?.data?.children?.forEach((t: any) =>
		threads.push(redditThreadToThread(t))
	);

	if (!nextPage) {
		return { success: true, value: threads };
	}

	url.searchParams.set('after', nextPage);

	const moreThreads = await getRedditPage(url);
	if (moreThreads.success) {
		threads.push(...moreThreads.value);
	}

	return { success: true, value: threads };
}

async function getLemmyPage(
	url: URL,
	page: number
): Promise<FetchResponse<Thread[]>> {
	const threads: Thread[] = [];

	url.searchParams.set('page', page.toString());

	const response = await fetchCatch(url);

	if (!response.success) {
		return response;
	}

	const responseJson = await response.value.json();

	await responseJson?.posts?.forEach(async (t: any) =>
		threads.push(await lemmyThreadToThread(t))
	);

	if (!responseJson?.posts?.length) {
		return { success: true, value: threads };
	}

	const moreThreads = await getLemmyPage(url, page + 1);
	if (moreThreads.success) {
		threads.push(...moreThreads.value);
	}

	return { success: true, value: threads };
}

async function mapRedditQueries(
	site: Site,
	videoId: string,
	includeNSFW: boolean
) {
	if (
		!(await getSetting(
			Settings.SHOWREDDITRESULTS,
			SettingType.BOOLEAN
		).getValue()) &&
		(await lemmyDomain.getValue())
	) {
		return [];
	}
	return site.domains.flatMap((d, i) => {
		const url = new URL(`${REDDIT_API_DOMAIN}/search.json`);
		if (site.id === SiteId.POPUP) {
			url.searchParams.set(
				'q',
				`url:${site.templates[i].replace('videoId', videoId)}+site:${d}`
			);
		} else {
			url.searchParams.set('q', `url:${videoId}+site:${d}`);
		}
		url.searchParams.set('limit', '100');
		url.searchParams.set('sort', 'top');
		url.searchParams.set('include_over_18', includeNSFW.toString());
		url.searchParams.set('raw_json', '1');

		return url;
	});
}

async function mapLemmyQueries(site: Site, videoId: string) {
	if (!(await lemmyDomain.getValue())) {
		return [];
	}
	const urls = site.templates.map((t) => t.replace('videoId', videoId));
	const token = await getSetting(
		Settings.LEMMYTOKEN,
		SettingType.STRING
	).getValue();
	return await Promise.all(
		urls.flatMap(async (u) => {
			const url = new URL(await buildLemmyUrl('search', true));
			url.searchParams.set('q', u);
			url.searchParams.set('sort', 'TopAll');
			url.searchParams.set('type_', 'Url');
			if (token) {
				url.searchParams.set('auth', token);
			}
			return url;
		})
	);
}

async function getThreads(
	r: GetThreadsRequest
): Promise<FetchResponse<Thread[]>> {
	resetUser();
	const includeNSFW = await getSetting(
		Settings.INCLUDENSFW,
		SettingType.BOOLEAN
	).getValue();

	const urls = await mapRedditQueries(r.site, r.videoId, includeNSFW);
	const lemmyUrls = await mapLemmyQueries(r.site, r.videoId);

	if (r.site.canMatchYouTube && r.youtubeId) {
		const youtube = getSiteById(SiteId.YOUTUBE);
		const youtubeSearchUrls = await mapRedditQueries(
			youtube,
			r.youtubeId,
			includeNSFW
		);
		urls.push(...youtubeSearchUrls);

		const youtubeLemmyUrls = await mapLemmyQueries(youtube, r.youtubeId);
		lemmyUrls.push(...youtubeLemmyUrls);
	}

	const communityBlacklist = await getSetting<string>(
		Settings.COMMUNITYBLACKLIST,
		SettingType.ARRAY
	).getValue();

	const threads = await Promise.all(
		[
			urls.map(async (url) => getRedditPage(url)),
			lemmyUrls.map(async (url) => getLemmyPage(url, 1)),
		].flat()
	);

	if (!threads.find((t) => t.success === true)) {
		return { success: false, errorMessage: "Couldn't get threads" };
	}

	const ids: string[] = [];
	const response = threads.flatMap((l) => {
		if (!l.success) {
			return [];
		}

		return l.value.filter((t) => {
			if (ids.includes(t.fullId)) {
				return;
			}
			ids.push(t.fullId);
			return !communityBlacklist.includes(t.community);
		});
	});

	return { success: true, value: response };
}

export { getThreads };
