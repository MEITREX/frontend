import {
  Box,
  Typography,
  Stack,
  Avatar,
} from "@mui/material";
import { ForumApiThreadDetailQuery$data } from "@/__generated__/ForumApiThreadDetailQuery.graphql";
import { format } from "date-fns";
import UpvoteDownvote from "@/components/forum/shared/UpvoteDownvote";

type Props = {
  post: NonNullable<ForumApiThreadDetailQuery$data["thread"]>["posts"][number];
};

export default function PostItem({ post }: Props) {


  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: '#fafafa',
      }}
    >
      <Stack direction="row" spacing={2}>
        <UpvoteDownvote
          upvotedByUsers={post.upvotedByUsers ?? post?.upvotedByUsers}
          downvotedByUsers={post.downvotedByUsers ?? post?.downvotedByUsers}
          postId={post?.id ?? post?.id!}
        />
        <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {post.content}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} mt="auto" mb="5px">
            <Avatar sx={{ width: 24, height: 24 }}>
              A
            </Avatar>
            <Typography variant="caption" fontWeight="bold">Toller Author</Typography>
            <Typography variant="caption" color="text.secondary">
              • {format(new Date(post.creationTime as string), "MMMM d, yyyy, hh:mm a")}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
