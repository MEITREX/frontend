"use client";

import { PageError } from "@/components/PageError";
import { PageView, usePageView } from "@/src/currentView";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import StudentSkills from "./student";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  const { courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentSkills />;
  }
}