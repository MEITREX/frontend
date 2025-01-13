"use client";

import { PageView, PageViewContext } from "@/src/currentView";
import NewCourse from "./lecturer";
import { PageError } from "@/components/PageError";
import { useContext } from "react";

export default function CoursePage() {
  const { pageView } = useContext(PageViewContext)!;
  switch (pageView) {
    case PageView.Student:
      return (
        <PageError
          title="Create course"
          message="Only lecturers can create courses."
        />
      );
    case PageView.Lecturer:
      return <NewCourse />;
  }
}
