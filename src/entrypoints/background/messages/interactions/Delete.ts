import { REDDIT_API_DOMAIN, Website } from "@/utils/constants";
import { buildLemmyUrl, fetchCatch } from "@/utils/tools/RequestTools";
import type { DeleteRequest } from "@/utils/types/NetworkRequests";
import { getUser } from "../GetUser";

async function deleteRedditComment(r: DeleteRequest) {
	const me = await getUser(Website.REDDIT);

	if (!me.success) {
		return me;
	}

	const formData = new FormData();
	formData.append("id", r.id);
	formData.append("uh", me.value.token);
	formData.append("raw_json", "1");
	formData.append("api_type", "json");

	fetchCatch(`${REDDIT_API_DOMAIN}/api/del`, {
		method: "POST",
		body: formData,
	});
	return;
}

async function deleteLemmyComment(r: DeleteRequest) {
	const me = await getUser(Website.LEMMY);

	if (!me.success) {
		return me;
	}

	const url = await buildLemmyUrl("comment/delete", true);
	const body = {
		comment_id: Number(r.id),
		deleted: true,
		auth: me.value.token,
	};

	fetchCatch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${me.value.token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
}

async function deleteComment(r: DeleteRequest) {
	switch (r.website) {
		case Website.REDDIT:
			deleteRedditComment(r);
			break;
		case Website.LEMMY:
			deleteLemmyComment(r);
			break;
	}
}

export { deleteComment };
