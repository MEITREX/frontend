import { Box, Typography, Stack, Tooltip } from "@mui/material";
import UpvoteDownvote from "../shared/UpvoteDownvote";
import UserPostInformation from "../shared/UserPostInformation";
import { ThreadType } from "@/components/forum/types";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import React from "react";
import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';

type Props = {
  thread: ThreadType;
};

export default function ThreadItem({ thread }: Props) {
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
        },
      }}
    >
      <Stack direction="row" spacing={2}>
        <UpvoteDownvote
          upvotedByUsers={thread.info?.upvotedByUsers ?? thread.question?.upvotedByUsers}
          downvotedByUsers={thread.info?.downvotedByUsers ?? thread.question?.downvotedByUsers}
          postId={thread.info?.id ?? thread.question?.id!}
        />

        <Stack
          direction="column"
          justifyContent="space-between"
          sx={{ flexGrow: 1, overflow: "hidden", position: "relative" }}
        >
          <Box>
            <Typography variant="h6" sx={{ color: "#089CDC", fontWeight: 600 }}>
              {thread.title}
            </Typography>

            <Box sx={{overflow: "hidden",height:"1.5em"}}>
              <ContentViewer htmlContent={thread.question?.content ?? thread.info?.content!}></ContentViewer>
            </Box>

          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <UserPostInformation
              creationTime={thread.creationTime!}
              numberOfPosts={thread.numberOfPosts}
              creatorId={thread.creatorId}
            />
            <Box>
              {thread.info?.content && <Tooltip title="Thread is related to content!">
                <PermMediaOutlinedIcon sx={{ color: 'black', fontSize: 24 }} />
              </Tooltip>}

              {thread.selectedAnswer?.id && <Tooltip title="Best answer selected!">
                <CheckCircleOutlineOutlinedIcon sx={{ color: 'green', fontSize: 28 }} />
              </Tooltip>}
              {thread.info && (
                <Tooltip title="Info Thread">
                  <InfoOutlinedIcon sx={{ fontSize: 28, color: "#1976d2" }} />
                </Tooltip>
              )}
              {thread.question && (
                <Tooltip title="Question Thread">
                  <HelpOutlineIcon sx={{ fontSize: 28, color: "#ff9800" }} />
                </Tooltip>
              )}
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
