import { Kind, REDDIT_API_DOMAIN, REDDIT_LINK_DOMAIN } from '@/lib/constants';
import { GetCommentsRequest } from '@/lib/types/NetworkRequests';
import {
	Comment,
	ExtraThreadInfo,
	MoreChildren,
} from '@/lib/types/RedditElements';
import { getMe } from './GetMe';

function mapComments(
	threads: any[],
	threadId: string | undefined
): (Comment | MoreChildren)[] {
	const mappedComments = threads
		.filter((t) => ['t1', 'more'].includes(t.kind))
		.map((t) => {
			const d = t.data;
			if (t.kind === 't1') {
				const userVote = d.likes === null ? 0 : d.likes ? 1 : -1;

				const comment: Comment = {
					kind: Kind.COMMENT,
					id: d.id,
					fullId: d.name,
					parent: d.parent_id,
					body: d.body,
					bodyHtml: d.body_html,
					author: d.author,
					link: REDDIT_LINK_DOMAIN + d.permalink,
					score: d.score - userVote,
					replies: [],
					createdTimestamp: d.created_utc,
					editedTimestamp: d.edited,
					distinguishedPoster: d.is_submitter ? 'op' : d.distinguished,
					stickied: d.stickied,
					scoreHidden: d.score_hidden,
					userVote: userVote,
					locked: d.locked,
					controversial: d.controversiality === 1,
				};

				if (d.replies !== '') {
					comment.replies.push(
						...mapComments(d.replies.data.children, threadId)
					);
				}
				return comment;
			} else {
				const more: MoreChildren = {
					kind: Kind.MORE,
					id: d.id,
					fullId: d.name,
					parent: d.parent_id,
					threadId: `t3_${threadId}`,
					count: d.count,
					children: d.children,
				};
				return more;
			}
		});
	return mappedComments;
}

async function getThread(
	threadId: string,
	sort: string
): Promise<(Comment | MoreChildren)[]> {
	const response = await fetch(
		`${REDDIT_API_DOMAIN}/comments/${threadId}?sort=${sort}&raw_json=1`
	);
	const responseJson = await response.json();

	const mappedThreads = mapComments(responseJson[1].data.children, threadId);
	return mappedThreads;
}

async function getBannedStatus(subreddit: string): Promise<boolean> {
	const response = await fetch(
		`${REDDIT_API_DOMAIN}/r/${subreddit}/about.json`
	);
	const responseJson = await response.json();

	const isBanned = responseJson?.data?.user_is_banned !== false;
	return isBanned;
}

async function getComments(
	r: GetCommentsRequest
): Promise<[comments: (Comment | MoreChildren)[], info: ExtraThreadInfo]> {
	const [comments, me, isBanned] = await Promise.all([
		getThread(r.threadId, r.sort),
		getMe(),
		getBannedStatus(r.subreddit),
	]);

	const extraThreadInfo: ExtraThreadInfo = {
		isBanned: isBanned,
		user: me,
	};

	return [comments, extraThreadInfo];
}

export { getComments, mapComments };
