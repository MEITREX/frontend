import { Box, Typography } from '@mui/material';
import PostItem from './PostItem';
import { ForumApiThreadDetailQuery$data } from "@/__generated__/ForumApiThreadDetailQuery.graphql";

type PostsType = NonNullable<ForumApiThreadDetailQuery$data["thread"]>["posts"];

type Props = {
  posts: PostsType;
};


export default function PostList({posts }: Props) {
  if (posts.length === 0) {
    return <Typography variant="body2" color="text.secondary">No Answers.</Typography>;
  }

  return (
    <Box sx={{overflowY:'scroll'}}>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </Box>
  );
}
