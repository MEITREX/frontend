import { useLazyLoadQuery, graphql } from "react-relay";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { lecturerFindAssignmentQuery } from "@/__generated__/lecturerFindAssignmentQuery.graphql";
import { PageError } from "@/components/PageError";
import CodeAssignment from "@/components/LecturerCodeAssignment";
import { useAccessTokenCheck } from "@/components/useAccessTokenCheck";
import {
  codeAssessmentProvider,
  providerConfig,
} from "@/components/ProviderConfig";
import { CodeAssignmentAccessGuard } from "@/components/CodeAssignmentAccessGuard";

export default function LecturerAssignment() {
  const { assignmentId, courseId } = useParams();
  const { contentsByIds } = useLazyLoadQuery<lecturerFindAssignmentQuery>(
    graphql`
      query lecturerFindAssignmentQuery($id: UUID!) {
        contentsByIds(ids: [$id]) {
          ... on AssignmentAssessment {
            ...LecturerCodeAssignment
            assignment {
              assignmentType
            }
          }
        }
      }
    `,
    { id: assignmentId }
  );

  const content = contentsByIds[0];
  const isCodeAssignment =
    content?.assignment?.assignmentType === "CODE_ASSIGNMENT";

  if (!content)
    return <PageError message="No assignment found with given id." />;

  if (isCodeAssignment) {
    return (
      <CodeAssignmentAccessGuard courseId={courseId}>
        <CodeAssignment contentRef={content} />
      </CodeAssignmentAccessGuard>
    );
  }

  return null;
}
