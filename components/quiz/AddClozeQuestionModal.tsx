import { AddClozeQuestionModalMutation } from "@/__generated__/AddClozeQuestionModalMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { ClozeQuestionData, ClozeQuestionModal } from "./ClozeQuestionModal";

export function AddClozeQuestionModal({
  _allRecords,
  assessmentId,
  open,
  onClose,
}: {
  _allRecords: MediaRecordSelector$key;
  assessmentId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [error, setError] = useState<any>(null);

  const [addQuestion, isUpdating] =
    useMutation<AddClozeQuestionModalMutation>(graphql`
      mutation AddClozeQuestionModalMutation(
        $assessmentId: UUID!
        $input: CreateClozeQuestionInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          addClozeQuestion(input: $input) {
            assessmentId
            questionPool {
              id
              type # without type and number, the question will not appear properly and be deletable until a page reload
              number
              ...EditClozeQuestionButtonFragment
              ...ClozeQuestionPreviewFragment
            }
          }
        }
      }
    `);

  const handleSubmit = (data: ClozeQuestionData) => {
    addQuestion({
      variables: {
        assessmentId,
        input: {
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
      },
      onCompleted: () => onClose(),
      updater(
        store,
        {
          mutateQuiz: {
            addClozeQuestion: { questionPool },
          },
        }
      ) {
        store.invalidateStore();

        const content = store.get(assessmentId);
        const quiz = content?.getLinkedRecord("quiz");
        const allQuestions = questionPool.flatMap((x) => {
          const record = store.get(x.id);
          return record ? [record] : [];
        });

        if (!quiz) {
          console.error("not found");
          return;
        }

        quiz.setLinkedRecords(allQuestions, "questionPool");
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

  return (
    <ClozeQuestionModal
      _allRecords={_allRecords}
      open={open}
      title="Add cloze question"
      error={error}
      initialValue={initialValue}
      isLoading={isUpdating}
      onSave={handleSubmit}
      onClose={onClose}
      clearError={() => setError(null)}
    />
  );
}
