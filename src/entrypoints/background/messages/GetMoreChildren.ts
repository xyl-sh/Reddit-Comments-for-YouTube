import { REDDIT_API_DOMAIN } from '@/lib/constants';
import { GetMoreChildrenRequest } from '@/lib/types/NetworkRequests';
import { mapComments } from './GetComments';
import { objectToFormData } from '@/lib/tools/RequestTools';
import { Comment, MoreChildren } from '@/lib/types/RedditElements';

async function getMoreChildren(
	r: GetMoreChildrenRequest
): Promise<(Comment | MoreChildren)[]> {
	const formData = objectToFormData(r);
	formData.append('limit_children', 'false');
	formData.append('raw_json', '1');
	formData.append('api_type', 'json');

	const response = await fetch(`${REDDIT_API_DOMAIN}/api/morechildren`, {
		method: 'POST',
		body: formData,
	});
	const jsonReponse = await response.json();

	const moreComments = mapComments(
		jsonReponse.json.data.things,
		r.link_id.split('_')[1]
	);
	moreComments.forEach((c) => {
		const parent = moreComments.find<Comment>(
			(p): p is Exclude<typeof p, MoreChildren> => p.fullId === c.parent
		);
		if (!parent) {
			return;
		}

		parent.replies.push(c);
	});

	const parentComments = moreComments.filter((c) => r.parent === c.parent);

	return parentComments;
}

export { getMoreChildren };
