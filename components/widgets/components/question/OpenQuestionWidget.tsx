import { ForumApiOpenQuestionQuery } from "@/__generated__/ForumApiOpenQuestionQuery.graphql";
import { forumApiOpenQuestionQuery } from "@/components/forum/api/ForumApi";
import ThreadList from "@/components/forum/thread/ThreadList";
import { Box } from "@mui/material";
import { useParams, usePathname } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import WidgetFeedback from "@/components/widgets/common/WidgetFeedback";
import { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";

type Props = {
  openFeedback?: boolean;
  category?: GamificationCategory;
};

export default function OpenQuestionWidget({ openFeedback, category }: Props) {
  const params = useParams();
  const pathname = usePathname();
  const courseId = params.courseId as string;

  const data = useLazyLoadQuery<ForumApiOpenQuestionQuery>(
    forumApiOpenQuestionQuery,
    {
      id: courseId,
    },
    { fetchPolicy: "network-only" }
  );

  return (
    <WidgetWrapper title="Open Questions" linkHref={`${pathname}/forum`} linkLabel="Forum">
      <WidgetFeedback openFeedback={openFeedback} category={category} />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {(data.openQuestionByCourseId ?? []).length > 0 ? (
          <ThreadList threads={data.openQuestionByCourseId} />
        ) : (
          <Box sx={{ p: 2, textAlign: "center", color: "gray" }}>
            There are currently no open Questions!
          </Box>
        )}
      </Box>
    </WidgetWrapper>
  );
}
