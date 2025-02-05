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
import { useEffect, useMemo, useState } from "react";
import { Form, FormSection } from "../Form";
import { FormErrors } from "../FormErrors";
import { RichTextEditor, serializeToText } from "../RichTextEditor";
import { ItemFormSection, ItemData } from "../ItemFormSection";

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
}: {
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
}) {
  const [data, setData] = useState(initialValue);
  const [itemForQuestion, setItem] = useState(item);
  const updateAnswer = (index: number, value: MultipleChoiceAnswerData) => {
    setData((oldValue) => ({
      ...oldValue,
      answers: [
        ...oldValue.answers.slice(0, index),
        value,
        ...oldValue.answers.slice(index + 1),
      ],
    }));
  };
  function handleItem(item: ItemData | null) {
    if (item) {
      setItem(item);
    } else {
      setItem({ associatedBloomLevels: [], associatedSkills: [] });
    }
  }
  const oneAnswerCorrect = useMemo(
    () => data.answers.some((x) => x.correct === true),
    [data.answers]
  );
  const atLeastTwoAnswers = data.answers.length >= 2;
  const allAnswersFilled = useMemo(
    () => data.answers.every((x) => !!serializeToText(x.answerText)),
    [data.answers]
  );

  const valid =
    oneAnswerCorrect &&
    atLeastTwoAnswers &&
    !!serializeToText(data.text) &&
    allAnswersFilled &&
    itemForQuestion.associatedBloomLevels.length > 0 &&
    itemForQuestion.associatedSkills.length > 0;

  useEffect(() => {
    if (!open) {
      setData(initialValue);
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
          ></ItemFormSection>
          <FormSection title="Question">
            <RichTextEditor
              _allRecords={_allRecords}
              initialValue={data.text}
              onChange={(text) =>
                setData((oldValue) => ({ ...oldValue, text }))
              }
              className="w-[700px]"
              label="Title"
              required
            />

            <RichTextEditor
              _allRecords={_allRecords}
              initialValue={data.hint ?? ""}
              onChange={(hint) =>
                setData((oldValue) => ({ ...oldValue, hint }))
              }
              className="w-[700px]"
              label="Hint"
            />
          </FormSection>
          {data.answers.map((answer, i) => (
            <FormSection title={`Answer ${i + 1}`} key={i}>
              <RichTextEditor
                _allRecords={_allRecords}
                initialValue={answer.answerText!}
                onChange={(answerText) =>
                  updateAnswer(i, { ...answer, answerText })
                }
                className="w-[700px]"
                label="Text"
                required
              />

              <RichTextEditor
                _allRecords={_allRecords}
                initialValue={answer.feedback ?? ""}
                onChange={(value) =>
                  updateAnswer(i, {
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
                        updateAnswer(i, {
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
                    setData((oldValue) => ({
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
                setData((oldValue) => ({
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
          {!oneAnswerCorrect && (
            <div>At least one answer has to be correct</div>
          )}
          {!atLeastTwoAnswers && <div>At least two answers are required</div>}

          {atLeastTwoAnswers && !allAnswersFilled && (
            <div>All answers need a text</div>
          )}
          {!serializeToText(data.text) && (
            <div>A Question title is required</div>
          )}
        </div>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          disabled={!valid}
          loading={isLoading}
          onClick={() => onSave(data, itemForQuestion)}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
