import { LecturerFlashcardHeadingDeleteAllFlashcardContentMutation } from "@/__generated__/LecturerFlashcardHeadingDeleteAllFlashcardContentMutation.graphql";
import { LecturerFlashcardHeadingFragment$key } from "@/__generated__/LecturerFlashcardHeadingFragment.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { Delete, Edit } from "@mui/icons-material";
import { Alert, Button, CircularProgress } from "@mui/material";
import router from "next/router";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { ContentTags } from "../ContentTags";
import { Heading } from "../Heading";

const deleteFlashcardMutation = graphql`
  mutation LecturerFlashcardHeadingDeleteAllFlashcardContentMutation(
    $id: UUID!
  ) {
    mutateContent(contentId: $id) {
      deleteContent
    }
  }
`;
const metadataFragment = graphql`
  fragment LecturerFlashcardHeadingFragment on Content {
    id
    metadata {
      name
      ...ContentTags
    }
  }
`;

interface Props {
  content: LecturerFlashcardHeadingFragment$key;
  courseId: string;
  setEditContentModal: (open: boolean) => void;
}

const LecturerFlashcardHeading = ({
  content,
  courseId,
  setEditContentModal,
}: Props) => {
  const [commitDeleteFlashcard, isDeleteCommitInFlight] =
    useMutation<LecturerFlashcardHeadingDeleteAllFlashcardContentMutation>(
      deleteFlashcardMutation
    );

  const { id, metadata } = useFragment(metadataFragment, content);

  const { error, setError } = useError();

  return (
    <>
      <Heading
        title={metadata.name}
        action={
          <div className="flex gap-2">
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
                    "Do you really want to delete this flashcard set? This can't be undone."
                  )
                ) {
                  commitDeleteFlashcard({
                    variables: { id: id },
                    onCompleted: () => {
                      router.push(`/courses/${courseId}`);
                    },
                    onError: (error) => setError(error),
                    updater: (store) => {
                      // store.get(id)?.invalidateRecord();
                      store.delete(id);
                    },
                  });
                }
              }}
            >
              Delete
            </Button>

            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={() => setEditContentModal(true)}
            >
              Edit
            </Button>
          </div>
        }
        backButton
      />

      <ContentTags metadata={metadata} />

      {error && (
        <div className="flex flex-col gap-2 mt-8">
          {/* TODO ??? */}
          {error?.source?.errors.map((err: any, i: number) => (
            <Alert key={i} severity="error" onClose={() => setError(null)}>
              {err.message}
            </Alert>
          ))}
        </div>
      )}
    </>
  );
};

export default LecturerFlashcardHeading;
