import { defineExtensionMessaging } from '@webext-core/messaging';
import {
	CommentRequest,
	DeleteRequest,
	GetCommentsRequest,
	GetMoreChildrenRequest,
	GetThreadsRequest,
	LemmyLoginRequest,
	SearchYouTubeRequest,
	VoteRequest,
} from './types/NetworkRequests';
import { CommentResponse, FetchResponse } from './types/NetworkResponses';
import { Reply, Replies, Thread } from './types/Elements';
import { Site } from './types/Site';

interface ProtocolMap {
	comment(r: CommentRequest): FetchResponse<Reply>;
	deleteComment(r: DeleteRequest): void;
	getComments(r: GetCommentsRequest): FetchResponse<CommentResponse>;
	getMoreChildren(r: GetMoreChildrenRequest): FetchResponse<Replies>;
	getThreads(r: GetThreadsRequest): FetchResponse<Thread[]>;
	vote(r: VoteRequest): void;
	lemmyLogin(r: LemmyLoginRequest): FetchResponse<string>;
	searchYouTube(r: SearchYouTubeRequest): FetchResponse<string | null>;

	getPopupThreads(r: number): { url?: URL; threads?: Thread[]; site?: Site };
}

export const { sendMessage, onMessage } =
	defineExtensionMessaging<ProtocolMap>();
