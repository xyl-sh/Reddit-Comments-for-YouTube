import { SelectOption } from '@/entrypoints/rcfy.content/components/interactable/CustomSelect.svelte';
import type { Kind } from '../constants';

export interface RedditElement {
	kind: Kind;
	id: string;
	fullId: string;
}

export interface ExtraThreadInfo {
	isBanned: boolean;
	user: Me;
}

export interface Thread extends RedditElement, SelectOption {
	kind: Kind.THREAD;
	id: string;
	fullId: string;
	title: string;
	plainTitle: string;
	author: string;
	link: string;
	linkedTimestamp: number | null;
	subreddit: string;
	score: number;
	comments: number;
	createdTimestamp: number;
	userVote: number;
	archived: boolean;
	locked: boolean;
	replies: (Comment | MoreChildren)[];
	info: ExtraThreadInfo | undefined;
}

export interface Comment extends RedditElement {
	kind: Kind.COMMENT;
	parent: string;
	body: string;
	bodyHtml: string;
	author: string;
	link: string;
	score: number;
	replies: (Comment | MoreChildren)[];
	createdTimestamp: number;
	editedTimestamp: number | null;
	distinguishedPoster: 'op' | 'moderator' | 'admin' | null;
	stickied: boolean;
	scoreHidden: boolean;
	userVote: number;
	locked: boolean;
	controversial: boolean;
}

export interface Me extends RedditElement {
	kind: Kind.USER;
	modhash: string;
	username: string;
	isSuspended: boolean;
}

export interface MoreChildren extends RedditElement {
	kind: Kind.MORE;
	id: string;
	fullId: string;
	parent: string;
	threadId: string;
	count: number;
	children: string[];
}
