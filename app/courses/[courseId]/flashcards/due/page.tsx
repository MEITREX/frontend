"use client";

import { PageError } from "@/components/PageError";
import { PageView, PageViewContext } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import { useContext } from "react";
import StudentDueFlashcards from "./student";

export default function CoursePage() {
  const { pageView } = useContext(PageViewContext)!;
  const { courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentDueFlashcards />;
    case PageView.Lecturer:
      return (
        <PageError
          title="Due flashcards"
          message="This page is for students only."
        />
      );
  }
}
