"use client";

import { pageLecturerCourseIdQuery } from "@/__generated__/pageLecturerCourseIdQuery.graphql";
import SkeletonThreadList from "@/components/forum/skeleton/SkeletonThreadList";
import LecturerSubmissionsList from "@/components/submissions/LecturerSubmissionsList";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function Forum() {
  const { courseId } = useParams();

  const { coursesByIds, ...query } =
    useLazyLoadQuery<pageLecturerCourseIdQuery>(
      graphql`
        query pageLecturerCourseIdQuery($courseId: UUID!) {
          coursesByIds(ids: [$courseId]) {
            ...lecturerCourseFragment @relay(mask: false)

            chapters {
              elements {
                id
                contents {
                  __typename
                  ... on SubmissionAssessment {
                    id
                    metadata {
                      name
                      type
                    }
                  }
                }
                contentsWithNoSection {
                  __typename
                  ... on SubmissionAssessment {
                    id
                    metadata {
                      name
                      type
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { courseId }
    );

  const course = coursesByIds[0];

  const submissionAssessments = course.chapters.elements
    .flatMap((ch) => [
      ...(ch.contents ?? []),
      ...(ch.contentsWithNoSection ?? []),
    ])
    .filter((c: any) => c?.__typename === "SubmissionAssessment")
    .map((c: any) => ({
      assessmentId: c.id,
      name: c.metadata?.name ?? "Submission",
    }));

  return (
    <Suspense fallback={<SkeletonThreadList />}>
      <LecturerSubmissionsList
        courseId={courseId}
        submissions={submissionAssessments}
      />
    </Suspense>
  );
}
