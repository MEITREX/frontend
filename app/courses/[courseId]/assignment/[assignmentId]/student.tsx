import { useLazyLoadQuery, graphql } from "react-relay";
import { useParams } from "next/navigation";
import { studentFindAssignmentQuery } from "@/__generated__/studentFindAssignmentQuery.graphql";
import { PageError } from "@/components/PageError";
import CodeAssignment from "@/components/StudentCodeAssignment";

export default function StudentAssignment() {
  const { assignmentId } = useParams();

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
  if (!content) {
    return <PageError message="No quiz found with given id." />;
  }

  if (content.assignment?.assignmentType === "CODE_ASSIGNMENT") {
    content;
    return <CodeAssignment contentRef={content} />;
  }

  return <div>unknown</div>;
}
