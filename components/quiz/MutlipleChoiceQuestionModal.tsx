import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
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
import { Dispatch, SetStateAction, useCallback } from "react";
import { PreloadedQuery } from "react-relay";
import { useError } from "../ErrorContext";
import { Form, FormSection } from "../Form";
import ItemFormSectionNew, {
  CreateItem,
  Item,
} from "../form-sections/item/ItemFormSectionNew";
import { FormErrors } from "../FormErrors";
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
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  title: string;
  open: boolean;
  isLoading: boolean;
  item: Item | CreateItem;
  setItem: Dispatch<SetStateAction<Item | CreateItem>>;
  questionData: MultipleChoiceQuestionData;
  setQuestionData: Dispatch<SetStateAction<MultipleChoiceQuestionData>>;
  onSubmit: () => void;
  onClose: () => void;
};

export function MultipleChoiceQuestionModal({
  _allRecords,
  allSkillsQueryRef,
  title,
  open,
  isLoading,
  item,
  setItem,
  questionData,
  setQuestionData,
  onSubmit,
  onClose,
}: Readonly<Props>) {
  const { error } = useError();

  const updateQuestionData = useCallback(
    <K extends keyof MultipleChoiceQuestionData>(
      key: K,
      value: MultipleChoiceQuestionData[K]
    ) => {
      setQuestionData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setQuestionData]
  );
  const updateQuestionAnswerAt = useCallback(
    (index: number, answer: MultipleChoiceAnswerData) => {
      setQuestionData((oldValue) => {
        return {
          ...oldValue,
          answers: oldValue.answers.map((item, i) =>
            i === index ? answer : item
          ),
        };
      });
    },
    [setQuestionData]
  );
  const deleteQuestionAnswerAt = useCallback(
    (index: number) => {
      setQuestionData((oldValue) => ({
        ...oldValue,
        answers: oldValue.answers.filter((_, i) => i !== index),
      }));
    },
    [setQuestionData]
  );

  const isOneAnswerCorrect = questionData.answers.some(
    (x) => x.correct === true
  );
  const hasAtLeastTwoAnswers = questionData.answers.length >= 2;
  const areAllAnswersFilled = questionData.answers.every(
    (x) => !!serializeToText(x.answerText)
  );
  const isQuestionDataValid =
    isOneAnswerCorrect &&
    hasAtLeastTwoAnswers &&
    !!serializeToText(questionData.text) &&
    areAllAnswersFilled &&
    item.associatedBloomLevels.length > 0 &&
    item.associatedSkills.length > 0;

  const addEmptyAnswer = useCallback(
    () =>
      setQuestionData((oldValue) => ({
        ...oldValue,
        answers: [
          ...oldValue.answers,
          {
            correct: false,
            answerText: "",
            feedback: "",
          },
        ],
      })),
    [setQuestionData]
  );

  return (
    <Dialog open={open} maxWidth="lg" onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormErrors error={error} />
        <Form>
          <ItemFormSectionNew
            operation="edit"
            item={item}
            setItem={setItem}
            allSkillsQueryRef={allSkillsQueryRef}
          />
          <FormSection title="Question">
            <RichTextEditor
              _allRecords={_allRecords}
              initialValue={questionData.text}
              onChange={(text) => updateQuestionData("text", text)}
              className="w-[700px]"
              label="Title"
              required
            />

            <RichTextEditor
              _allRecords={_allRecords}
              initialValue={questionData.hint ?? ""}
              onChange={(hint) => updateQuestionData("hint", hint)}
              className="w-[700px]"
              label="Hint"
            />
          </FormSection>
          {questionData.answers.map((answer, i) => (
            <FormSection title={`Answer ${i + 1}`} key={i}>
              <RichTextEditor
                _allRecords={_allRecords}
                initialValue={answer.answerText}
                onChange={(answerText) =>
                  updateQuestionAnswerAt(i, { ...answer, answerText })
                }
                className="w-[700px]"
                label="Text"
                required
              />

              <RichTextEditor
                _allRecords={_allRecords}
                initialValue={answer.feedback ?? ""}
                onChange={(value) =>
                  updateQuestionAnswerAt(i, {
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
                        updateQuestionAnswerAt(i, {
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
                  onClick={() => deleteQuestionAnswerAt(i)}
                >
                  <Delete />
                </IconButton>
              </div>
            </FormSection>
          ))}

          <div className="flex w-full justify-end col-span-full">
            <Button onClick={addEmptyAnswer} startIcon={<Add />}>
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
          {!serializeToText(questionData.text) && (
            <div>A Question title is required</div>
          )}
        </div>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          disabled={!isQuestionDataValid}
          loading={isLoading}
          onClick={onSubmit}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
