import { ForumApiThreadListQuery } from "@/__generated__/ForumApiThreadListQuery.graphql";
import {
  ForumApiThreadDetailQuery,
  ForumApiThreadDetailQuery$data,
} from "@/__generated__/ForumApiThreadDetailQuery.graphql";

export type ThreadListType = NonNullable<
  NonNullable<ForumApiThreadListQuery["response"]["forumByCourseId"]>["threads"]
>;

export type ThreadType = ThreadListType[number];

export type ThreadDetailType = NonNullable<
  NonNullable<ForumApiThreadDetailQuery["response"]["thread"]>
>;

export type PostsType = NonNullable<
  ForumApiThreadDetailQuery$data["thread"]
>["posts"];
export type Post = PostsType[number];
