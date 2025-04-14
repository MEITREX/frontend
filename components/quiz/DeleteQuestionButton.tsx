import { DeleteQuestionButtonMutation } from "@/__generated__/DeleteQuestionButtonMutation.graphql";
import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { graphql, useMutation } from "react-relay";

export function DeleteQuestionButton({
  assessmentId,
  questionId,
  num,
}: {
  assessmentId: string;
  questionId: string;
  num: number;
}) {
  const [deleteQuestion, isDeleting] =
    useMutation<DeleteQuestionButtonMutation>(graphql`
      mutation DeleteQuestionButtonMutation(
        $assessmentId: UUID!
        $number: Int!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          removeQuestion(number: $number) {
            assessmentId
          }
        }
      }
    `);
  return (
    <IconButton
      onClick={() => {
        deleteQuestion({
          variables: { assessmentId, number: num },
          updater(store) {
            let quizRecord = store.get(`client:${assessmentId}:quiz`);
            let questions = quizRecord?.getLinkedRecords("questionPool");
            if (!questions || !quizRecord) {
              throw new Error(
                "Could not delete question in the relay store! Please refresh the page."
              );
            }
            const questionDeleted = questions.splice(num - 1, 1)[0];
            quizRecord.setLinkedRecords(questions, "questionPool");
          },
        });
      }}
    >
      <Delete fontSize="small"></Delete>
    </IconButton>
  );
}
