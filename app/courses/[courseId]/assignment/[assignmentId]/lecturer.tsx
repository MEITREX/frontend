import { useLazyLoadQuery, graphql } from "react-relay";
import { useParams } from "next/navigation";
import { lecturerFindAssignmentQuery } from "@/__generated__/lecturerFindAssignmentQuery.graphql";
import { PageError } from "@/components/PageError";
import CodeAssignment from "@/components/LecturerCodeAssignment";

export default function LecturerAssignment() {
  const { assignmentId } = useParams();

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
  if (!content) {
    return <PageError message="No quiz found with given id." />;
  }

  if (content.assignment?.assignmentType === "CODE_ASSIGNMENT") {
    content;
    return <CodeAssignment contentRef={content} />;
  }

  return <div>unknown</div>;
}
