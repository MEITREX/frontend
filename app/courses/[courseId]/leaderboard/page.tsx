"use client";

import CourseLeaderboards from "@/components/leaderboard/CourseLeaderboard";
import * as React from "react";
import { useCourseData } from "@/components/courses/student/StudentCourseDataContext";

export default function Leaderboard() {

  // Get data from context
  const data = useCourseData();
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