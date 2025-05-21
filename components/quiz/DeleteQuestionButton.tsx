import { DeleteQuestionButtonMutation } from "@/__generated__/DeleteQuestionButtonMutation.graphql";
import { questionUpdaterDeleteClosure } from "@/src/relay-helpers/question";
import { Delete } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { graphql, useMutation } from "react-relay";
import { useError } from "../ErrorContext";

const DeleteQuestion = graphql`
  mutation DeleteQuestionButtonMutation($assessmentId: UUID!, $number: Int!) {
    mutateQuiz(assessmentId: $assessmentId) {
      removeQuestion(number: $number) {
        assessmentId
      }
    }
  }
`;

type Props = {
  assessmentId: string;
  num: number;
};

export function DeleteQuestionButton({ assessmentId, num }: Props) {
  const { courseId, quizId } = useParams();
  const { setError } = useError();

  const [deleteQuestion, isDeleting] =
    useMutation<DeleteQuestionButtonMutation>(DeleteQuestion);

  const handleDelete = useCallback(() => {
    deleteQuestion({
      variables: { assessmentId, number: num },
      onError: setError,
      updater: questionUpdaterDeleteClosure(quizId, num, courseId),
    });
  }, [assessmentId, courseId, deleteQuestion, num, quizId, setError]);

  return (
    <Button
      startIcon={<Delete />}
      color="warning"
      onClick={() => handleDelete()}
      sx={{ minWidth: "fit-content" }}
    >
      <span className="max-lg:hidden">Delete</span>
    </Button>
  );
}
