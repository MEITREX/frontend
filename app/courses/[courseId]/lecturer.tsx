"use client";

import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import { lecturerGenerateAccessTokenMutation } from "@/__generated__/lecturerGenerateAccessTokenMutation.graphql";
import { lecturerAccessTokenQuery } from "@/__generated__/lecturerAccessTokenQuery.graphql";
import { Button, IconButton, Typography } from "@mui/material";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

import { AddChapterModal } from "@/components/AddChapterModal";
import { EditCourseModal } from "@/components/EditCourseModal";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { Add, People, Settings } from "@mui/icons-material";
import { orderBy } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LecturerChapter } from "./LecturerChapter";
import { codeAssessmentProvider } from "@/components/ProviderConfig";
import { ro } from "date-fns/locale";

graphql`
  fragment lecturerCourseFragment on Course {
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
  }
`;

export default function LecturerCoursePage() {
  const router = useRouter();
  const pathname = usePathname();

  // Get course id from url
  const { courseId } = useParams();

  // Authorization code from external provider
  const code = useSearchParams().get("code");
  const [commitGenerateAccessToken] = useMutation<lecturerGenerateAccessTokenMutation>(
    graphql`
      mutation lecturerGenerateAccessTokenMutation($input: GenerateAccessTokenInput!) {
        generateAccessToken(input: $input)
      }
    `
  );

  const { isAccessTokenAvailable } = useLazyLoadQuery<lecturerAccessTokenQuery>(
      graphql`
        query lecturerAccessTokenQuery($provider: ExternalServiceProviderDto!) {
          isAccessTokenAvailable(provider: $provider)
        }
      `,
      { provider: codeAssessmentProvider },
    );

  const hasRun = useRef(false);

  useEffect(() => {
    if (!code || hasRun.current || isAccessTokenAvailable) return;
  
    hasRun.current = true;

    commitGenerateAccessToken({
      variables: {
        input: {
          provider: codeAssessmentProvider,
          authorizationCode: code,
        },
      },
      onCompleted: (response) => {
        if (response.generateAccessToken) {
          console.log("Access token generated successfully.");
          router.replace(pathname, { scroll: false });
        }
      },
      onError: (err) => {
        console.error("Failed to generate token", err);
      },
    });
  }, []);

  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Fetch course data
  const { coursesByIds, currentUserInfo, ...query } =
    useLazyLoadQuery<lecturerLecturerCourseIdQuery>(
      graphql`
        query lecturerLecturerCourseIdQuery($courseId: UUID!) {
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
            ...lecturerCourseFragment @relay(mask: false)
          }
        }
      `,
      { courseId }
    );

  const [openModal, setOpenModal] = useState(false);

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
  }

  // Extract course
  const course = coursesByIds[0];
  const role = currentUserInfo.courseMemberships.find(
    (x) => x.course.id === courseId
  )!.role;

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <main>
      {openModal && (
        <AddChapterModal open _course={course} onClose={handleCloseModal} />
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

      {orderBy(course.chapters.elements, [
        (x) => new Date(x.startDate).getTime(),
        "number",
      ]).map((chapter) => (
        <LecturerChapter
          _mediaRecords={query}
          _chapter={chapter}
          key={chapter.id}
        />
      ))}
    </main>
  );
}
