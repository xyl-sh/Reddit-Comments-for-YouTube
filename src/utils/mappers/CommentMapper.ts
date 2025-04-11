import { Kind, REDDIT_LINK_DOMAIN, Website } from "../constants";
import {
  LemmyCommentResponse,
  RedditCommentResponse,
} from "../types/ApiReponses";
import { MoreReplies, Replies, Reply } from "../types/Elements";
import { lemmyCommentParser, redditCommentParser } from "../tools/CommentTools";
import { buildLemmyUrl } from "../tools/RequestTools";
import { lemmyTimestampToEpoch } from "../tools/TimeTools";

export async function redditCommentsToComments(
  threads: RedditCommentResponse[],
  threadId: string,
): Promise<Replies> {
  const mappedComments = await Promise.all(
    threads
      .filter((t) => ["t1", "more"].includes(t.kind))
      .map(async (t) => {
        const d = t.data;
        if (t.kind === "t1") {
          const userVote = d.likes === null ? 0 : d.likes ? 1 : -1;

          const comment: Reply = {
            website: Website.REDDIT,
            kind: Kind.COMMENT,
            id: d.id,
            fullId: d.name,
            parent: d.parent_id,
            thread: threadId,
            body: d.body,
            bodyHtml: await redditCommentParser(d.body, d.media_metadata || {}),
            author: d.author,
            authorLink: `${REDDIT_LINK_DOMAIN}/user/${d.author}`,
            link: REDDIT_LINK_DOMAIN + d.permalink,
            score: d.score - userVote,
            replies: [],
            createdTimestamp: d.created_utc,
            editedTimestamp: d.edited,
            distinguishedPoster: d.is_submitter ? "op" : d.distinguished,
            stickied: d.stickied,
            scoreHidden: d.score_hidden,
            userVote: userVote,
            locked: d.locked,
            controversial: d.controversiality === 1,
            childCount: 0,
            remainingChildren: 0,
          };

          if (d.replies !== "" && typeof d.replies === "object") {
            const replies = await redditCommentsToComments(
              d.replies.data.children,
              threadId,
            );
            comment.replies.push(...replies);
          }
          return comment;
        } else {
          const more: MoreReplies = {
            website: Website.REDDIT,
            kind: Kind.MORE,
            id: d.id,
            fullId: d.name,
            parent: d.parent_id,
            threadId: `t3_${threadId}`,
            count: d.count || 0,
            children: d.children || [],
          };
          return more;
        }
      }),
  );
  return mappedComments;
}

export async function lemmyCommentsToComments(
  threads: LemmyCommentResponse[],
  threadId: string,
  parentString?: string,
): Promise<Reply[]> {
  const mappedComments = await Promise.all(
    threads.map(async (t) => {
      const c = t.comment;
      const a = t.creator;
      const n = t.counts;

      const author = `${a.name}@${a.actor_id.split("/")[2]}`;

      const comment: Reply = {
        website: Website.LEMMY,
        kind: Kind.COMMENT,
        id: c.id.toString(),
        fullId: c.id.toString(),
        parent: c.path.split(".").slice(-2, -1)[0],
        thread: threadId,
        body: c.content,
        bodyHtml: await lemmyCommentParser(c.content),
        author: `@${author}`,
        authorLink: await buildLemmyUrl(`u/${author}`),
        link: await buildLemmyUrl(`/comment/${c.id}`),
        score: n.score - ~~t.my_vote,
        replies: [],
        createdTimestamp: lemmyTimestampToEpoch(c.published),
        editedTimestamp: c.updated ? lemmyTimestampToEpoch(c.updated) : null,
        distinguishedPoster: null,
        stickied: false,
        scoreHidden: false,
        userVote: ~~t.my_vote,
        locked: false,
        controversial: false,
        childCount: ~~n.child_count,
        remainingChildren: ~~n.child_count,
      };
      return comment;
    }),
  );

  mappedComments.forEach((c) => {
    if (c.parent === parentString) {
      return;
    }

    const parent = mappedComments.find((p) => p.id === c.parent);
    if (!parent) {
      return;
    }
    parent.replies.push(c);
    parent.remainingChildren = parent.remainingChildren - (c.childCount + 1);
  });

  if (!parentString) {
    return mappedComments;
  }

  const parentComments = mappedComments.flatMap((c) => {
    if (c.remainingChildren > 0) {
      const moreChildren: MoreReplies = {
        kind: Kind.MORE,
        id: "",
        fullId: "",
        parent: c.id,
        threadId: threadId,
        count: c.remainingChildren,
        children: [],
        website: Website.LEMMY,
      };
      c.replies.push(moreChildren);
    }

    return c.parent === parentString ? c : [];
  });

  return parentComments;
}
