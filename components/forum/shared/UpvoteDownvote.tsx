import { IconButton, Stack, Typography } from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { useLazyLoadQuery, useMutation } from "react-relay";
import { ForumApiUserInfoQuery } from "@/__generated__/ForumApiUserInfoQuery.graphql";
import {
  forumApiDownvotePostMutation, forumApiUpvotePostMutation,
  forumApiUserInfoQuery
} from "@/components/forum/api/ForumApi";
import { ForumApiUpvotePostMutation } from "@/__generated__/ForumApiUpvotePostMutation.graphql";
import { ForumApiDownvotePostMutation } from "@/__generated__/ForumApiDownvotePostMutation.graphql";
import { useState } from "react";

type Props = {
  upvotedByUsers?: readonly (string | null)[];
  downvotedByUsers?: readonly (string | null)[];
  postId: string;
};

export default function UpvoteDownvote({ upvotedByUsers = [], downvotedByUsers = [], postId }: Props) {
  const [localUpvotes, setLocalUpvotes] = useState<string[]>(upvotedByUsers as string[]);
  const [localDownvotes, setLocalDownvotes] = useState<string[]>(downvotedByUsers as string[]);

  const [upvotePost] = useMutation<ForumApiUpvotePostMutation>(forumApiUpvotePostMutation);
  const [downvotePost] = useMutation<ForumApiDownvotePostMutation>(forumApiDownvotePostMutation);

  const user = useLazyLoadQuery<ForumApiUserInfoQuery>(
    forumApiUserInfoQuery,
    {}
  );
  const currentUserId = user.currentUserInfo.id;

  const hasUpvoted = localUpvotes.includes(currentUserId);
  const hasDownvoted = localDownvotes.includes(currentUserId);


  const handleUpvote = () => {
    if(hasUpvoted) return; // Not possible atm
    setLocalUpvotes([...localUpvotes, currentUserId])
    if(hasDownvoted) {
      setLocalDownvotes(localDownvotes.filter(id => id !== currentUserId));
    }

    upvotePost({
      variables: {postId: postId},
      onCompleted(data) {
        console.log("Upvote successful!")
      },
      onError(error) {
        console.error("Upvote unsuccessful!", error);
      },
    })
  }

  const handleDownvote = () => {
    if(hasDownvoted) return; // Not possible atm
    setLocalDownvotes([...localDownvotes, currentUserId])
    if(hasUpvoted) {
      setLocalUpvotes(localUpvotes.filter(id => id !== currentUserId));
    }

    downvotePost({
      variables: {postId: postId},
      onCompleted(data) {
        console.log("Upvote successful!")
      },
      onError(error) {
        console.error("Upvote unsuccessful!", error);
      },
    })

  }

  if (upvotedByUsers == null || downvotedByUsers == null) {
    return null;
  }

  return (
    <Stack
      justifyContent="space-between"
      alignItems="center"
      sx={{ height: '100%' }}
    >
      <IconButton onClick={handleUpvote} size="small" color={hasUpvoted ? "primary" : "default"} aria-label="upvote">
        <ArrowUpward />
      </IconButton>

      <Typography fontWeight="bold">
        {localUpvotes.length - localDownvotes.length}
      </Typography>

      <IconButton onClick={handleDownvote} size="small" color={hasDownvoted ? "secondary" : "default"} aria-label="downvote">
        <ArrowDownward />
      </IconButton>
    </Stack>
  );
}
