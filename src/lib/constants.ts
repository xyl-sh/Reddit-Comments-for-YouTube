export const REDDIT_LINK_DOMAIN = 'https://www.reddit.com';
export const REDDIT_API_DOMAIN = 'https://api.reddit.com';

export enum ThreadSort {
	SCORE = 'score',
	COMMENTS = 'comments',
	SUBREDDIT = 'subreddit',
	NEWEST = 'newest',
}

export enum CommentSort {
	BEST = 'best',
	TOP = 'top',
	NEW = 'new',
	CONTROVERSIAL = 'controversial',
	OLD = 'old',
	QA = 'qa',
}

export enum Interactions {
	VOTE = 'vote',
	COMMENT = 'comment',
	EDIT = 'editusertext',
	DELETE = 'del',
}

export enum Kind {
	COMMENT = 't1',
	USER = 't2',
	THREAD = 't3',
	SUBREDDIT = 't5',
	MORE = 'more',
}
