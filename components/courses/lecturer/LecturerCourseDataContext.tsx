"use client";

import { createContext, useContext } from "react";
import { LecturerCourseLayoutCourseIdQuery$data } from "@/__generated__/LecturerCourseLayoutCourseIdQuery.graphql";

const LecturerDataContext = createContext<LecturerCourseLayoutCourseIdQuery$data | null>(null);

export const LecturerDataProvider = LecturerDataContext.Provider;

export function useLecturerCourseData() {
  const context = useContext(LecturerDataContext);
  if (!context) {
    throw new Error("useLecturerCourseData must be used within a LecturerDataProvider");
  }
  return context;
}