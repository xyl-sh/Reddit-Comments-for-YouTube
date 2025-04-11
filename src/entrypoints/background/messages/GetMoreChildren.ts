import {
	LemmyCommentSort,
	REDDIT_API_DOMAIN,
	RedditCommentSort,
	Website,
} from "@/utils/constants";
import type { MoreReplies, Replies, Reply } from "@/utils/types/Elements";
import { SettingType, Settings, getSetting } from "@/utils/settings";
import { buildLemmyUrl, fetchCatch } from "@/utils/tools/RequestTools";
import {
	lemmyCommentsToComments,
	redditCommentsToComments,
} from "@/utils/mappers/CommentMapper";
import type { FetchResponse } from "@/utils/types/NetworkResponses";
import type { GetMoreChildrenRequest } from "@/utils/types/NetworkRequests";

async function getMoreChildrenReddit(
	moreChildren: MoreReplies,
	sort: RedditCommentSort,
): Promise<FetchResponse<Replies>> {
	const formData = new FormData();
	formData.append("id", moreChildren.fullId);
	formData.append("parent", moreChildren.parent);
	formData.append("link_id", moreChildren.threadId);
	formData.append("children", moreChildren.children.join(","));
	formData.append("sort", sort);
	formData.append("limit_children", "false");
	formData.append("raw_json", "1");
	formData.append("api_type", "json");

	const response = await fetchCatch(`${REDDIT_API_DOMAIN}/api/morechildren`, {
		method: "POST",
		body: formData,
	});

	if (!response.success) {
		return response;
	}
	const jsonReponse = await response.value.json();

	const moreComments = await redditCommentsToComments(
		jsonReponse.json.data.things,
		moreChildren.threadId.split("_")[1],
	);
	moreComments.forEach((c) => {
		const parent = moreComments.find<Reply>(
			(p): p is Exclude<typeof p, MoreReplies> => p.fullId === c.parent,
		);
		if (!parent) {
			return;
		}

		parent.replies.push(c);
	});

	const parentComments = moreComments.filter(
		(c) => moreChildren.parent === c.parent,
	);

	return { success: true, value: parentComments };
}

async function getMoreChildrenLemmy(
	moreChildren: MoreReplies,
	sort: LemmyCommentSort,
	page: number,
): Promise<FetchResponse<Replies>> {
	const topLevel = moreChildren.parent === moreChildren.threadId;
	const token = await getSetting(
		Settings.LEMMYTOKEN,
		SettingType.STRING,
	).getValue();

	const url = new URL(await buildLemmyUrl(`comment/list`, true));

	if (topLevel) {
		url.searchParams.append("post_id", moreChildren.threadId);
		url.searchParams.append("limit", "50");
		url.searchParams.append("page", page.toString());
	} else {
		url.searchParams.append("parent_id", moreChildren.parent);
		url.searchParams.append("max_depth", "8");
		url.searchParams.append("limit", "999");
	}

	if (token) {
		url.searchParams.append("auth", token);
	}
	url.searchParams.append("sort", sort);
	url.searchParams.append("type_", "All");

	const response = await fetchCatch(url);

	if (!response.success) {
		return response;
	}
	const jsonReponse = await response.value.json();

	if (!jsonReponse.comments) {
		return { success: false, errorMessage: "Failed to get comments." };
	}

	const mappedComments = await lemmyCommentsToComments(
		jsonReponse.comments,
		moreChildren.threadId,
		topLevel ? "0" : moreChildren.parent,
	);

	return {
		success: true,
		value: mappedComments,
	};
}

async function getMoreChildren(
	r: GetMoreChildrenRequest,
): Promise<FetchResponse<Replies>> {
	switch (r.moreChildren.website) {
		case Website.REDDIT:
			return getMoreChildrenReddit(r.moreChildren, r.sort as RedditCommentSort);
		case Website.LEMMY:
			return getMoreChildrenLemmy(
				r.moreChildren,
				r.sort as LemmyCommentSort,
				r.page,
			);
	}
}

export { getMoreChildren };
