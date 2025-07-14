import { useLazyLoadQuery } from "react-relay";
import { forumApiForumActivityUserQuery } from "@/components/forum/api/ForumApi";
import { ForumApiForumActivityUserQuery } from "@/__generated__/ForumApiForumActivityUserQuery.graphql";
import { Box, Stack } from "@mui/material";
import ForumActivity from "@/components/forum/shared/ForumActivity";
import React from "react";


type Props = {
  userId: string;
}

export default function ProfileForumActivity({userId}:Props) {
  // IM BACKEND Sortieren und für anderen user noch einer über komponente hinzufügen die dann checkt welche komponent genommen wird
  const data = useLazyLoadQuery<ForumApiForumActivityUserQuery>(
    forumApiForumActivityUserQuery,
    {
      id: userId,
    },
    { fetchPolicy: "network-only" }
  );

  return (
    <Box sx={{
      height:"50vh",
      overflowY:"auto",
    }}>
      {(data.forumActivityByUserId ?? []).length > 0 ? (<Stack spacing={2}>
          {data.forumActivityByUserId!.map((a, idx) => (
            <ForumActivity data={a} key={idx} />
          ))}
        </Stack>)
        : (
          <Box sx={{ p: 2, textAlign: 'center', color: 'gray' }}>
            No Activity!
          </Box>)}
    </Box>
  )
}