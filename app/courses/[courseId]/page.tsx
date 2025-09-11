"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentOverview from "../../../components/courses/student/StudentOverview";
import LecturerOverview from "@/components/courses/lecturer/LecturerOverview";

export default function CoursePage() {
  const [pageView] = usePageView();

  switch (pageView) {
    case PageView.Student:
      return <StudentOverview />;

    case PageView.Lecturer:
      return <LecturerOverview />;
  }
}