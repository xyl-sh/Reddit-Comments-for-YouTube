import { SelectOption } from '@/entrypoints/rcfy.content/components/interactable/CustomSelect.svelte';
import type { Kind, Website } from '../constants';

export interface Element {
	kind: Kind;
	id: string;
	fullId: string;
	website: Website;
}

export type Replies = (Reply | MoreReplies)[];

export interface Thread extends Element, SelectOption {
	kind: Kind.THREAD;
	id: string;
	fullId: string;
	title: string;
	plainTitle: string;
	author: string;
	authorLink: string;
	link: string;
	linkedTimestamp?: number;
	submissionLink: string;
	community: string;
	communityLink: string;
	score: number;
	comments: number;
	createdTimestamp: number;
	userVote: number;
	archived: boolean;
	locked: boolean;
	replies: Replies;
	page: number;
	remainingChildren: number;
}

export interface Reply extends Element {
	kind: Kind.COMMENT;
	parent: string;
	thread: string;
	body: string;
	bodyHtml?: string;
	author: string;
	authorLink: string;
	link: string;
	score: number;
	replies: Replies;
	createdTimestamp: number;
	editedTimestamp: number | null;
	distinguishedPoster: 'op' | 'moderator' | 'admin' | null;
	stickied: boolean;
	scoreHidden: boolean;
	userVote: number;
	locked: boolean;
	controversial: boolean;
	childCount: number;
	remainingChildren: number;
}

export interface MoreReplies extends Element {
	kind: Kind.MORE;
	id: string;
	fullId: string;
	parent: string;
	threadId: string;
	count: number;
	children: string[];
	page?: number;
}

export type User = {
	website: Website;
	token: string;
	username: string;
	isSuspended: boolean;
};
