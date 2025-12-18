"use client";

import WidgetsOverview from "@/components/widgets/WidgetsOverview";
import { ChapterOverview } from "@/components/ChapterOverview";
import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";
import { useCourseData } from "@/components/courses/context/CourseDataContext";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";

export default function StudentOverview() {
  const data = useCourseData() as StudentCourseLayoutCourseIdQuery$data;
  const course = data.coursesByIds[0];
  const userId = data.currentUserInfo.id;

  return (
    <>
      <GamificationGuard>
        <WidgetsOverview userId={userId} courseId={course.id} />
      </GamificationGuard>
      <ChapterOverview _chapters={course} />
    </>
  );
}
