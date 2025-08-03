import { ForumApiOpenQuestionQuery } from "@/__generated__/ForumApiOpenQuestionQuery.graphql";
import { forumApiOpenQuestionQuery } from "@/components/forum/api/ForumApi";
import ThreadList from "@/components/forum/thread/ThreadList";
import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";

export default function OpenQuestionWidget() {
  const params = useParams();
  const courseId = params.courseId as string;

  const data = useLazyLoadQuery<ForumApiOpenQuestionQuery>(
    forumApiOpenQuestionQuery,
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
        p: 1,
        mb: 2,
        maxWidth: 450,
        maxHeight: 400,
        minHeight: 400,
        overflowY: "auto",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography mt={1} ml={1} variant="h6">
          Open Question
        </Typography>
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
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {(data.openQuestionByCourseId ?? []).length > 0 ? (
          <ThreadList threads={data.openQuestionByCourseId} />
        ) : (
          <Box sx={{ p: 2, textAlign: "center", color: "gray" }}>
            There are currently no open Questions!
          </Box>
        )}
      </Box>
    </Box>
  );
}
