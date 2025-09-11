"use client";

import { useCourseData } from "./StudentCourseDataContext";
import WidgetsOverview from "@/components/widgets/WidgetsOverview";
import { ChapterOverview } from "@/components/ChapterOverview";

export default function StudentOverview() {
  const data = useCourseData();
  const course = data.coursesByIds[0];
  const userId = data.currentUserInfo.id;

  return (
    <>
      <WidgetsOverview userId={userId} courseId={course.id} />
      <ChapterOverview _chapters={course} />
    </>
  );
}