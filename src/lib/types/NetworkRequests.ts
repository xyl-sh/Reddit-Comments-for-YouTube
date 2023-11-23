import { CommentSort, Interactions } from '../constants';
import type { Site } from './Site';

export interface GetCommentsRequest {
	threadId: string;
	sort: CommentSort;
	subreddit: string;
}

export interface GetMoreChildrenRequest {
	parent: string;
	link_id: string;
	sort: string;
	children: string;
	id: string;
}

export interface GetThreadsRequest {
	site: Site;
	videoId: string;
	youtubeId: string | null;
}

export interface SearchYouTubeRequest {
	title: string;
	channelName: string;
	channelId: string;
	videoLength: number;
}

export interface InteractionRequest {
	interaction: Interactions;
	formData: object;
}

export interface VoteRequest extends InteractionRequest {
	interaction: Interactions.VOTE;
	formData: {
		id: string;
		dir: number;
		rank: 2;
	};
}

export interface CommentRequest extends InteractionRequest {
	interaction: Interactions.COMMENT | Interactions.EDIT;
	formData: {
		thing_id: string;
		text: string;
	};
}

export interface DeleteRequest extends InteractionRequest {
	interaction: Interactions.DELETE;
	formData: {
		id: string;
	};
}

export type Response<T> =
	| { success: true; value: T }
	| { success: false; errorMessage: string };
