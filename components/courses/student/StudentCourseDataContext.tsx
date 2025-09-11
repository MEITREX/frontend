"use client";

import { createContext, useContext } from "react";
import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";

const StudentCourseDataContext = createContext<StudentCourseLayoutCourseIdQuery$data | null>(null);

export const CourseDataProvider = StudentCourseDataContext.Provider;

export function useCourseData() {
  const context = useContext(StudentCourseDataContext);

  if (context === null) {
    throw new Error("useCourseData must be used within a CourseDataProvider");
  }

  return context;
}