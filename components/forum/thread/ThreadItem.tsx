import { Box, Typography, Stack } from "@mui/material";
import UpvoteDownvote from "../shared/UpvoteDownvote";
import UserPostInformation from "../shared/UserPostInformation";
import { ThreadType } from "@/components/forum/types";
import React from "react";
import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import ThreadStatusIcons from "@/components/forum/thread/ThreadStatusIcons";

type Props = {
  thread: ThreadType;
  onThreadClick?: (threadId: string) => void;
};

export default function ThreadItem({ thread, onThreadClick }: Props) {
  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 2,
        mb: 1,
        backgroundColor: "#fff",
        display: "block",
        textDecoration: "none",
        color: "inherit",
        transition: "0.2s",
        "&:hover": {
          backgroundColor: "#f5f5f5",
          cursor: "pointer",
        },
      }}
    >
      <Stack direction="row" spacing={2}>
        <UpvoteDownvote
          upvotedByUsers={
            thread.info?.upvotedByUsers ?? thread.question?.upvotedByUsers
          }
          downvotedByUsers={
            thread.info?.downvotedByUsers ?? thread.question?.downvotedByUsers
          }
          postId={thread.info?.id ?? thread.question?.id!}
        />

        <Stack
          direction="column"
          justifyContent="space-between"
          sx={{ flexGrow: 1, overflow: "hidden", position: "relative" }}
        >
          <Box onClick={() => onThreadClick?.(thread.id)}>
            <Typography variant="h6" sx={{ color: "#089CDC", fontWeight: 600 }}>
              {thread.title}
            </Typography>

            <Box sx={{ overflow: "hidden", height: "1.5em" }}>
              <ContentViewer
                htmlContent={thread.question?.content ?? thread.info?.content!}
              ></ContentViewer>
            </Box>
          </Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <UserPostInformation
              creationTime={thread.creationTime!}
              numberOfPosts={thread.numberOfPosts}
              creatorId={thread.creatorId}
            />
            <ThreadStatusIcons thread={thread} />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
