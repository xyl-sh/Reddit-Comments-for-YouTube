import {
	LemmyCommentSort,
	REDDIT_API_DOMAIN,
	RedditCommentSort,
	Website,
} from '@/lib/constants';
import type { GetCommentsRequest } from '@/lib/types/NetworkRequests';
import type { Replies, Thread } from '@/lib/types/Elements';
import { getUser } from './GetUser';
import {
	lemmyCommentsToComments,
	redditCommentsToComments,
} from '@/lib/mappers/CommentMapper';
import { buildLemmyUrl, fetchCatch } from '@/lib/tools/RequestTools';
import type {
	CommentResponse,
	FetchResponse,
} from '@/lib/types/NetworkResponses';
import { SettingType, Settings, getSetting } from '@/lib/settings';

async function getRedditThread(
	threadId: string,
	sort: string
): Promise<FetchResponse<Replies>> {
	const response = await fetchCatch(
		`${REDDIT_API_DOMAIN}/comments/${threadId}?sort=${sort}&raw_json=1`
	);

	if (!response.success) {
		return response;
	}

	const responseJson = await response.value.json();

	const mappedThreads = await redditCommentsToComments(
		responseJson[1].data.children,
		threadId
	);

	return { success: true, value: mappedThreads };
}

async function getLemmyThread(
	threadId: string,
	sort: string
): Promise<FetchResponse<Replies>> {
	const url = new URL(await buildLemmyUrl('comment/list', true));
	url.searchParams.append('post_id', threadId);
	url.searchParams.append('sort', sort);
	url.searchParams.append('limit', '50');

	const token = await getSetting(
		Settings.LEMMYTOKEN,
		SettingType.STRING
	).getValue();
	if (token) {
		url.searchParams.append('auth', token);
	}

	const response = await fetchCatch(url);

	if (!response.success) {
		return response;
	}

	const responseJson = await response.value.json();

	const mappedThreads = await lemmyCommentsToComments(
		responseJson.comments,
		threadId,
		'0'
	);
	return { success: true, value: mappedThreads };
}

async function getBannedStatus(
	subreddit: string
): Promise<FetchResponse<boolean>> {
	const response = await fetchCatch(
		`${REDDIT_API_DOMAIN}/${subreddit}/about.json`
	);

	if (!response.success) {
		return response;
	}

	const responseJson = await response.value.json();

	const isBanned = responseJson?.data?.user_is_banned !== false;

	return { success: true, value: isBanned };
}

async function getRedditComments(
	thread: Thread,
	sort: RedditCommentSort
): Promise<FetchResponse<CommentResponse>> {
	const [comments, me, isBanned] = await Promise.all([
		getRedditThread(thread.id, sort),
		getUser(Website.REDDIT),
		getBannedStatus(thread.community),
	]);

	if (!comments.success) {
		return comments;
	}

	const response: CommentResponse = {
		replies: comments.value,
		user: me.success ? me.value : undefined,
		isBanned: isBanned.success ? isBanned.value : undefined,
	};

	return { success: true, value: response };
}

async function getLemmyComments(
	thread: Thread,
	sort: LemmyCommentSort
): Promise<FetchResponse<CommentResponse>> {
	const [comments, me] = await Promise.all([
		getLemmyThread(thread.id, sort),
		getUser(Website.LEMMY),
	]);

	if (!comments.success) {
		return comments;
	}

	const response: CommentResponse = {
		replies: comments.value,
		user: me.success ? me.value : undefined,
		isBanned: false, // can't figure out where this is in the API
	};

	return { success: true, value: response };
}

async function getComments(
	r: GetCommentsRequest
): Promise<FetchResponse<CommentResponse>> {
	switch (r.thread.website) {
		case Website.REDDIT:
			return await getRedditComments(r.thread, r.sort as RedditCommentSort);
		case Website.LEMMY:
			return await getLemmyComments(r.thread, r.sort as LemmyCommentSort);
	}
}

export { getComments };
