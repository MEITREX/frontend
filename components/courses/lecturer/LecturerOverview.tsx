"use client";

import { orderBy } from "lodash";
import React, { useState } from "react";
import { Button, Divider, IconButton } from "@mui/material";
import { LecturerChapter } from "@/components/courses/lecturer/common/LecturerChapter";
import { LecturerCourseLayoutCourseIdQuery } from "@/__generated__/LecturerCourseLayoutCourseIdQuery.graphql";
import { useLazyLoadQuery } from "react-relay";
import { useParams, useRouter } from "next/navigation";
import { lecturerCourseIdQuery } from "@/components/courses/lecturer/LecturerCourseLayout";
import { PageError } from "@/components/PageError";
import { CodeAssessmentProviderCourseButton } from "@/components/CodeAssessmentProviderCourseButton";
import { Add, People, Settings } from "@mui/icons-material";
import { AddChapterModal } from "@/components/AddChapterModal";
import { EditCourseModal } from "@/components/EditCourseModal";

export default function LecturerOverview() {
  const [openModal, setOpenModal] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const router = useRouter();

  // We cant use context here -> when navigating to Members and then back an error appreas. Idk why?
  // Therefore refetch...
  /*const data = useCourseData() as LecturerCourseLayoutCourseIdQuery$data;
  const course = data.coursesByIds[0];*/
  const { courseId } = useParams();

  const data = useLazyLoadQuery<LecturerCourseLayoutCourseIdQuery>(
    lecturerCourseIdQuery,
    { courseId }
  );

  const role = data.currentUserInfo.courseMemberships.find(
    (x) => x.course.id === courseId
  )!.role;

  const course = data?.coursesByIds?.[0];

  if (!course) {
    return <PageError message="No course found!" />;
  }

  return (
    <>
      {openModal && (
        <AddChapterModal
          open
          _course={course}
          onClose={() => setOpenModal(false)}
        />
      )}
      <EditCourseModal
        _course={course}
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      />
      <div className="flex justify-end">
        <div className="flex gap-4 items-center">
          <CodeAssessmentProviderCourseButton courseId={courseId} />
          <Button startIcon={<Add />} onClick={() => setOpenModal(true)}>
            Add chapter
          </Button>
          {role === "ADMINISTRATOR" && (
            <Button
              startIcon={<People />}
              onClick={() => router.push(`/courses/${courseId}/members`)}
            >
              Members
            </Button>
          )}
          <IconButton onClick={() => setInfoDialogOpen(true)}>
            <Settings />
          </IconButton>
        </div>
      </div>

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
    </>
  );
}
