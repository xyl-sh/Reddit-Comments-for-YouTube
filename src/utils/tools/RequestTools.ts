import type { FetchResponse } from "../types/NetworkResponses";
import { Settings } from "../settings";

export type RequestType = "GET" | "POST";

export async function buildLemmyUrl(endpoint: string, api: boolean = false) {
	const domain =
		(await storage.getItem<string>(`local:${Settings.LEMMYDOMAIN}`)) || "";

	if (endpoint[0] !== "/") {
		endpoint = "/" + endpoint;
	}

	return `https://${domain}${api ? "/api/v3" : ""}${endpoint}`;
}

export async function fetchCatch(
	url: string | URL,
	requestInit?: RequestInit,
): Promise<FetchResponse<Response>> {
	const response = await fetch(url, requestInit).catch(() => {
		return null;
	});

	if (response === null) {
		return {
			success: false,
			errorMessage: navigator.onLine ? "Network error" : "Internet offline",
		};
	}

	if (!response.ok) {
		return {
			success: false,
			errorMessage: `${response.status} ${response.statusText}`,
		};
	}

	return { success: true, value: response };
}
