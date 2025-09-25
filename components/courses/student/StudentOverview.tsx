"use client";

import { useCourseData } from "../context/CourseDataContext";
import WidgetsOverview from "@/components/widgets/WidgetsOverview";
import { ChapterOverview } from "@/components/ChapterOverview";
import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";

export default function StudentOverview() {
  const data = useCourseData() as StudentCourseLayoutCourseIdQuery$data;
  const course = data.coursesByIds[0];
  const userId = data.currentUserInfo.id;

  return (
    <>
      <WidgetsOverview userId={userId} courseId={course.id} />
      <ChapterOverview _chapters={course} />
    </>
  );
}