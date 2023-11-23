import { Kind, REDDIT_API_DOMAIN } from '@/lib/constants';
import { Me } from '@/lib/types/RedditElements';

let me: Me;

async function getMe(): Promise<Me> {
	if (me === undefined) {
		const response = await fetch(`${REDDIT_API_DOMAIN}/api/me.json`);
		const jsonReponse = await response.json();

		const d = jsonReponse?.data;

		me = {
			kind: Kind.USER,
			id: d?.id,
			fullId: `${Kind.USER}_${d?.id}`,
			modhash: d?.modhash,
			username: d?.name,
			isSuspended: d?.is_suspended,
		};
	}

	return me;
}

export { getMe };
