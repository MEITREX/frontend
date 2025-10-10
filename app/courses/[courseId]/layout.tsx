"use client";

import { useParams } from "next/navigation";
import { PageView, usePageView } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { PageError } from "@/components/PageError";

import StudentCourseLayout from "@/components/courses/student/StudentCourseLayout";
import LecturerCourseLayout from "@/components/courses/lecturer/LecturerCourseLayout";

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: If necessary, we should also guard the subroutes, but I don't think it's too important at the moment.
  const { courseId } = useParams();
  const [pageView] = usePageView();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentCourseLayout>{children}</StudentCourseLayout>;

    case PageView.Lecturer:
      return <LecturerCourseLayout>{children}</LecturerCourseLayout>;

    default:
      return <PageError message="Could not determine user role." />;
  }
}
