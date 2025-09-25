"use client";

import CourseLeaderboards from "@/components/leaderboard/CourseLeaderboard";
import * as React from "react";
import { useCourseData } from "@/components/courses/context/CourseDataContext";
import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";

export default function Leaderboard() {

  // Get data from context
  const data = useCourseData() as StudentCourseLayoutCourseIdQuery$data;
  const course = data.coursesByIds[0];
  const userId = data.currentUserInfo.id;
  const id = course.id;

  return (
    <CourseLeaderboards
      courseID={id}
      currentUserId={userId}
      currentUserName={"Current User"}
    />
  );
}