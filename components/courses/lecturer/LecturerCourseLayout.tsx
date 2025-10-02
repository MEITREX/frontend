"use client";

import { Button, IconButton, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";
import React, { useState } from "react";
import { AddChapterModal } from "@/components/AddChapterModal";
import { EditCourseModal } from "@/components/EditCourseModal";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { Add, People, Settings } from "@mui/icons-material";
import { LecturerCourseNavigation } from "@/components/courses/lecturer/LecturerCourseNavigation";
import { LecturerCourseLayoutCourseIdQuery } from "@/__generated__/LecturerCourseLayoutCourseIdQuery.graphql";
import { CourseDataProvider } from "@/components/courses/context/CourseDataContext";

graphql`
  fragment LecturerCourseLayoutFragment on Course {
    id
    title
    description
    ...AddChapterModalFragment
    ...EditCourseModalFragment
    chapters {
      elements {
        id
        startDate
        number
        ...LecturerChapter
      }
    }
    skills {
      id
      skillName
      skillCategory
      isCustomSkill
    }
  }
`;

export const lecturerCourseIdQuery = graphql`
  query LecturerCourseLayoutCourseIdQuery($courseId: UUID!) {
    ...MediaRecordSelector
    currentUserInfo {
      realmRoles
      courseMemberships {
        role
        course {
          id
        }
      }
    }
    coursesByIds(ids: [$courseId]) {
      ...LecturerCourseLayoutFragment @relay(mask: false)
    }
  }
`;

export default function LecturerCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openModal, setOpenModal] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const { courseId } = useParams();
  const router = useRouter();

  const data = useLazyLoadQuery<LecturerCourseLayoutCourseIdQuery>(
    lecturerCourseIdQuery,
    { courseId }
  );

  const course = data.coursesByIds?.[0];
  if (!course) {
    return <PageError message="No course found with given id." />;
  }

  const role = data.currentUserInfo.courseMemberships.find(
    (x) => x.course.id === courseId
  )!.role;

  return (
    <CourseDataProvider value={data}>
      <main>
        {openModal && (
          <AddChapterModal
            open
            _course={course}
            onClose={() => setOpenModal(false)}
          />
        )}
        <Heading
          title={course.title}
          action={
            <div className="flex gap-4 items-center">
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
          }
        />
        <EditCourseModal
          _course={course}
          open={infoDialogOpen}
          onClose={() => setInfoDialogOpen(false)}
        />
        <Typography variant="body2" className="!mt-8 !mb-10">
          {course.description}
        </Typography>
        <LecturerCourseNavigation courseId={courseId as string} />
        <div className="mt-4">{children}</div>
      </main>
    </CourseDataProvider>
  );
}
