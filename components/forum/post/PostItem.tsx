import {
  Box,
  Typography,
  Stack,
} from "@mui/material";
import UpvoteDownvote from "@/components/forum/shared/UpvoteDownvote";
import UserPostInformation from "@/components/forum/shared/UserPostInformation";
import { PostsType, ThreadType } from "@/components/forum/types";
import { useLazyLoadQuery } from "react-relay";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import { forumApiUserInfoQuery } from "@/components/forum/api/ForumApi";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
type Props = {
  post: PostsType[number];
  threadCreatorId: ThreadType["creatorId"];
  bestAnswerId?: string | null;
  onMarkAsBest: () => void;
};

export default function PostItem({ post, threadCreatorId, bestAnswerId, onMarkAsBest }: Props) {

  const loggedInUser = useLazyLoadQuery<ForumApiUserInfoQuery>(
    forumApiUserInfoQuery,
    {}
  );

  const isBestAnswer = bestAnswerId === post.id;
  const isThreadAuthor = loggedInUser.currentUserInfo.id === threadCreatorId;

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderColor: isBestAnswer ? '#00c853' : '#e0e0e0',
        borderRadius: 2,
        p: 2,
        mb: 2,
        backgroundColor: isBestAnswer ? '#e8f5e9' : '#fafafa',
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
          <UserPostInformation creationTime={post.creationTime} creatorId={post.authorId}></UserPostInformation>
        </Box>
        {isThreadAuthor && (
          <CheckCircleOutlineOutlinedIcon
            onClick={onMarkAsBest}
            sx={{
              color: isBestAnswer ? 'green' : 'gray',
              cursor: 'pointer',
              fontSize: 28,
              alignSelf: 'start',
            }}
            titleAccess={
              isBestAnswer ? 'Beste Answer' : 'Mark as best Answer'
            }
          />
        )}

        {!isThreadAuthor && isBestAnswer && (
          <CheckCircleOutlineOutlinedIcon sx={{ color: 'green', fontSize: 28 }} titleAccess="Best Answer" />
        )}
      </Stack>
    </Box>
  );
}
