import { FlashcardHeaderDeleteFlashcardSetMutation } from "@/__generated__/FlashcardHeaderDeleteFlashcardSetMutation.graphql";
import { FlashcardHeaderFragment$key } from "@/__generated__/FlashcardHeaderFragment.graphql";
import { updaterSetDelete } from "@/src/relay-helpers/common";
import { useConfirmation } from "@/src/useConfirmation";
import { Delete, Edit } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { ContentTags } from "../ContentTags";
import { useError } from "../ErrorContext";
import { FormErrors } from "../FormErrors";
import { Heading } from "../Heading";

const deleteFlashcardMutation = graphql`
  mutation FlashcardHeaderDeleteFlashcardSetMutation($id: UUID!) {
    mutateContent(contentId: $id) {
      deleteContent
    }
  }
`;
const metadataFragment = graphql`
  fragment FlashcardHeaderFragment on Content {
    metadata {
      name
      ...ContentTags
    }
  }
`;

interface Props {
  content: FlashcardHeaderFragment$key;
  openEditFlashcardSetModal: () => void;
}

const LecturerFlashcardHeader = ({
  content,
  openEditFlashcardSetModal,
}: Props) => {
  const { courseId, flashcardSetId } = useParams();
  const router = useRouter();
  const confirm = useConfirmation();

  const { error, setError } = useError();

  const [commitDeleteFlashcard, isDeleteCommitInFlight] =
    useMutation<FlashcardHeaderDeleteFlashcardSetMutation>(
      deleteFlashcardMutation
    );

  const updater = useCallback(() => updaterSetDelete(courseId), [courseId]);
  const deleteFlashcardSet = useCallback(
    () =>
      commitDeleteFlashcard({
        variables: { id: flashcardSetId },
        onCompleted: () => router.push(`/courses/${courseId}`),
        onError: (error) => setError(error),
        updater: updater(),
      }),
    [commitDeleteFlashcard, courseId, flashcardSetId, router, setError, updater]
  );

  const { metadata } = useFragment(metadataFragment, content);

  return (
    <>
      <Heading
        title={metadata.name}
        action={
          <div className="flex gap-2">
            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={openEditFlashcardSetModal}
            >
              Edit Set
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
              onClick={async () => {
                if (
                  await confirm({
                    title: "Confirm Deletion",
                    message:
                      "Do you really want to delete this flashcard set? This can't be undone.",
                  })
                )
                  deleteFlashcardSet();
              }}
            >
              Delete Set
            </Button>
          </div>
        }
        backButton
      />

      <ContentTags metadata={metadata} />

      <FormErrors error={error} onClose={() => setError(null)} />
    </>
  );
};

export default LecturerFlashcardHeader;
