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



const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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
          <Box
            key={idx}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              borderLeft: "4px solid",
              borderLeftColor: "primary.main",
              p: 1,
              "&:hover": {
                backgroundColor: "grey.100",
                cursor: "pointer",
              },
              transition: "background-color 0.2s ease",
            }}
          >
            {!a.post ? (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(a.creationTime as string), "MMMM d, yyyy, hh:mm a")}{" "}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "info.main",
                      fontWeight: "bold",
                    }}
                  >
                    New Thread by –
                  </Typography>
                  <UserPostInformation
                    creationTime={a.creationTime}
                    creatorId={a.thread.creatorId}
                    displayDate={false}
                    displayPB={false}
                  />
                </Box>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{ color: "primary.main", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {a.thread.title}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(a.creationTime as string), "MMMM d, yyyy, hh:mm a")}{" "}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "info.main",
                      fontWeight: "bold",
                    }}
                  >
                    New Answer by –
                  </Typography>

                  <UserPostInformation
                    creationTime={a.creationTime}
                    creatorId={a.post.authorId}
                    displayDate={false}
                    displayPB={false}
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{ fontStyle: "italic",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    mt:"5px"
                  }}

                >
                  Thread: {a.thread.title}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: "italic",
                      whiteSpace: "nowrap",
                      fontSize: "0.9rem",
                    }}
                  >
                    Answer:
                  </Typography>

                  <Box
                    sx={{
                      flexGrow: 1,
                      maxHeight: "1.2em",
                      overflow: "hidden",
                      position: "relative",
                      fontSize: "0.9rem",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <ContentViewer htmlContent={a.post?.content} />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Stack>)
        : (
        <Box sx={{ p: 2, textAlign: 'center', color: 'gray' }}>
      No Activity!
    </Box>)}
    </Box>
  );
}
