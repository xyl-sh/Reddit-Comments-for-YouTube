import {
	REDDIT_API_DOMAIN,
	REDDIT_LINK_DOMAIN,
	Website,
} from '@/lib/constants';
import { SettingType, Settings, getSetting } from '@/lib/settings';
import { buildLemmyUrl, fetchCatch } from '@/lib/tools/RequestTools';
import type { FetchResponse } from '@/lib/types/NetworkResponses';
import type { User } from '@/lib/types/Elements';

let redditUser: User | undefined;
let lemmyUser: User | undefined;

async function getUserReddit(): Promise<FetchResponse<User>> {
	if (redditUser === undefined) {
		const response = await fetchCatch(`${REDDIT_API_DOMAIN}/api/me.json`);

		if (!response.success) {
			return response;
		}

		const jsonReponse = await response.value.json();

		const d = jsonReponse?.data;

		if (!d) {
			return {
				success: false,
				errorMessage: 'Failed to get Reddit user data.',
			};
		}

		redditUser = {
			website: Website.REDDIT,
			token: d.modhash,
			username: d.name ? `${REDDIT_LINK_DOMAIN}/user/${d.name}` : '',
			isSuspended: d.is_suspended,
		};
	}

	return { success: true, value: redditUser };
}

async function getUserLemmy(): Promise<FetchResponse<User>> {
	if (lemmyUser === undefined) {
		const token = await getSetting(
			Settings.LEMMYTOKEN,
			SettingType.STRING
		).getValue();
		if (!token) {
			return { success: false, errorMessage: 'Lemmy token does not exist.' };
		}

		const domain = await getSetting(
			Settings.LEMMYDOMAIN,
			SettingType.STRING
		).getValue();

		const url = new URL(await buildLemmyUrl('site', true));
		url.searchParams.append('auth', token);

		const response = await fetchCatch(url);

		if (!response.success) {
			return response;
		}

		const jsonReponse = await response.value.json();

		const d = jsonReponse?.my_user?.local_user_view?.person;

		if (!d) {
			return {
				success: false,
				errorMessage: 'Failed to get Lemmy user data.',
			};
		}

		lemmyUser = {
			website: Website.LEMMY,
			token: token,
			username: `${d.actor_id}@${domain}`,
			isSuspended: d.banned,
		};
	}

	return { success: true, value: lemmyUser };
}

async function getUser(type: Website): Promise<FetchResponse<User>> {
	switch (type) {
		case Website.REDDIT:
			return await getUserReddit();
		case Website.LEMMY:
			return await getUserLemmy();
	}
}

function resetUser() {
	redditUser = undefined;
	lemmyUser = undefined;
}

export { getUser, resetUser };
