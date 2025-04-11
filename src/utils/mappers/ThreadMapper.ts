import { Kind, REDDIT_LINK_DOMAIN, Website } from "../constants";
import {
	LemmyThreadResponse,
	RedditThreadResponse,
} from "../types/ApiReponses";
import { lemmyTimestampToEpoch, parseTimestamp } from "../tools/TimeTools";
import { Thread } from "../types/Elements";
import { buildLemmyUrl } from "../tools/RequestTools";

function buildTitle(
	communityPrefix: string,
	community: string,
	score: number,
	comments: number,
	title: string,
): string {
	const prefix = `${communityPrefix}${community}, ${score}⇧, ${comments}💬`;

	return `${prefix}\r\n${title}`;
}

export function redditThreadToThread(thread: RedditThreadResponse): Thread {
	const d = thread.data;
	const linkedUrl = new URL(d.url.replaceAll("&amp;", "&"));
	const timestampParam = linkedUrl.searchParams.get("t");

	let linkedTimestamp;

	if (timestampParam) {
		try {
			linkedTimestamp = parseTimestamp(timestampParam);
		} catch {
			console.error("Invalid timestamp param", timestampParam);
		}
	}

	const userVote = d.likes === null ? 0 : d.likes ? 1 : -1;

	return {
		website: Website.REDDIT,
		kind: Kind.THREAD,
		id: d.id,
		fullId: d.name,
		title: buildTitle("r/", d.subreddit, d.score, d.num_comments, d.title),
		plainTitle: d.title,
		author: d.author,
		authorLink: `${REDDIT_LINK_DOMAIN}/user/${d.author}`,
		link: REDDIT_LINK_DOMAIN + d.permalink,
		linkedTimestamp: linkedTimestamp,
		submissionLink: d.url,
		community: `r/${d.subreddit}`,
		communityLink: `${REDDIT_LINK_DOMAIN}/r/${d.subreddit}`,
		score: d.score - userVote,
		comments: d.num_comments,
		createdTimestamp: d.created,
		userVote: userVote,
		archived: d.archived,
		locked: d.locked,
		replies: [],
		page: 0,
		remainingChildren: 0,
	};
}

export async function lemmyThreadToThread(
	thread: LemmyThreadResponse,
): Promise<Thread> {
	const p = thread.post;
	const a = thread.creator;
	const s = thread.community;
	const n = thread.counts;

	const author = `${a.name}@${a.actor_id.split("/")[2]}`;
	const community = `${s.name}@${s.actor_id.split("/")[2]}`;

	return {
		website: Website.LEMMY,
		kind: Kind.THREAD,
		id: p.id.toString(),
		fullId: p.id.toString(),
		title: buildTitle("!", community, n.score, n.comments, p.name),
		plainTitle: p.name,
		author: `@${author}`,
		authorLink: await buildLemmyUrl(`u/${author}`),
		link: await buildLemmyUrl(`post/${p.id}`),
		submissionLink: p.url,
		community: `!${community}`,
		communityLink: await buildLemmyUrl(`c/${community}`),
		score: n.score - ~~thread.my_vote,
		comments: n.comments,
		createdTimestamp: lemmyTimestampToEpoch(p.published),
		userVote: ~~thread.my_vote,
		archived: false,
		locked: p.locked,
		replies: [],
		page: 1,
		remainingChildren: n.comments,
	};
}
