import { useParams, usePathname } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import { forumApiOtherUserForumActivityQuery } from "@/components/forum/api/ForumApi";
import { Box, Stack, Typography } from "@mui/material";
import ForumActivity from "@/components/forum/shared/ForumActivity";
import React from "react";
import { ForumApiOtherUserForumActivityQuery } from "@/__generated__/ForumApiOtherUserForumActivityQuery.graphql";

export default function OtherUserProfileForumActivity(){
  const params = useParams();

  const otherUserId = params.userId as string;

  const data = useLazyLoadQuery<ForumApiOtherUserForumActivityQuery>(
    forumApiOtherUserForumActivityQuery,
    { id: otherUserId },
    { fetchPolicy: "network-only" }
  );

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 2,
        mb: 4,
        height:"60vh",
        overflowY:"auto",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Latest Forum Activities (only showing activity from forums shared with you)
      </Typography>
      {(data.otherUserForumActivityByUserId ?? []).length > 0 ? (<Stack spacing={2}>
          {data.otherUserForumActivityByUserId.map((a, idx) => (
            <ForumActivity courseId={a.courseId} data={a} key={idx} />
          ))}
        </Stack>)
        : (
          <Box sx={{ p: 2, textAlign: 'center', color: 'gray' }}>
            No Activity!
          </Box>)}
    </Box>
  )
}