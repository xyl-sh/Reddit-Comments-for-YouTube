import { Kind, REDDIT_API_DOMAIN, Website } from "@/utils/constants";
import { buildLemmyUrl, fetchCatch } from "@/utils/tools/RequestTools";
import type { VoteRequest } from "@/utils/types/NetworkRequests";
import { getUser } from "../GetUser";

async function voteReddit(r: VoteRequest) {
	const me = await getUser(Website.REDDIT);

	if (!me.success) {
		return me;
	}

	const formData = new FormData();
	formData.append("id", r.id);
	formData.append("dir", r.vote.toString());
	formData.append("rank", "2");
	formData.append("uh", me.value.token);

	fetchCatch(`${REDDIT_API_DOMAIN}/api/vote`, {
		method: "POST",
		body: formData,
	});
}

async function voteLemmy(r: VoteRequest) {
	const me = await getUser(Website.LEMMY);

	if (!me.success) {
		return me;
	}

	let url: string;
	let body: object;

	switch (r.kind) {
		case Kind.COMMENT:
			url = await buildLemmyUrl("comment/like", true);
			body = {
				comment_id: Number(r.id),
				score: r.vote,
				auth: me.value.token,
			};
			break;

		case Kind.THREAD:
			url = await buildLemmyUrl("post/like", true);
			body = {
				post_id: Number(r.id),
				score: r.vote,
				auth: me.value.token,
			};
			break;
	}

	fetchCatch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${me.value.token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
}

async function vote(r: VoteRequest) {
	switch (r.website) {
		case Website.REDDIT:
			voteReddit(r);
			break;

		case Website.LEMMY:
			voteLemmy(r);
			break;
	}
	return;
}

export { vote };
