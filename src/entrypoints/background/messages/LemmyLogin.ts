import { buildLemmyUrl, fetchCatch } from "@/utils/tools/RequestTools";
import type { FetchResponse } from "@/utils/types/NetworkResponses";
import type { LemmyLoginRequest } from "@/utils/types/NetworkRequests";

async function lemmyLogin(
  r: LemmyLoginRequest,
): Promise<FetchResponse<string>> {
  const url = await buildLemmyUrl("user/login", true);

  const response = await fetchCatch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(r),
  });

  if (!response.success) {
    return response;
  }

  const jsonReponse = await response.value.json();
  const token = jsonReponse?.jwt;

  if (!token) {
    return { success: false, errorMessage: "Failed to log in." };
  }

  return { success: true, value: jsonReponse.jwt };
}

export { lemmyLogin };
