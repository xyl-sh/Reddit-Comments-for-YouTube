import { Kind, REDDIT_API_DOMAIN, Website } from "@/utils/constants";
import type { MoreReplies, Reply } from "@/utils/types/Elements";
import { buildLemmyUrl, fetchCatch } from "@/utils/tools/RequestTools";
import {
  lemmyCommentsToComments,
  redditCommentsToComments,
} from "@/utils/mappers/CommentMapper";
import type { CommentRequest } from "@/utils/types/NetworkRequests";
import type { FetchResponse } from "@/utils/types/NetworkResponses";
import { getUser } from "../GetUser";

async function commentReddit(r: CommentRequest): Promise<FetchResponse<Reply>> {
  const me = await getUser(Website.REDDIT);

  if (!me.success) {
    return me;
  }

  const formData = new FormData();
  formData.append("thing_id", r.id);
  formData.append("text", r.text);
  formData.append("uh", me.value.token);
  formData.append("raw_json", "1");
  formData.append("api_type", "json");

  const url = `${REDDIT_API_DOMAIN}/api/${
    r.isEdit ? "editusertext" : "comment"
  }`;

  const response = await fetchCatch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.success) {
    return response;
  }

  const responseJson = await response.value.json();

  if (responseJson.json?.errors?.length) {
    return { success: false, errorMessage: responseJson.json.errors[0][1] };
  }

  const mapped = await redditCommentsToComments(
    responseJson.json.data.things,
    r.threadId,
  );

  return {
    success: true,
    value: mapped.find(
      (c): c is Exclude<typeof c, MoreReplies> => c.kind === Kind.COMMENT,
    )!,
  };
}

async function commentLemmy(r: CommentRequest): Promise<FetchResponse<Reply>> {
  const me = await getUser(Website.LEMMY);

  if (!me.success) {
    return me;
  }

  const url = await buildLemmyUrl("comment", true);
  let method;
  let body;

  if (r.isEdit) {
    body = {
      comment_id: Number(r.id),
      content: r.text,
      auth: me.value.token,
    };
    method = "PUT";
  } else {
    body = {
      content: r.text,
      post_id: Number(r.threadId),
      parent_id: Number(r.id),
      auth: me.value.token,
    };
    method = "POST";
  }

  const response = await fetchCatch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${me.value.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.success) {
    return response;
  }

  const responseJson = await response.value.json();

  if (!responseJson.comment_view) {
    return { success: false, errorMessage: "Error posting comment." };
  }

  const mapped = await lemmyCommentsToComments(
    [responseJson.comment_view],
    r.threadId,
  );

  return {
    success: true,
    value: mapped.find(
      (c): c is Exclude<typeof c, MoreReplies> => c.kind === Kind.COMMENT,
    )!,
  };
}

export async function comment(r: CommentRequest) {
  switch (r.website) {
    case Website.REDDIT:
      return await commentReddit(r);

    case Website.LEMMY:
      return await commentLemmy(r);
  }
}
