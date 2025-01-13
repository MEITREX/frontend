"use client";

import { PageError } from "@/components/PageError";
import { PageView, PageViewContext } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import { useContext } from "react";
import EditFlashcards from "./lecturer";
import StudentFlashcards from "./student";

export default function CoursePage() {
  const { pageView } = useContext(PageViewContext)!;
  const { flashcardSetId, courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  if (!isUUID(flashcardSetId)) {
    return <PageError message="Invalid flashcards id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentFlashcards />;
    case PageView.Lecturer:
      return <EditFlashcards />;
  }
}
