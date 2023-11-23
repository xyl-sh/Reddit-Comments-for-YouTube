import { Kind, REDDIT_API_DOMAIN, REDDIT_LINK_DOMAIN } from '@/lib/constants';
import { SettingType, Settings, getSetting } from '@/lib/settings';
import { parseTimestamp } from '@/lib/tools/TimeTools';
import { GetThreadsRequest } from '@/lib/types/NetworkRequests';
import { Thread } from '@/lib/types/RedditElements';
import { getSiteById, SiteId } from '@/lib/types/Site';

async function getPage(url: URL) {
	const threads: any[] = [];
	const response = await fetch(url);
	const responseJson = await response.json();
	const nextPage = responseJson?.data?.after;

	responseJson?.data?.children?.forEach((t: any) => threads.push(t));

	if (!nextPage) {
		return threads;
	}

	url.searchParams.set('after', nextPage);

	const moreThreads = await getPage(url);
	threads.push(...moreThreads);

	return threads;
}

function mapDomains(domains: string[], videoId: string, includeNSFW: boolean) {
	return domains.map((d) => {
		const url = new URL(`${REDDIT_API_DOMAIN}/search.json`);
		url.searchParams.set('limit', '100');
		url.searchParams.set('sort', 'top');
		url.searchParams.set('q', `url:${videoId}+site:${d}`);
		url.searchParams.set('include_over_18', includeNSFW.toString());
		return url;
	});
}

async function getThreads(r: GetThreadsRequest) {
	const includeNSFW = await getSetting(
		Settings.INCLUDENSFW,
		SettingType.BOOLEAN
	).getValue();

	const urls = mapDomains(r.site.domains, r.videoId, includeNSFW);

	if (r.site.canMatchYouTube && r.youtubeId) {
		const youtubeDomains = getSiteById(SiteId.YOUTUBE).domains;
		const youtubeSearchUrls = mapDomains(
			youtubeDomains,
			r.youtubeId,
			includeNSFW
		);
		urls.push(...youtubeSearchUrls);
	}

	const threads: any[] = [];
	const results = await Promise.all(urls.map(async (url) => getPage(url)));
	results.forEach((t) => {
		if (!t) {
			return;
		}
		threads.push(...t);
	});

	const subredditBlacklist = await getSetting<string>(
		Settings.SUBBLACKLIST,
		SettingType.ARRAY
	).getValue();
	const response: Thread[] = threads.flatMap((r) => {
		const d = r.data;
		if (subredditBlacklist.includes(d.subreddit)) {
			return [];
		}
		const linkedUrl = new URL(d.url.replaceAll('&amp;', '&'));
		const timestampParam = linkedUrl.searchParams.get('t');

		const titlePrefix = `r/${d.subreddit}, ${d.score}⇧, ${d.num_comments}💬`;
		const userVote = d.likes === null ? 0 : d.likes ? 1 : -1;

		const mappedData: Thread = {
			kind: Kind.THREAD,
			id: d.id,
			fullId: d.name,
			title: `${titlePrefix}\r\n${d.title}`,
			plainTitle: d.title,
			author: d.author,
			link: REDDIT_LINK_DOMAIN + d.permalink,
			linkedTimestamp: timestampParam ? parseTimestamp(timestampParam) : null,
			subreddit: d.subreddit,
			score: d.score - userVote,
			comments: d.num_comments,
			createdTimestamp: d.created,
			userVote: userVote,
			archived: d.archived,
			locked: d.locked,
			replies: [],
			info: undefined,
		};

		return [mappedData];
	});

	return response;
}

export { getThreads };
