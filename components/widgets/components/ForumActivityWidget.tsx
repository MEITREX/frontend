import { ForumApiForumActivityQuery } from "@/__generated__/ForumApiForumActivityQuery.graphql";
import { forumApiForumActivityQuery } from "@/components/forum/api/ForumApi";
import ForumActivity from "@/components/forum/shared/ForumActivity";
import { Box, Stack } from "@mui/material";
import { useParams } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";

export default function ForumActivityWidget() {
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
    <WidgetWrapper title="Forum Activity" linkHref="/profile" linkLabel="Forum">
      {(data.forumActivity ?? []).length > 0 ? (
        <Stack spacing={2}>
          {data.forumActivity.map((a, idx) => (
            <ForumActivity data={a} key={a.post?.id || a.thread?.id || idx} />
          ))}
        </Stack>
      ) : (
        <Box sx={{ p: 2, textAlign: "center", color: "gray" }}>
          No Activity!
        </Box>
      )}
    </WidgetWrapper>
  );
}
