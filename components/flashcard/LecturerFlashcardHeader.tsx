import { LecturerFlashcardHeaderDeleteFlashcardSetMutation } from "@/__generated__/LecturerFlashcardHeaderDeleteFlashcardSetMutation.graphql";
import { LecturerFlashcardHeaderFragment$key } from "@/__generated__/LecturerFlashcardHeaderFragment.graphql";
import { Delete, Edit } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
import router from "next/router";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { ContentTags } from "../ContentTags";
import { useError } from "../ErrorContext";
import { FormErrors } from "../FormErrors";
import { Heading } from "../Heading";

const deleteFlashcardMutation = graphql`
  mutation LecturerFlashcardHeaderDeleteFlashcardSetMutation($id: UUID!) {
    mutateContent(contentId: $id) {
      deleteContent
    }
  }
`;
const metadataFragment = graphql`
  fragment LecturerFlashcardHeaderFragment on Content {
    id
    metadata {
      name
      ...ContentTags
    }
  }
`;

interface Props {
  content: LecturerFlashcardHeaderFragment$key;
  openEditFlashcardSetModal: () => void;
}

const LecturerFlashcardHeader = ({
  content,
  openEditFlashcardSetModal,
}: Props) => {
  const { courseId } = useParams();

  const [commitDeleteFlashcard, isDeleteCommitInFlight] =
    useMutation<LecturerFlashcardHeaderDeleteFlashcardSetMutation>(
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
              Delete Flashcard Set
            </Button>

            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={openEditFlashcardSetModal}
            >
              Edit
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
