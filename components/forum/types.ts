import {
  ForumApiThreadDetailQuery,
  ForumApiThreadDetailQuery$data,
} from "@/__generated__/ForumApiThreadDetailQuery.graphql";
import { ForumApiThreadsCombinedQuery } from "@/__generated__/ForumApiThreadsCombinedQuery.graphql";

export type ThreadListType = NonNullable<
  NonNullable<ForumApiThreadsCombinedQuery["response"]["forumByCourseId"]>["threads"]
>;

export type ThreadType = ThreadListType[number];

export type ThreadDetailType = NonNullable<
  NonNullable<ForumApiThreadDetailQuery["response"]["thread"]>
>;

export type PostsType = NonNullable<
  ForumApiThreadDetailQuery$data["thread"]
>["posts"];
export type Post = PostsType[number];
