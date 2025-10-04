"use client";

import { createContext, useContext } from "react";
import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";
import { LecturerCourseLayoutCourseIdQuery$data } from "@/__generated__/LecturerCourseLayoutCourseIdQuery.graphql";

const CourseDataContext = createContext<
  | StudentCourseLayoutCourseIdQuery$data
  | LecturerCourseLayoutCourseIdQuery$data
  | null
>(null);

export const CourseDataProvider = CourseDataContext.Provider;

export function useCourseData() {
  const context = useContext(CourseDataContext);

  if (context === null) {
    throw new Error("useCourseData must be used within a CourseDataProvider");
  }

  return context;
}
