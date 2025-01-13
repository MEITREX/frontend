"use client";

import { PageError } from "@/components/PageError";
import { PageView, PageViewContext } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import { useContext } from "react";
import LecturerQuiz from "./lecturer";
import StudentQuiz from "./student";

export default function CoursePage() {
  const { pageView } = useContext(PageViewContext)!;
  const { quizId, courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  if (!isUUID(quizId)) {
    return <PageError message="Invalid quiz id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentQuiz />;
    case PageView.Lecturer:
      return <LecturerQuiz />;
  }
}
