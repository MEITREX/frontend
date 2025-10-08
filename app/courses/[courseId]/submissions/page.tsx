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
    .flatMap((ch) => {
      const contents = (ch.contents ?? []).filter(
        (c: any) => c?.__typename === "SubmissionAssessment"
      );

      const contentsWithNoSection = (ch.contentsWithNoSection ?? [])
        .filter((c: any) => c?.__typename === "SubmissionAssessment")
        // Nur hinzufügen, wenn sie nicht bereits in contents vorkommen
        .filter((c: any) => !contents.some((x: any) => x.id === c.id));

      return [...contents, ...contentsWithNoSection];
    })
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
