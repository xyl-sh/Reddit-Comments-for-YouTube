import { Replies, User } from "./Elements";

export type FetchResponse<T> =
  | { success: true; value: T }
  | { success: false; errorMessage: string };

export type CommentResponse = {
  replies: Replies;
  user?: User;
  isBanned?: boolean;
};
