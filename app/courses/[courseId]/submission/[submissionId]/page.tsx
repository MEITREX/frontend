"use client";

import { PageError } from "@/components/PageError";
import { PageView, usePageView } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import LecturerSubmission from "./lecturer";
import StudentSubmission from "./student";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  const { quizId, courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  if (!isUUID(quizId)) {
    return <PageError message="Invalid quiz id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentSubmission />;
    case PageView.Lecturer:
      return <LecturerSubmission />;
  }
}
