import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { Add, Clear, Feedback } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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

export type AssociationQuestionData = {
  hint: string | null;
  text: string;
  correctAssociations: SingleAssociationData[];
};

export type SingleAssociationData = {
  left: string;
  right: string;
  feedback: string | null;
};

type Props = {
  _allRecords: MediaRecordSelector$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  title: string;
  open: boolean;
  isLoading: boolean;
  item: Item | CreateItem;
  setItem: Dispatch<SetStateAction<Item | CreateItem>>;
  questionData: AssociationQuestionData;
  setQuestionData: Dispatch<SetStateAction<AssociationQuestionData>>;
  onSubmit: () => void;
  onClose: () => void;
};

export function AssociationQuestionModal({
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
    <K extends keyof AssociationQuestionData>(
      key: K,
      value: AssociationQuestionData[K]
    ) => {
      setQuestionData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setQuestionData]
  );

  const updateCorrectAssociationAt = useCallback(
    (index: number, value: SingleAssociationData) => {
      setQuestionData((oldValue) => ({
        ...oldValue,
        correctAssociations: [
          ...oldValue.correctAssociations.slice(0, index),
          value,
          ...oldValue.correctAssociations.slice(index + 1),
        ],
      }));
    },
    [setQuestionData]
  );
  const addCorrectAssociation = useCallback(
    (value: SingleAssociationData) => {
      setQuestionData((oldValue) => ({
        ...oldValue,
        correctAssociations: [...oldValue.correctAssociations, value],
      }));
    },
    [setQuestionData]
  );
  const deleteElement = useCallback(
    (index: number) => {
      setQuestionData((oldValue) => ({
        ...oldValue,
        correctAssociations: [
          ...oldValue.correctAssociations.slice(0, index),
          ...oldValue.correctAssociations.slice(index + 1),
        ],
      }));
    },
    [setQuestionData]
  );

  const hatAtLeastTwoItems = useMemo(
    () => questionData.correctAssociations.length >= 2,
    [questionData.correctAssociations]
  );

  const hasTitle = !!serializeToText(questionData.text);

  const allItemsFilled = useMemo(
    () =>
      questionData.correctAssociations.every(
        (x) => serializeToText(x.left) && serializeToText(x.right)
      ),
    [questionData.correctAssociations]
  );

  const valid =
    hasTitle &&
    hatAtLeastTwoItems &&
    allItemsFilled &&
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
          <FormSection title="Question">
            <RichTextEditor
              className="w-[700px]"
              _allRecords={_allRecords}
              label="Text"
              initialValue={questionData.text}
              required
              onChange={(text) => updateQuestionData("text", text)}
            />
          </FormSection>
          <FormSection title="Items">
            {questionData.correctAssociations.length > 0 && (
              <div className="flex flex-col gap-8 mb-2">
                {questionData.correctAssociations.map((elem, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-end relative pl-2">
                        <div className="absolute left-0 top-1/2 h-1/2 w-2 mt-1.5 border-t border-l border-gray-400 rounded-tl-sm"></div>
                        <RichTextEditor
                          className="w-[650px]"
                          _allRecords={_allRecords}
                          label="Left"
                          initialValue={elem.left}
                          required
                          onChange={(left) =>
                            updateCorrectAssociationAt(i, { ...elem, left })
                          }
                        />
                      </div>
                      <div className="flex items-end relative pl-2 pt-3 -mt-2">
                        <div className="absolute left-0 bottom-1/2 h-1/2 w-2 -mb-2.5 border-b border-l border-gray-400 rounded-tl-sm"></div>
                        <RichTextEditor
                          className="w-[650px]"
                          _allRecords={_allRecords}
                          label="Right"
                          initialValue={elem.right}
                          required
                          onChange={(right) =>
                            updateCorrectAssociationAt(i, { ...elem, right })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-col ml-2 mt-2">
                      <EditRichTextButton
                        _allRecords={_allRecords}
                        title="Edit feedback"
                        icon={<Feedback />}
                        initialValue={elem.feedback ?? ""}
                        placeholder="Feedback"
                        onSave={(value) =>
                          updateCorrectAssociationAt(i, {
                            ...elem,
                            feedback:
                              value !==
                              '[{"type":"paragraph","children":[{"text":""}]}]'
                                ? value
                                : null,
                          })
                        }
                      />
                      <IconButton onClick={() => deleteElement(i)}>
                        <Clear />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                startIcon={<Add />}
                onClick={() =>
                  addCorrectAssociation({ left: "", right: "", feedback: null })
                }
              >
                Add item
              </Button>
            </div>
          </FormSection>
          <HintFormSection
            _allRecords={_allRecords}
            initialValue={questionData.hint}
            onChange={(hint) => updateQuestionData("hint", hint)}
          />
        </Form>
      </DialogContent>
      <DialogActions>
        <div className="text-red-600 text-xs mr-3">
          {!hatAtLeastTwoItems && <div>Add at least two items</div>}
          {hatAtLeastTwoItems && !allItemsFilled && (
            <div>All items need a text</div>
          )}
          {!hasTitle && <div>A title is required</div>}
          {item.associatedBloomLevels.length < 1 && (
            <div>Level of Blooms Taxonomy are required</div>
          )}
          {item.associatedSkills.length < 1 && (
            <div>At least one skill is required</div>
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
