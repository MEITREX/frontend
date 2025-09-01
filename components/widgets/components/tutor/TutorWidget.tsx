"use client";

import type { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";
import WidgetFeedback from "@/components/widgets/common/WidgetFeedback";
import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import { Box, CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import TutorWidgetInner from "./TutorWidgetInner";

export default function TutorWidgetShell({
  openFeedback,
  category,
}: {
  openFeedback?: boolean;
  category?: GamificationCategory;
}) {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <WidgetWrapper
      title="AI Tutor"
      linkHref="/items/lottery"
      linkLabel="AI TUTOR"
      overflow="auto"
    >
      <WidgetFeedback openFeedback={openFeedback} category={category} />
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300, // gleiche Höhe wie dein Widget
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <TutorWidgetInner courseId={courseId} />
      </Suspense>
    </WidgetWrapper>
  );
}
