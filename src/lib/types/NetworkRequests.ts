import {
	RedditCommentSort,
	LemmyCommentSort,
	Kind,
	Website,
} from '../constants';
import { MoreReplies, Thread } from './Elements';
import type { Site } from './Site';

export type GetCommentsRequest = {
	thread: Thread;
	sort: RedditCommentSort | LemmyCommentSort;
};

export type GetMoreChildrenRequest = {
	moreChildren: MoreReplies;
	sort: RedditCommentSort | LemmyCommentSort;
	page: number;
};

export type GetThreadsRequest = {
	site: Site;
	videoId: string;
	youtubeId: string | null;
};

export type SearchYouTubeRequest = {
	title: string;
	channelName: string;
	channelId: string;
	videoLength: number;
};

export type VoteRequest = {
	kind: Kind.COMMENT | Kind.THREAD;
	website: Website;
	id: string;
	vote: number;
};

export type CommentRequest = {
	website: Website;
	isEdit: boolean;
	id: string;
	threadId: string;
	text: string;
};

export type DeleteRequest = {
	website: Website;
	id: string;
};

export type LemmyLoginRequest = {
	username_or_email: string;
	password: string;
	totp_2fa_token?: string;
};
