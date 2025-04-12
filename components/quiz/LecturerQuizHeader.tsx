import { LecturerQuizHeaderDeleteQuizMutation } from "@/__generated__/LecturerQuizHeaderDeleteQuizMutation.graphql";
import { LecturerQuizHeaderFragment$key } from "@/__generated__/LecturerQuizHeaderFragment.graphql";
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

const deleteQuizMutation = graphql`
  mutation LecturerQuizHeaderDeleteQuizMutation($id: UUID!) {
    mutateContent(contentId: $id) {
      deleteContent
    }
  }
`;

const metadataFragment = graphql`
  fragment LecturerQuizHeaderFragment on Content {
    id
    metadata {
      name
      ...ContentTags
    }
  }
`;

interface Props {
  content: LecturerQuizHeaderFragment$key;
  openEditQuizModal: () => void;
}

const LecturerQuizHeader = ({ content, openEditQuizModal }: Props) => {
  const { courseId } = useParams();

  const [commitDeleteQuiz, isDeleteCommitInFlight] =
    useMutation<LecturerQuizHeaderDeleteQuizMutation>(deleteQuizMutation);

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
                    "Do you really want to delete this quiz? This can't be undone."
                  )
                ) {
                  commitDeleteQuiz({
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
              Delete Quiz
            </Button>

            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={openEditQuizModal}
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

export default LecturerQuizHeader;
