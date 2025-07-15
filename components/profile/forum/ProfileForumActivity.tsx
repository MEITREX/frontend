import { useLazyLoadQuery } from "react-relay";
import { forumApiForumActivityUserQuery } from "@/components/forum/api/ForumApi";
import { ForumApiForumActivityUserQuery } from "@/__generated__/ForumApiForumActivityUserQuery.graphql";
import { Box, Stack, Typography } from "@mui/material";
import ForumActivity from "@/components/forum/shared/ForumActivity";
import React from "react";


type Props = {
  userId: string;
}

export default function OtherUserProfileForumActivity({userId}:Props) {
  // IM BACKEND Sortieren und für anderen user noch einer über komponente hinzufügen die dann checkt welche komponent genommen wird
  const data = useLazyLoadQuery<ForumApiForumActivityUserQuery>(
    forumApiForumActivityUserQuery,
    {
      id: userId,
    },
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
        Latest Forum Activites
      </Typography>
        {(data.forumActivityByUserId ?? []).length > 0 ? (<Stack spacing={2}>
            {data.forumActivityByUserId.map((a, idx) => (
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