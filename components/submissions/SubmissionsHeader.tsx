import { SubmissionsHeaderDeleteSubmissionMutation } from "@/__generated__/SubmissionsHeaderDeleteSubmissionMutation.graphql";
import { updaterSetDelete } from "@/src/relay-helpers/common";
import { Delete, Edit } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { graphql, useMutation } from "react-relay";
import { useError } from "../ErrorContext";
import { Heading } from "../Heading";

const deleteSubmissionMutation = graphql`
  mutation SubmissionsHeaderDeleteSubmissionMutation($id: UUID!) {
    mutateContent(contentId: $id) {
      deleteContent
    }
  }
`;

type Props = {
  content: any;
  openEditSubmissionModal: () => void;
};

export default function SubmissionsHeader({
  content,
  openEditSubmissionModal,
}: Props) {
  const { courseId, submissionId } = useParams();
  const router = useRouter();

  const [commitDeleteSubmission, isDeleteCommitInFlight] =
    useMutation<SubmissionsHeaderDeleteSubmissionMutation>(
      deleteSubmissionMutation
    );

  const { error, setError } = useError();

  const updater = useCallback(() => updaterSetDelete(courseId), [courseId]);

  const deleteSubmission = useCallback(
    () =>
      commitDeleteSubmission({
        variables: { id: submissionId },
        onCompleted: () => router.push(`/courses/${courseId}`),
        onError: (error) => setError(error),
        updater: updater(),
      }),
    [commitDeleteSubmission, courseId, submissionId, router, setError, updater]
  );

  return (
    <>
      <Heading
        title={content.metadata.name}
        action={
          <div className="flex gap-2">
            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={openEditSubmissionModal}
            >
              Edit Submission
            </Button>

            <Button
              sx={{ color: "text.secondary" }}
              startIcon={
                isDeleteCommitInFlight ? (
                  <CircularProgress size={16} />
                ) : (
                  <Delete />
                )
              }
              onClick={() => {
                if (
                  confirm(
                    "Do you really want to delete this submission? This can't be undone."
                  )
                )
                  deleteSubmission();
              }}
            >
              Delete Submission
            </Button>
          </div>
        }
        backButton
      />

      {/**<ContentTags metadata={metadata} />*/}

      {/**<FormErrors error={error} onClose={() => setError(null)} />*/}
    </>
  );
}
