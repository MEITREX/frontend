"use client";

import WidgetsOverview from "@/components/widgets/WidgetsOverview";
import { ChapterOverview } from "@/components/ChapterOverview";
import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";
import { useCourseData } from "@/components/courses/context/CourseDataContext";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";
import { useFetchProactiveFeedback } from "@/src/feedbackUtils";
import { useEffect } from "react";

export default function StudentOverview() {
  const data = useCourseData() as StudentCourseLayoutCourseIdQuery$data;
  const course = data.coursesByIds[0];
  const userId = data.currentUserInfo.id;
  const { sendMessage } = useFetchProactiveFeedback();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        sendMessage(course.id)
          .then(() => console.log("Delayed message sent successfully"))
          .catch((err) => console.error("Delayed send failed:", err));
      } catch (err) {
        console.error("Delayed send failed:", err);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [sendMessage, course.id]);

  return (
    <>
      <GamificationGuard>
        <WidgetsOverview userId={userId} courseId={course.id} />
      </GamificationGuard>
      <ChapterOverview _chapters={course} />
    </>
  );
}
