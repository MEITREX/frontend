"use client";

import { PageError } from "@/components/PageError";
import { PageView, PageViewContext } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import { useContext } from "react";
import LecturerMediaPage from "./lecturer";
import StudentMediaPage from "./student";

export default function CoursePage() {
  const { pageView } = useContext(PageViewContext)!;
  const { mediaId, courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id" />;
  }
  if (!isUUID(mediaId)) {
    return <PageError message="Invalid media id" />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentMediaPage />;
    case PageView.Lecturer:
      return <LecturerMediaPage />;
  }
}
