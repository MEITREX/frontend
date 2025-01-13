"use client";

import { PageError } from "@/components/PageError";
import { PageView, PageViewContext } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import { useContext } from "react";
import StudentCourseStatsPage from "./student";

export default function CourseStatisticsPage() {
  const { pageView } = useContext(PageViewContext)!;
  const { courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentCourseStatsPage />;
    case PageView.Lecturer:
      return (
        <PageError
          title="Statistics"
          message="Switch to student view to see your statistics."
        />
      );
  }
}
