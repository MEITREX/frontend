import { AddAssociationQuestionModalMutation } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useParams } from "next/navigation";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { ItemData } from "../form-sections/ItemFormSection";
import {
  AssociationQuestionData,
  AssociationQuestionModal,
} from "./AssociationQuestionModal";

export function AddAssociationQuestionModal({
  _allRecords,
  open,
  onClose,
}: {
  _allRecords: MediaRecordSelector$key;
  open: boolean;
  onClose: () => void;
}) {
  const { quizId, courseId } = useParams();

  const [error, setError] = useState<any>(null);

  const [addQuestion, isUpdating] =
    useMutation<AddAssociationQuestionModalMutation>(graphql`
      mutation AddAssociationQuestionModalMutation(
        $input: CreateAssociationQuestionInputWithoutItem!
        $assessmentId: UUID!
        $item: CreateItemInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          assessmentId
          addAssociationQuestion(
            questionInput: $input
            assessmentId: $assessmentId
            item: $item
          ) {
            questionPool {
              itemId
              type # without type and number, the question will not appear properly and be deletable until a page reload
              number
              ...AssociationQuestionPreviewFragment
            }
            # item {
            #   id
            #   associatedSkills {
            #     id
            #     skillName
            #   }
            #   associatedBloomLevels
            # }
          }
        }
      }
    `);

  const handleSubmit = (
    data: AssociationQuestionData,
    item: ItemData,
    newSkillAdded?: boolean
  ) => {
    addQuestion({
      variables: {
        assessmentId: quizId,
        input: {
          text: data.text,
          hint: data.hint,
          correctAssociations: data.correctAssociations,
        },
        item: item,
      },
      onCompleted: () => onClose(),
      onError: setError,
      updater(
        store,
        {
          mutateQuiz: {
            addAssociationQuestion: { questionPool /* item */ },
          },
        }
      ) {
        store.invalidateStore();

        const content = store.get(quizId);
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
        const newItem = store.get("item!.id"); // TODO
        if (!items || !newItem) return;

        store
          .getRoot()
          .getLinkedRecord("items")
          ?.setLinkedRecords([...items, newItem], "elements");
      },
    });
  };
  const initialItem: ItemData = {
    associatedSkills: [],
    associatedBloomLevels: [],
  };
  const initialValue: AssociationQuestionData = {
    text: "",
    hint: null,
    correctAssociations: [],
  };

  return (
    <AssociationQuestionModal
      _allRecords={_allRecords}
      open={open}
      title="Add association question"
      error={error}
      courseId={courseId}
      item={initialItem}
      initialValue={initialValue}
      isLoading={isUpdating}
      onSave={handleSubmit}
      onClose={onClose}
      clearError={() => setError(null)}
    />
  );
}
