import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Avatar,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import PostList from "../post/PostList";
import { useMutation } from "react-relay";
import { forumApiAddPostMutation } from "@/components/forum/api/ForumApi";
import { ForumApiAddPostMutation, InputPost } from "@/__generated__/ForumApiAddPostMutation.graphql";
import UpvoteDownvote from "@/components/forum/shared/UpvoteDownvote";
import UserPostInformation from "@/components/forum/shared/UserPostInformation";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

type Props = {
  thread: any; // Change type
  courseId: string;
};

export default function ThreadDetail({thread, courseId}: Props) {

  const [replyText, setReplyText] = useState('');


  const [commitPost] = useMutation<ForumApiAddPostMutation>(forumApiAddPostMutation);

  const handleSubmit = () => {
    const replyTextTrimmed = replyText.trim();
    if (replyTextTrimmed === '') return;

    const post: InputPost = {
      content: replyTextTrimmed,
      threadId: thread?.id
    }

    commitPost({
      variables:{post: post},
      onCompleted(data) {
       // set post for refresh?!?!?!
      },
      onError(error) {
        console.error("Replay failed:", error);
      },
    })
    setReplyText('');
  };


  return (
    <>
      <Link href={`/courses/${courseId}/forum`} passHref>
        <Button
          component="a"
          variant="text"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      </Link>
      <Box
        sx={{
          height: "70vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          px: 1,
          pt: 1,
          backgroundColor: "#fff",
          borderRadius: 2,
        }}
      >
        <Stack
          sx={{ backgroundColor: "#f5f7fa", borderRadius: 2, p: 2 }}
          direction="row"
          spacing={2}
        >
          <UpvoteDownvote
            upvotedByUsers={thread?.info?.upvotedByUsers ?? thread?.question?.upvotedByUsers}
            downvotedByUsers={thread?.info?.downvotedByUsers ?? thread?.question?.downvotedByUsers}
            postId={thread?.info?.id ?? thread?.question?.id!}
          />

          <Box flex={1}>
            <Typography variant="h5" gutterBottom>
              {thread?.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {thread?.question?.content ??
                thread?.info?.content ??
                "No content"}
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              {thread.creationTime && <UserPostInformation
                creationTime={thread.creationTime}
                numberOfPosts={thread.numberOfPosts}
                creatorId={thread.creatorId}
              />}
              {thread.info && (
                <InfoOutlinedIcon sx={{ fontSize: 28, color: "#1976d2" }} />
              )}
              {thread.question && (
                <HelpOutlineIcon sx={{ fontSize: 28, color: "#ff9800" }} />
              )}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <PostList threadCreatorId={thread?.creatorId} posts={thread?.posts ?? []} ></PostList>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            label="Answer"
            multiline
            minRows={1}
            maxRows={6}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            variant="outlined"
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!replyText.trim()}
            sx={{ height: "fit-content" }}
          >
            Answer
          </Button>
        </Box>
      </Box>
    </>
  );
}
