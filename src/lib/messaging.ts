import { defineExtensionMessaging } from '@webext-core/messaging';
import {
	CommentRequest,
	DeleteRequest,
	GetCommentsRequest,
	GetMoreChildrenRequest,
	GetThreadsRequest,
	Response,
	SearchYouTubeRequest,
	VoteRequest,
} from './types/NetworkRequests';
import {
	Comment,
	ExtraThreadInfo,
	Me,
	MoreChildren,
	Thread,
} from './types/RedditElements';

interface ProtocolMap {
	comment(r: CommentRequest): Response<Comment>;
	deleteComment(r: DeleteRequest): void;
	getComments(
		r: GetCommentsRequest
	): [comments: (Comment | MoreChildren)[], info: ExtraThreadInfo];
	getMe(): Me;
	getMoreChildren(r: GetMoreChildrenRequest): (Comment | MoreChildren)[];
	getThreads(r: GetThreadsRequest): Thread[];
	vote(r: VoteRequest): void;
	searchYouTube(r: SearchYouTubeRequest): string | null;
}

export const { sendMessage, onMessage } =
	defineExtensionMessaging<ProtocolMap>();
