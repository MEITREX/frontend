"use client";

import { PageView, PageViewContext } from "@/src/currentView";
import { useContext } from "react";
import LecturerPage from "./lecturer";
import StudentPage from "./student";

export default function CoursePage() {
  const { pageView } = useContext(PageViewContext)!;
  switch (pageView) {
    case PageView.Student:
      return <StudentPage />;
    case PageView.Lecturer:
      return <LecturerPage />;
  }
}
