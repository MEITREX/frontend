import { AddClozeQuestionModalMutation } from "@/__generated__/AddClozeQuestionModalMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { ItemData } from "../form-sections/ItemFormSection";
import { ClozeQuestionData, ClozeQuestionModal } from "./ClozeQuestionModal";

export function AddClozeQuestionModal({
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
    useMutation<AddClozeQuestionModalMutation>(graphql`
      mutation AddClozeQuestionModalMutation(
        $assessmentId: UUID!
        $questionInput: CreateClozeQuestionInput!
        $item: ItemInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          assessmentId
          addClozeQuestion(
            assessmentId: $assessmentId
            questionInput: $questionInput
            item: $item
          ) {
            assessmentId
            questionPool {
              itemId
              type # without type and number, the question will not appear properly and be deletable until a page reload
              number
              ...EditClozeQuestionButtonFragment
              ...ClozeQuestionPreviewFragment
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
    data: ClozeQuestionData,
    item: ItemData,
    newSkillAdded?: boolean
  ) => {
    addQuestion({
      variables: {
        assessmentId,
        questionInput: {
          hint: data.hint,
          showBlanksList: data.showBlanksList,
          additionalWrongAnswers: data.additionalWrongAnswers,
          clozeElements: data.clozeElements.map((elem) =>
            elem.type === "text"
              ? { type: "TEXT", text: elem.text }
              : {
                  type: "BLANK",
                  correctAnswer: elem.correctAnswer,
                  feedback: elem.feedback,
                }
          ),
        },
        item: item,
      },
      onCompleted: () => onClose(),
      updater(
        store,
        {
          mutateQuiz: {
            addClozeQuestion: { questionPool, item },
          },
        }
      ) {
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
      },
      onError: setError,
    });
  };

  const initialValue: ClozeQuestionData = {
    hint: null,
    showBlanksList: true,
    additionalWrongAnswers: [],
    clozeElements: [],
  };
  const initialItem: ItemData = {
    associatedSkills: [],
    associatedBloomLevels: [],
  };
  return (
    <ClozeQuestionModal
      _allRecords={_allRecords}
      open={open}
      title="Add cloze question"
      error={error}
      initialValue={initialValue}
      item={initialItem}
      isLoading={isUpdating}
      courseId={courseId}
      onSave={handleSubmit}
      onClose={onClose}
      clearError={() => setError(null)}
    />
  );
}
