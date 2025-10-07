"use client";
import { PageView, usePageView } from "@/src/currentView";
import { useParams } from "next/navigation";
import { isUUID } from "@/src/utils";
import { PageError } from "@/components/PageError";
import StudentMediaPage from "@/app/courses/[courseId]/media/[mediaId]/student";
import LecturerMediaPage from "@/app/courses/[courseId]/media/[mediaId]/lecturer";

export default function CoursePage() {
  const [pageView, _] = usePageView();
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
