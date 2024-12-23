import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
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
import { useEffect, useMemo, useState } from "react";
import { Form, FormSection } from "../Form";
import { FormErrors } from "../FormErrors";
import { RichTextEditor, serializeToText } from "../RichTextEditor";
import { EditRichTextButton } from "./EditRichTextButton";
import { HintFormSection } from "./HintFormSection";
import { ItemFormSection, ItemData } from "../ItemFormSection";

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

export function AssociationQuestionModal({
  _allRecords,
  open,
  title,
  item,
  courseId,
  error,
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
  item: ItemData;
  courseId: string;
  initialValue: AssociationQuestionData;
  isLoading: boolean;
  onSave: (
    data: AssociationQuestionData,
    item: ItemData,
    newSkillAdded?: boolean
  ) => void;
  onClose: () => void;
  clearError: () => void;
}) {
  const [data, setData] = useState(initialValue);
  const [itemForQuestion, setItem] = useState(item);
  const updateElement = (index: number, value: SingleAssociationData) => {
    setData((oldValue) => ({
      ...oldValue,
      correctAssociations: [
        ...oldValue.correctAssociations.slice(0, index),
        value,
        ...oldValue.correctAssociations.slice(index + 1),
      ],
    }));
  };
  const addElement = (value: SingleAssociationData) => {
    setData((oldValue) => ({
      ...oldValue,
      correctAssociations: [...oldValue.correctAssociations, value],
    }));
  };
  const deleteElement = (index: number) => {
    setData((oldValue) => ({
      ...oldValue,
      correctAssociations: [
        ...oldValue.correctAssociations.slice(0, index),
        ...oldValue.correctAssociations.slice(index + 1),
      ],
    }));
  };

  const atLeastTwoItems = useMemo(
    () => data.correctAssociations.length >= 2,
    [data.correctAssociations]
  );

  const hasTitle = !!serializeToText(data.text);

  const allItemsFilled = useMemo(
    () =>
      data.correctAssociations.every(
        (x) => serializeToText(x.left) && serializeToText(x.right)
      ),
    [data.correctAssociations]
  );

  const valid =
    hasTitle &&
    atLeastTwoItems &&
    allItemsFilled &&
    itemForQuestion.associatedBloomLevels.length > 0 &&
    itemForQuestion.associatedSkills.length > 0;

  useEffect(() => {
    if (!open) {
      setData(initialValue);
      setItem(item);
    }
  }, [open, initialValue, item]);

  function handleItem(itemInput: ItemData | null) {
    if (itemInput) {
      setItem(itemInput);
    } else {
      setItem({ associatedBloomLevels: [], associatedSkills: [] });
    }
    console.log("finished");
  }
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
              className="w-[700px]"
              _allRecords={_allRecords}
              label="Text"
              initialValue={data.text}
              required
              onChange={(text) =>
                setData((oldValue) => ({ ...oldValue, text }))
              }
            />
          </FormSection>
          <FormSection title="Items">
            {data.correctAssociations.length > 0 && (
              <div className="flex flex-col gap-8 mb-2">
                {data.correctAssociations.map((elem, i) => (
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
                            updateElement(i, { ...elem, left })
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
                            updateElement(i, { ...elem, right })
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
                          updateElement(i, {
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
                  addElement({ left: "", right: "", feedback: null })
                }
              >
                Add item
              </Button>
            </div>
          </FormSection>
          <HintFormSection
            _allRecords={_allRecords}
            initialValue={data.hint}
            onChange={(hint) => {
              setData((oldData) => ({ ...oldData, hint }));
            }}
          />
        </Form>
      </DialogContent>
      <DialogActions>
        <div className="text-red-600 text-xs mr-3">
          {!atLeastTwoItems && <div>Add at least two items</div>}
          {atLeastTwoItems && !allItemsFilled && (
            <div>All items need a text</div>
          )}
          {!hasTitle && <div>A title is required</div>}
          {itemForQuestion.associatedBloomLevels.length < 1 && (
            <div>Level of Blooms Taxonomy are required</div>
          )}
          {itemForQuestion.associatedSkills.length < 1 && (
            <div>At least one skill is required</div>
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
