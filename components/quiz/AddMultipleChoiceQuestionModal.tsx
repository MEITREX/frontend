import { AddMultipleChoiceQuestionModalMutation } from "@/__generated__/AddMultipleChoiceQuestionModalMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import {
  MultipleChoiceQuestionData,
  MultipleChoiceQuestionModal,
} from "./MutlipleChoiceQuestionModal";
import { ItemData } from "../ItemFormSection";
export function AddMultipleChoiceQuestionModal({
  _allRecords,
  assessmentId,
  courseId,
  open,
  onClose,
}: {
  _allRecords: MediaRecordSelector$key;
  assessmentId: string;
  courseId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [error, setError] = useState<any>(null);

  const [addQuestion, isUpdating] =
    useMutation<AddMultipleChoiceQuestionModalMutation>(graphql`
      mutation AddMultipleChoiceQuestionModalMutation(
        $assessmentId: UUID!
        $input: CreateMultipleChoiceQuestionInput!
        $item: ItemInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          assessmentId
          addMultipleChoiceQuestion(
            questionInput: $input
            assessmentId: $assessmentId
            item: $item
          ) {
            assessmentId
            questionPool {
              itemId
              type # without type and number, the question will not appear properly and be deletable until a page reload
              number
              ...EditMultipleChoiceQuestionButtonFragment
              ...MultipleChoiceQuestionPreviewFragment
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
    addQuestion({
      variables: {
        assessmentId,
        input: {
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
      onCompleted: () => onClose(),
      updater(
        store,
        {
          mutateQuiz: {
            addMultipleChoiceQuestion: { questionPool, item },
          },
        }
      ) {
        console.log(store);
        store.invalidateStore();

        const content = store.get(assessmentId);
        const quiz = content?.getLinkedRecord("quiz");
        const allQuestions = questionPool.flatMap((x) => {
          const record = store.get(x.itemId);
          return record ? [record] : [];
        });

        if (!quiz) {
          console.error("not found");
          return;
        }

        quiz.setLinkedRecords(allQuestions, "questionPool");
        console.log("updatedQuestion");
        const items = store
          .getRoot()
          .getLinkedRecord("items")
          ?.getLinkedRecords("elements");
        const newItem = store.get(item!.id);
        if (!items || !newItem) return;

        store
          .getRoot()
          .getLinkedRecord("items")
          ?.setLinkedRecords([...items, newItem], "elements");
        console.log(store);
      },
      onError: setError,
    });
  };

  const initialValue: MultipleChoiceQuestionData = {
    text: "",
    hint: null,
    answers: [],
  };
  const initialItem: ItemData = {
    associatedSkills: [],
    associatedBloomLevels: [],
  };

  return (
    <MultipleChoiceQuestionModal
      _allRecords={_allRecords}
      open={open}
      title="Add multiple choice question"
      error={error}
      initialValue={initialValue}
      isLoading={isUpdating}
      item={initialItem}
      courseId={courseId}
      onSave={handleSubmit}
      onClose={onClose}
      clearError={() => setError(null)}
    />
  );
}
