import { ForumApiForumActivityQuery } from "@/__generated__/ForumApiForumActivityQuery.graphql";
import { forumApiForumActivityQuery } from "@/components/forum/api/ForumApi";
import ForumActivity from "@/components/forum/shared/ForumActivity";
import { Box, Stack } from "@mui/material";
import { useParams, usePathname } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import WidgetFeedback from "@/components/widgets/common/WidgetFeedback";
import { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";

type Props = {
  openFeedback?: boolean;
  category?: GamificationCategory;
};

export default function ForumActivityWidget({ openFeedback, category }: Props) {
  const params = useParams();
  const pathname = usePathname();
  const courseId = params.courseId as string;

  const data = useLazyLoadQuery<ForumApiForumActivityQuery>(
    forumApiForumActivityQuery,
    {
      id: courseId,
    },
    { fetchPolicy: "network-only" }
  );

  return (
    <WidgetWrapper title="Forum Activity" linkHref={`${pathname}/forum`} linkLabel="Forum">
      <WidgetFeedback openFeedback={openFeedback} category={category} />
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
