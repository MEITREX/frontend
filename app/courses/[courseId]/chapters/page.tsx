"use client";

import { Button, Divider, Typography } from "@mui/material";
import { Repeat } from "@mui/icons-material";
import { Suggestion } from "@/components/Suggestion";
import { orderBy } from "lodash";
import * as React from "react";
import { StudentChapter } from "@/components/StudentChapter";
import { useRouter } from "next/navigation";
import { useCourseData } from "@/components/courses/student/StudentCourseDataContext";

export default function Chapters() {
  const router = useRouter();

  // Get data from context
  const data = useCourseData();
  const course = data.coursesByIds[0];
  const id = course.id;

  return (
    <div className="flex flex-col items-end w-full gap-4">
      <div className="flex flex-col gap-8 w-full">
        <div>
          {/*Up next*/}
          <div className="flex justify-between items-center">
            <Typography variant="h2">Up next</Typography>
            <Button
              startIcon={<Repeat />}
              onClick={() => router.push(`/courses/${id}/flashcards/due`)}
            >
              Repeat learned flashcards
            </Button>
          </div>
          <div className="mt-4 gap-8 flex flex-wrap">
            {course.suggestions.map((x) => (
              <Suggestion
                courseId={course.id}
                key={x.content.id}
                _suggestion={x}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col w-full gap-4">
          <Typography variant="h2">Chapters</Typography>
          <div className="border-2 border-gray-300 rounded-3xl w-full overflow-hidden">
            {orderBy(course.chapters.elements, [
              (x) => new Date(x.startDate).getTime(),
              "number",
            ]).map((chapter, i) => (
              <React.Fragment key={chapter.id}>
                <StudentChapter
                  key={chapter.id}
                  _chapter={chapter}
                  standardExpand={false}
                />
                {i < course.chapters.elements.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}