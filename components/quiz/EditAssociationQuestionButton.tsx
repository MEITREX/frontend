import { EditAssociationQuestionButtonFragment$key } from "@/__generated__/EditAssociationQuestionButtonFragment.graphql";
import { EditAssociationQuestionButtonMutation } from "@/__generated__/EditAssociationQuestionButtonMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import {
  AssociationQuestionData,
  AssociationQuestionModal,
} from "./AssociationQuestionModal";
import { ItemData } from "../ItemFormSection";

export function EditAssociationQuestionButton({
  _allRecords,
  _question,
  assessmentId,
  item,
  courseId,
}: {
  _allRecords: MediaRecordSelector$key;
  _question: EditAssociationQuestionButtonFragment$key;
  assessmentId: string;
  item: ItemData;
  courseId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const question = useFragment(
    graphql`
      fragment EditAssociationQuestionButtonFragment on AssociationQuestion {
        itemId
        text
        hint
        correctAssociations {
          left
          right
          feedback
        }
      }
    `,
    _question
  );

  const [updateQuestion, isUpdating] =
    useMutation<EditAssociationQuestionButtonMutation>(graphql`
      mutation EditAssociationQuestionButtonMutation(
        $assessmentId: UUID!
        $questionInput: UpdateAssociationQuestionInput!
        $itemInput: ItemInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          assessmentId
          updateAssociationQuestion(
            questionInput: $questionInput
            assessmentId: $assessmentId
            item: $itemInput
          ) {
            assessmentId
            questionPool {
              ...EditAssociationQuestionButtonFragment
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
    data: AssociationQuestionData,
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
          correctAssociations: data.correctAssociations,
        },
        itemInput: item,
      },
      updater: (store) => store.invalidateStore(),
      onCompleted: () => setOpen(false),
      onError: setError,
    });
  };

  const initialValue: AssociationQuestionData = useMemo(
    () => ({
      text: question.text,
      hint: question.hint,
      correctAssociations: question.correctAssociations.map((elem) => ({
        left: elem.left,
        right: elem.right,
        feedback: elem.feedback,
      })),
    }),
    [question]
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small"></Edit>
      </IconButton>
      <AssociationQuestionModal
        _allRecords={_allRecords}
        open={open}
        title="Edit association question"
        error={error}
        item={item}
        courseId={courseId}
        initialValue={initialValue}
        isLoading={isUpdating}
        onSave={handleSubmit}
        onClose={() => setOpen(false)}
        clearError={() => setError(null)}
      />
    </>
  );
}
