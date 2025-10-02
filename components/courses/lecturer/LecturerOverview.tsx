"use client";

import { orderBy } from "lodash";
import React from "react";
import { Divider } from "@mui/material";
import { LecturerChapter } from "@/components/courses/lecturer/common/LecturerChapter";
import { useCourseData } from "@/components/courses/context/CourseDataContext";
import {
  LecturerCourseLayoutCourseIdQuery,
  LecturerCourseLayoutCourseIdQuery$data,
} from "@/__generated__/LecturerCourseLayoutCourseIdQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useParams } from "next/navigation";
import { lecturerCourseIdQuery } from "@/components/courses/lecturer/LecturerCourseLayout";
import { PageError } from "@/components/PageError";


export default function LecturerOverview() {
  // We cant use context here -> when navigating to Members and then back an error appreas. Idk why?
  // Therefore refetch...
  /*const data = useCourseData() as LecturerCourseLayoutCourseIdQuery$data;
  const course = data.coursesByIds[0];*/
  const { courseId } = useParams();

  const data = useLazyLoadQuery<LecturerCourseLayoutCourseIdQuery>(
    lecturerCourseIdQuery,
    { courseId }
  );

  const course = data?.coursesByIds?.[0];

  if (!course) {
    return (
      <PageError message="No course found!"/>
    );
  }

  return (
    <div className="border-2 border-gray-300 rounded-3xl w-full overflow-hidden">
      {orderBy(course.chapters?.elements ?? [], [
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
