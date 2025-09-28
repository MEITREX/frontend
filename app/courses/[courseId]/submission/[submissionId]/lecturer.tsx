
import { lecturerEditSubmissionQuery } from "@/__generated__/lecturerEditSubmissionQuery.graphql";
import { ES2022Error } from "@/components/ErrorContext";
import { PageError } from "@/components/PageError";
import SubmissionsHeader from "@/components/submissions/SubmissionsHeader";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

const RootQuery = graphql`
  query lecturerEditSubmissionQuery($id: UUID!, $courseId: UUID!) {
    ...MediaRecordSelector

    contentsByIds(ids: [$id]) {

      id
      metadata {
        name
        chapterId
        type
      }
      ... on SubmissionAssessment{
        items{
          id

        }
        assessmentMetadata{
          skillPoints
        }
      }


    }
  }
`;

export default function LecturerSubmission() {

  const { submissionId, courseId } = useParams();
    const [error, setError] = useState<ES2022Error | null>(null);
    const errorContext = useMemo(() => ({ error, setError }), [error, setError]);

  const { contentsByIds, ...mediaSelectorQuery } =
      useLazyLoadQuery<lecturerEditSubmissionQuery>(RootQuery, {
        id: submissionId,
        courseId,
      });

  const content = contentsByIds[0];

  console.log(content, "CONTENT")

  function setEditSetModalOpen(arg0: boolean) {
    console.log("Function not implemented. setEditSetModalOpen");
  }

  if (!(content.metadata.type === "SUBMISSION")) {
      return (
        <PageError
          title={content.metadata.name}
          message="Content not of type submission."
        />
      );
    }


  return (
    <SubmissionsHeader
          openEditQuizModal={() => setEditSetModalOpen(true)}
          content={content}
        />
  );
}
