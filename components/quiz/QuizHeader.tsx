import { QuizHeaderDeleteQuizMutation } from "@/__generated__/QuizHeaderDeleteQuizMutation.graphql";
import { QuizHeaderFragment$key } from "@/__generated__/QuizHeaderFragment.graphql";
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

const deleteQuizMutation = graphql`
  mutation QuizHeaderDeleteQuizMutation($id: UUID!) {
    mutateContent(contentId: $id) {
      deleteContent
    }
  }
`;

const metadataFragment = graphql`
  fragment QuizHeaderFragment on Content {
    metadata {
      name
      ...ContentTags
    }
  }
`;

interface Props {
  content: QuizHeaderFragment$key;
  openEditQuizModal: () => void;
}

const QuizHeader = ({ content, openEditQuizModal }: Props) => {
  const { courseId, quizId } = useParams();
  const router = useRouter();
  const confirm = useConfirmation();

  const { error, setError } = useError();

  const [commitDeleteQuiz, isDeleteCommitInFlight] =
    useMutation<QuizHeaderDeleteQuizMutation>(deleteQuizMutation);

  const updater = useCallback(() => updaterSetDelete(courseId), [courseId]);
  const deleteQuiz = useCallback(
    () =>
      commitDeleteQuiz({
        variables: { id: quizId },
        onCompleted: () => router.push(`/courses/${courseId}`),
        onError: (error) => setError(error),
        updater: updater(),
      }),
    [commitDeleteQuiz, courseId, quizId, router, setError, updater]
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
              onClick={openEditQuizModal}
            >
              Edit Quiz
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
                      "Do you really want to delete this quiz? This can't be undone.",
                  })
                )
                  deleteQuiz();
              }}
            >
              Delete Quiz
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

export default QuizHeader;
