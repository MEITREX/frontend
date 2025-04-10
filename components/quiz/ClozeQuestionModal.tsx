import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { Add, Clear, Feedback } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
} from "@mui/material";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { PreloadedQuery } from "react-relay";
import { Form, FormSection } from "../Form";
import ItemFormSectionNew, {
  CreateItem,
  Item,
} from "../form-sections/item/ItemFormSectionNew";
import { FormErrors } from "../FormErrors";
import { RichTextEditor, serializeToText } from "../RichTextEditor";
import { EditRichTextButton } from "./EditRichTextButton";
import { HintFormSection } from "./HintFormSection";

export type ClozeQuestionData = {
  hint: string | null;
  showBlanksList: boolean;
  additionalWrongAnswers: string[];
  clozeElements: ClozeElementData[];
};
export type ClozeElementData =
  | {
      type: "TEXT";
      text: string;
    }
  | {
      type: "BLANK";
      correctAnswer: string;
      feedback: string;
    };

type Props = {
  _allRecords: MediaRecordSelector$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  title: string;
  open: boolean;
  isLoading: boolean;
  item: Item | CreateItem;
  setItem: Dispatch<SetStateAction<Item | CreateItem>>;
  questionData: ClozeQuestionData;
  setQuestionData: Dispatch<SetStateAction<ClozeQuestionData>>;
  onSubmit: () => void;
  onClose: () => void;
};

export function ClozeQuestionModal({
  _allRecords,
  allSkillsQueryRef,
  title,
  open,
  isLoading,
  item,
  setItem,
  questionData,
  setQuestionData,
  onClose,
  onSubmit,
}: Readonly<Props>) {
  const { error } = useError();

  const updateQuestionData = useCallback(
    <K extends keyof ClozeQuestionData>(
      key: K,
      value: ClozeQuestionData[K]
    ) => {
      setQuestionData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setQuestionData]
  );

  const updateClozeElementAt = useCallback(
    (index: number, value: ClozeElementData) => {
      setQuestionData((prev) => ({
        ...prev,
        clozeElements: [
          ...prev.clozeElements.slice(0, index),
          value,
          ...prev.clozeElements.slice(index + 1),
        ],
      }));
    },
    [setQuestionData]
  );
  const addClozeElementAt = useCallback(
    (value: ClozeElementData) => {
      setQuestionData((prev) => ({
        ...prev,
        clozeElements: [...prev.clozeElements, value],
      }));
    },
    [setQuestionData]
  );
  const deleteClozeElementAt = useCallback(
    (index: number) => {
      setQuestionData((oldValue) => ({
        ...oldValue,
        clozeElements: [
          ...oldValue.clozeElements.slice(0, index),
          ...oldValue.clozeElements.slice(index + 1),
        ],
      }));
    },
    [setQuestionData]
  );

  const hasAtLeastOneTextElement = useMemo(
    () =>
      questionData.clozeElements.filter((e) => e.type === "TEXT").length > 0,
    [questionData.clozeElements]
  );
  const hasAtLeastOneBlankElement = useMemo(
    () =>
      questionData.clozeElements.filter((e) => e.type === "BLANK").length > 0,
    [questionData.clozeElements]
  );
  const allElementsAreFilled = useMemo(
    () =>
      questionData.clozeElements.every((x) =>
        x.type == "BLANK" ? x.correctAnswer : serializeToText(x.text)
      ),
    [questionData.clozeElements]
  );
  const valid =
    hasAtLeastOneTextElement &&
    hasAtLeastOneBlankElement &&
    allElementsAreFilled &&
    item.associatedBloomLevels.length > 0 &&
    item.associatedSkills.length > 0;

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
          <FormSection title="Cloze text">
            {questionData.clozeElements.map((elem, i) =>
              elem.type === "TEXT" ? (
                <div key={i} className="flex items-center">
                  <RichTextEditor
                    className="w-[700px]"
                    _allRecords={_allRecords}
                    label="Text"
                    initialValue={elem.text}
                    required
                    onChange={(text) =>
                      updateClozeElementAt(i, { type: "TEXT", text })
                    }
                  />
                  <IconButton
                    className="!mt-2"
                    onClick={() => deleteClozeElementAt(i)}
                  >
                    <Clear />
                  </IconButton>
                </div>
              ) : (
                <div key={i} className="flex items-center">
                  <TextField
                    className="!mr-4"
                    variant="outlined"
                    required
                    label="Blank"
                    value={elem.correctAnswer}
                    onChange={(e) =>
                      updateClozeElementAt(i, {
                        type: "BLANK",
                        correctAnswer: e.target.value,
                        feedback: elem.feedback,
                      })
                    }
                  />
                  <EditRichTextButton
                    _allRecords={_allRecords}
                    title="Edit feedback"
                    icon={<Feedback />}
                    initialValue={elem.feedback}
                    onSave={(value) =>
                      updateClozeElementAt(i, {
                        type: "BLANK",
                        correctAnswer: elem.correctAnswer,
                        feedback: value,
                      })
                    }
                  />
                  <IconButton onClick={() => deleteClozeElementAt(i)}>
                    <Clear />
                  </IconButton>
                </div>
              )
            )}
            <div className="flex gap-2 mt-2">
              <Button
                startIcon={<Add />}
                onClick={() => addClozeElementAt({ type: "TEXT", text: "" })}
              >
                Add text
              </Button>
              <Button
                startIcon={<Add />}
                onClick={() =>
                  addClozeElementAt({
                    type: "BLANK",
                    correctAnswer: "",
                    feedback: "",
                  })
                }
              >
                Add blank
              </Button>
            </div>
          </FormSection>
          <HintFormSection
            _allRecords={_allRecords}
            initialValue={questionData.hint}
            onChange={(hint) => updateQuestionData("hint", hint)}
          />
          <FormSection title="Options">
            <FormControlLabel
              label="Freetext blanks"
              control={
                <Checkbox
                  checked={!questionData.showBlanksList}
                  onChange={(e) =>
                    updateQuestionData("showBlanksList", !e.target.checked)
                  }
                />
              }
            />
          </FormSection>
          {questionData.showBlanksList && (
            <FormSection title="Additional wrong answers">
              <Autocomplete
                multiple
                options={[]}
                defaultValue={[]}
                freeSolo
                value={questionData.additionalWrongAnswers}
                className="w-96"
                onChange={(_, newValue: string[]) =>
                  updateQuestionData("additionalWrongAnswers", newValue)
                }
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    // the key gets set by "getTagProps"
                    // eslint-disable-next-line react/jsx-key
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Wrong answers"
                    helperText="Press enter to add"
                  />
                )}
              />
            </FormSection>
          )}
        </Form>
      </DialogContent>
      <DialogActions>
        <div className="text-red-600 text-xs mr-3">
          {!hasAtLeastOneTextElement && (
            <div>Add at least one text element</div>
          )}
          {!hasAtLeastOneBlankElement && (
            <div>Add at least one blank element</div>
          )}
          {hasAtLeastOneTextElement && !allElementsAreFilled && (
            <div>All elements have to be filled</div>
          )}
        </div>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton disabled={!valid} loading={isLoading} onClick={onSubmit}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
