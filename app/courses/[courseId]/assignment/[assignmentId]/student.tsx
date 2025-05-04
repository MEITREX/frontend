import { useLazyLoadQuery, graphql } from "react-relay";
import { useParams } from "next/navigation";
import { studentFindAssignmentQuery } from "@/__generated__/studentFindAssignmentQuery.graphql";
import { PageError } from "@/components/PageError";
import CodeAssignment from "@/components/StudentCodeAssignment";
import { CodeAssignmentAccessGuard } from "@/components/CodeAssignmentAccessGuard";

export default function StudentAssignment() {
  const { assignmentId, courseId } = useParams();
  const { contentsByIds } = useLazyLoadQuery<studentFindAssignmentQuery>(
    graphql`
      query studentFindAssignmentQuery($id: UUID!) {
        contentsByIds(ids: [$id]) {
          ... on AssignmentAssessment {
            ...StudentCodeAssignment
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

  if (!content) {
    return <PageError message="No assignment found with given id." />;
  }

  if (isCodeAssignment) {
    return (
      <CodeAssignmentAccessGuard courseId={courseId}>
        <CodeAssignment contentRef={content} />
      </CodeAssignmentAccessGuard>
    );
  }

  return null;
}
