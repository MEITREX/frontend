import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Add, Delete } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Form, FormSection } from "../Form";
import { FormErrors } from "../FormErrors";
import { ItemData, ItemFormSection } from "../ItemFormSection";
import { RichTextEditor, serializeToText } from "../RichTextEditor";

export type MultipleChoiceQuestionData = {
  text: string;
  hint: string | null;
  answers: MultipleChoiceAnswerData[];
};
export type MultipleChoiceAnswerData = {
  correct: boolean;
  feedback: string | null;
  answerText: string;
};

type Props = {
  _allRecords: MediaRecordSelector$key;
  open: boolean;
  title: string;
  error: any;
  courseId: string;
  item: ItemData;
  initialValue: MultipleChoiceQuestionData;
  isLoading: boolean;
  onSave: (
    data: MultipleChoiceQuestionData,
    item: ItemData,
    newSkillAdded?: boolean
  ) => void;
  onClose: () => void;
  clearError: () => void;
};

export function MultipleChoiceQuestionModal({
  _allRecords,
  open,
  title,
  error,
  courseId,
  item,
  initialValue,
  isLoading,
  onSave,
  onClose,
  clearError,
}: Props) {
  const [multipleChoiceQuestionData, setMultipleChoiceQuestionData] =
    useState(initialValue);
  const [itemForQuestion, setItem] = useState<ItemData>(item);

  /**
   * Add an answer to the question data state at a specific index
   *
   * @param answer Answer to add; destructured in the function
   */
  const addAnswerToQuestionDataAtIndex = useCallback(
    (index: number, answer: MultipleChoiceAnswerData) => {
      setMultipleChoiceQuestionData((oldValue) => ({
        ...oldValue,
        answers: [
          ...oldValue.answers.slice(0, index),
          answer,
          ...oldValue.answers.slice(index + 1),
        ],
      }));
    },
    [setMultipleChoiceQuestionData]
  );
  const handleItem = useCallback(
    (item: ItemData | null) =>
      setItem(item ?? { associatedBloomLevels: [], associatedSkills: [] }),
    [setItem]
  );

  const isOneAnswerCorrect = multipleChoiceQuestionData.answers.some(
    (x) => x.correct === true
  );
  const hasAtLeastTwoAnswers = multipleChoiceQuestionData.answers.length >= 2;
  const areAllAnswersFilled = multipleChoiceQuestionData.answers.every(
    (x) => !!serializeToText(x.answerText)
  );
  const isQuestionDataValid =
    isOneAnswerCorrect &&
    hasAtLeastTwoAnswers &&
    !!serializeToText(multipleChoiceQuestionData.text) &&
    areAllAnswersFilled &&
    itemForQuestion.associatedBloomLevels.length > 0 &&
    itemForQuestion.associatedSkills.length > 0;

  useEffect(() => {
    if (!open) {
      setMultipleChoiceQuestionData(initialValue);
      setItem(item);
    }
  }, [open, initialValue, item]);

  return (
    <Dialog open={open} maxWidth="lg" onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormErrors error={error} onClose={clearError} />
        <Form>
          <ItemFormSection
            courseId={courseId}
            item={itemForQuestion}
            onChange={handleItem}
          />
          <FormSection title="Question">
            <RichTextEditor
              _allRecords={_allRecords}
              initialValue={multipleChoiceQuestionData.text}
              onChange={(text) =>
                setMultipleChoiceQuestionData((oldValue) => ({
                  ...oldValue,
                  text,
                }))
              }
              className="w-[700px]"
              label="Title"
              required
            />

            <RichTextEditor
              _allRecords={_allRecords}
              initialValue={multipleChoiceQuestionData.hint ?? ""}
              onChange={(hint) =>
                setMultipleChoiceQuestionData((oldValue) => ({
                  ...oldValue,
                  hint,
                }))
              }
              className="w-[700px]"
              label="Hint"
            />
          </FormSection>
          {multipleChoiceQuestionData.answers.map((answer, i) => (
            <FormSection title={`Answer ${++i}`} key={i}>
              <RichTextEditor
                _allRecords={_allRecords}
                initialValue={answer.answerText!}
                onChange={(answerText) =>
                  addAnswerToQuestionDataAtIndex(i, { ...answer, answerText })
                }
                className="w-[700px]"
                label="Text"
                required
              />

              <RichTextEditor
                _allRecords={_allRecords}
                initialValue={answer.feedback ?? ""}
                onChange={(value) =>
                  addAnswerToQuestionDataAtIndex(i, {
                    ...answer,
                    feedback:
                      value !==
                      '[{"type":"paragraph","children":[{"text":""}]}]'
                        ? value
                        : null,
                  })
                }
                className="w-[700px]"
                label="Feedback"
              />
              <div className="flex justify-between items-center w-full">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={answer.correct}
                      onChange={(e) =>
                        addAnswerToQuestionDataAtIndex(i, {
                          ...answer,
                          correct: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Correct"
                />
                <IconButton
                  color="error"
                  onClick={() => {
                    setMultipleChoiceQuestionData((oldValue) => ({
                      ...oldValue,
                      answers: oldValue.answers.filter((_, idx) => idx !== i),
                    }));
                  }}
                >
                  <Delete></Delete>
                </IconButton>
              </div>
            </FormSection>
          ))}

          <div className="flex w-full justify-end col-span-full">
            <Button
              onClick={() =>
                setMultipleChoiceQuestionData((oldValue) => ({
                  ...oldValue,
                  answers: [
                    ...oldValue.answers,
                    {
                      correct: false,
                      answerText: "",
                      feedback: "",
                    },
                  ],
                }))
              }
              startIcon={<Add />}
            >
              Add Answer
            </Button>
          </div>
        </Form>
      </DialogContent>
      <DialogActions>
        <div className="text-red-600 text-xs mr-3">
          {!isOneAnswerCorrect && (
            <div>At least one answer has to be correct</div>
          )}
          {!hasAtLeastTwoAnswers && (
            <div>At least two answers are required</div>
          )}

          {hasAtLeastTwoAnswers && !areAllAnswersFilled && (
            <div>All answers need a text</div>
          )}
          {!serializeToText(multipleChoiceQuestionData.text) && (
            <div>A Question title is required</div>
          )}
        </div>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          disabled={!isQuestionDataValid}
          loading={isLoading}
          onClick={() => onSave(multipleChoiceQuestionData, itemForQuestion)}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
