"use client";

import { orderBy } from "lodash";
import React from "react";
import { Divider } from "@mui/material";
import { LecturerChapter } from "@/components/courses/lecturer/common/LecturerChapter";
import { useLecturerCourseData } from "@/components/courses/lecturer/LecturerCourseDataContext";

export default function LecturerOverview() {
  const data = useLecturerCourseData();
  const course = data.coursesByIds[0];

  return (
    <div className="border-2 border-gray-300 rounded-3xl w-full overflow-hidden">
      {orderBy(course.chapters.elements, [
        (x) => new Date(x.startDate).getTime(),
        "number",
      ]).map((chapter, i) => (
        <React.Fragment key={chapter.id}>
          <LecturerChapter
            _mediaRecords={data}
            _chapter={chapter}
            key={chapter.id}
          />
          {i < course.chapters.elements.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </div>
  );
}