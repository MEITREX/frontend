import {
  Box,
  Typography,
  Stack,
  Tooltip
} from "@mui/material";
import UpvoteDownvote from "@/components/forum/shared/UpvoteDownvote";
import UserPostInformation from "@/components/forum/shared/UserPostInformation";
import { PostsType, ThreadType } from "@/components/forum/types";
import { useLazyLoadQuery } from "react-relay";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import { forumApiUserInfoQuery } from "@/components/forum/api/ForumApi";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useState } from "react";
import EditableContent from "@/components/forum/richTextEditor/EditableContent";
type Props = {
  post: PostsType[number];
  threadCreatorId: ThreadType["creatorId"];
  bestAnswerId?: string | null;
  onMarkAsBest: () => void;
};

export default function PostItem({ post, threadCreatorId, bestAnswerId, onMarkAsBest }: Props) {
  const [isEditing, setIsEditing] = useState(false);

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
        position:"relative",
      }}
    >
      <Stack direction="row" spacing={2}>
        <UpvoteDownvote
          upvotedByUsers={post?.upvotedByUsers}
          downvotedByUsers={post?.downvotedByUsers}
          postId={post?.id}
        />
        <Box flex={1} display="flex" flexDirection="column" justifyContent="space-between">

          <EditableContent authorId={post?.authorId} initialContent={post.content} postId={post?.id}></EditableContent>

          <UserPostInformation creationTime={post.creationTime} creatorId={post.authorId}></UserPostInformation>
        </Box>
        {isThreadAuthor && (
          <Tooltip title={isBestAnswer ? 'Best answer!' : 'Mark as best answer!'}>
            <CheckCircleOutlineOutlinedIcon
              onClick={onMarkAsBest}
              sx={{
                color: isBestAnswer ? 'green' : 'gray',
                cursor: 'pointer',
                fontSize: 28,
                alignSelf: 'start',
              }}
            />
          </Tooltip> )}
        {!isThreadAuthor && isBestAnswer && (
          <Tooltip title="Best answer!">
            <CheckCircleOutlineOutlinedIcon sx={{ color: 'green', fontSize: 28 }} />
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}
