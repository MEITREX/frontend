import { EditClozeQuestionButtonFragment$key } from "@/__generated__/EditClozeQuestionButtonFragment.graphql";
import { EditClozeQuestionButtonMutation } from "@/__generated__/EditClozeQuestionButtonMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { ItemData } from "../form-sections/ItemFormSection";
import {
  ClozeElementData,
  ClozeQuestionData,
  ClozeQuestionModal,
} from "./ClozeQuestionModal";

export function EditClozeQuestionButton({
  _allRecords,
  _question,
  assessmentId,
  courseId,
  item,
}: {
  _allRecords: MediaRecordSelector$key;
  _question: EditClozeQuestionButtonFragment$key;
  assessmentId: string;
  courseId: string;
  item: ItemData;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const question = useFragment(
    graphql`
      fragment EditClozeQuestionButtonFragment on ClozeQuestion {
        itemId
        showBlanksList
        additionalWrongAnswers
        hint
        clozeElements {
          __typename
          ... on ClozeTextElement {
            text
          }
          ... on ClozeBlankElement {
            correctAnswer
            feedback
          }
        }
      }
    `,
    _question
  );

  const [updateQuestion, isUpdating] =
    useMutation<EditClozeQuestionButtonMutation>(graphql`
      mutation EditClozeQuestionButtonMutation(
        $assessmentId: UUID!
        $questionInput: UpdateClozeQuestionInput!
        $item: ItemInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          assessmentId
          updateClozeQuestion(
            questionInput: $questionInput
            assessmentId: $assessmentId
            item: $item
          ) {
            assessmentId
            questionPool {
              itemId
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
    updateQuestion({
      variables: {
        assessmentId,
        questionInput: {
          itemId: question.itemId,
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
      updater: (store) => store.invalidateStore(),
      onCompleted: () => setOpen(false),
      onError: setError,
    });
  };

  const initialValue: ClozeQuestionData = useMemo(
    () => ({
      hint: question.hint,
      showBlanksList: question.showBlanksList,
      additionalWrongAnswers: [...question.additionalWrongAnswers],
      clozeElements: question.clozeElements
        .map((elem) =>
          elem.__typename === "ClozeTextElement"
            ? { type: "text", text: elem.text }
            : elem.__typename === "ClozeBlankElement"
            ? {
                type: "blank",
                correctAnswer: elem.correctAnswer,
                feedback: elem.feedback ?? "",
              }
            : null
        )
        .filter((elem) => elem !== null) as ClozeElementData[],
    }),
    [question]
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small"></Edit>
      </IconButton>
      <ClozeQuestionModal
        _allRecords={_allRecords}
        open={open}
        title="Edit cloze question"
        error={error}
        initialValue={initialValue}
        courseId={courseId}
        item={item}
        isLoading={isUpdating}
        onSave={handleSubmit}
        onClose={() => setOpen(false)}
        clearError={() => setError(null)}
      />
    </>
  );
}
