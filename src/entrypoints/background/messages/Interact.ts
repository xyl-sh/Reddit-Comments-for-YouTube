import { REDDIT_API_DOMAIN, Kind } from '@/lib/constants';
import type {
	CommentRequest,
	DeleteRequest,
	InteractionRequest,
	Response,
	VoteRequest,
} from '@/lib/types/NetworkRequests';
import { getMe } from './GetMe';
import { objectToFormData } from '@/lib/tools/RequestTools';
import { mapComments } from './GetComments';
import { Comment, MoreChildren } from '@/lib/types/RedditElements';

async function sendRequest(r: InteractionRequest) {
	const me = await getMe();

	const formData = objectToFormData(r.formData);
	formData.append('uh', me.modhash);
	formData.append('raw_json', '1');
	formData.append('api_type', 'json');

	const response = await fetch(`${REDDIT_API_DOMAIN}/api/${r.interaction}`, {
		method: 'POST',
		body: formData,
	});
	return await response.json();
}

async function comment(r: CommentRequest): Promise<Response<Comment>> {
	const response = await sendRequest(r);
	if (response.json.errors[0]) {
		return { success: false, errorMessage: response.json.errors[0][1] };
	}
	const mapped = mapComments(response.json.data.things, undefined);

	return {
		success: true,
		value: mapped.find(
			(c): c is Exclude<typeof c, MoreChildren> => c.kind === Kind.COMMENT
		)!,
	};
}

async function deleteComment(r: DeleteRequest) {
	sendRequest(r);
	return;
}

async function vote(r: VoteRequest) {
	sendRequest(r);
	return;
}

export { comment, deleteComment, vote };
