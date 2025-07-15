"use client";

import { PageError } from "@/components/PageError";
import { PageView, usePageView } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import LecturerAssignment from "./lecturer";
import StudentAssignment from "./student";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  const { assignmentId, courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  if (!isUUID(assignmentId)) {
    return <PageError message="Invalid assignment id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentAssignment />;
    case PageView.Lecturer:
      return <LecturerAssignment />;
  }
}
