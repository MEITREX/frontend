import { Box, Button, Divider, Grid, Stack, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { useLazyLoadQuery, useQueryLoader } from "react-relay";
import { ForumApiOpenQuestionQuery } from "@/__generated__/ForumApiOpenQuestionQuery.graphql";
import { forumApiForumActivityQuery, forumApiOpenQuestionQuery } from "@/components/forum/api/ForumApi";
import { useParams } from "next/navigation";
import { ForumApiForumActivityQuery } from "@/__generated__/ForumApiForumActivityQuery.graphql";
import ContentViewer from "../forum/richTextEditor/ContentViewer";
import UserPostInformation from "@/components/forum/shared/UserPostInformation";
import React from "react";
import { format } from "date-fns";
import ForumActivity from "@/components/forum/shared/ForumActivity";


export default function ForumActivityWidget(){
  const params = useParams();
  const courseId = params.courseId as string;


  const data = useLazyLoadQuery<ForumApiForumActivityQuery>(
    forumApiForumActivityQuery,
    {
      id: courseId,
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
        minHeight: 400,
        maxWidth: 450,
        maxHeight: 400,
        overflowY: "auto",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Forum Activity</Typography>
        <Link href="/profile" passHref>
          <Button
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: "#009bde",
              color: "white",
              "&:hover": {
                backgroundColor: "#3369ad",
              },
            }}
          >
            Forum
          </Button>
        </Link>
      </Box>
      {(data.forumActivity ?? []).length > 0 ? (<Stack spacing={2}>
        {data.forumActivity.map((a, idx) => (
          <ForumActivity data={a} key={a.post?.id || a.thread?.id || idx} />
        ))}
      </Stack>)
        : (
        <Box sx={{ p: 2, textAlign: 'center', color: 'gray' }}>
      No Activity!
    </Box>)}
    </Box>
  );
}
