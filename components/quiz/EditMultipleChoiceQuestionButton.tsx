import { EditMultipleChoiceQuestionButtonFragment$key } from "@/__generated__/EditMultipleChoiceQuestionButtonFragment.graphql";
import { EditMultipleChoiceQuestionButtonMutation } from "@/__generated__/EditMultipleChoiceQuestionButtonMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import {
  MultipleChoiceQuestionData,
  MultipleChoiceQuestionModal,
} from "./MutlipleChoiceQuestionModal";
import { ItemData } from "../ItemFormSection";

export function EditMultipleChoiceQuestionButton({
  _allRecords,
  _question,
  assessmentId,
  courseId,
  item,
}: {
  _allRecords: MediaRecordSelector$key;
  _question: EditMultipleChoiceQuestionButtonFragment$key;
  assessmentId: string;
  courseId: string;
  item: ItemData;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<any>(null);
  const question = useFragment(
    graphql`
      fragment EditMultipleChoiceQuestionButtonFragment on MultipleChoiceQuestion {
        itemId
        text
        hint
        answers {
          answerText
          correct
          feedback
        }
      }
    `,
    _question
  );

  const [updateQuestion, isUpdating] =
    useMutation<EditMultipleChoiceQuestionButtonMutation>(graphql`
      mutation EditMultipleChoiceQuestionButtonMutation(
        $assessmentId: UUID!
        $questionInput: UpdateMultipleChoiceQuestionInput!
        $item: ItemInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          assessmentId
          updateMultipleChoiceQuestion(
            questionInput: $questionInput
            assessmentId: $assessmentId
            item: $item
          ) {
            assessmentId
            questionPool {
              ...EditMultipleChoiceQuestionButtonFragment
            }
            item {
              id
              associatedSkills {
                id
                skillName
              }
              associatedBloomLevels
            }
          }
        }
      }
    `);

  const handleSubmit = (
    data: MultipleChoiceQuestionData,
    item: ItemData,
    newSkillAdded?: boolean
  ) => {
    updateQuestion({
      variables: {
        assessmentId,
        questionInput: {
          itemId: question.itemId,
          text: data.text,
          hint: data.hint,
          answers: data.answers.map((answer) => ({
            answerText: answer.answerText,
            correct: answer.correct,
            feedback: answer.feedback,
          })),
        },
        item: item,
      },
      onCompleted: () => setOpen(false),
      onError: setError,
      updater: (store) => store.invalidateStore(),
    });
  };

  const initialValue: MultipleChoiceQuestionData = useMemo(
    () => ({
      text: question.text,
      hint: question.hint,
      answers: question.answers.map((answer) => ({
        answerText: answer.answerText,
        correct: answer.correct,
        feedback: answer.feedback,
      })),
    }),
    [question]
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small"></Edit>
      </IconButton>
      <MultipleChoiceQuestionModal
        _allRecords={_allRecords}
        open={open}
        title="Edit multiple choice question"
        error={error}
        initialValue={initialValue}
        isLoading={isUpdating}
        courseId={courseId}
        item={item}
        onSave={handleSubmit}
        onClose={() => setOpen(false)}
        clearError={() => setError(null)}
      />
    </>
  );
}
