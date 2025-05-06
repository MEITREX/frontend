import { Add } from "@mui/icons-material";
import { Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import ItemFormSection, {
  ItemFormSectionProps,
} from "../form-sections/item/ItemFormSection";
import { EditSideModal } from "./EditSideModal";
import { FlashcardSide, FlashcardSideData } from "./FlashcardSide";
import ItemFormSectionPreview, {
  ItemFormSectionPreviewProps,
} from "../form-sections/item/ItemFormSectionPreview";
import { FlashcardSidePreview } from "./FlashcardSidePreview";
type FlashcardProps =
  | (ItemFormSectionProps & {
      operation: "create" | "edit";
      title: string;
      flashcardSides: FlashcardSideData[];
      setSideData: Dispatch<SetStateAction<FlashcardSideData[]>>;
      onCancel: () => void;
      onSave: () => void;
      isProcessing: boolean;
    })
  | (ItemFormSectionPreviewProps & {
      title: string;
      flashcardSides: FlashcardSideData[];
      operation: "view";
    });
const Flashcard = (props: FlashcardProps) => {
  const [addNewFlashcardSide, setAddNewFlashcardSide] =
    useState<boolean>(false);

  // predicates for valid flashcard entry
  const hasQuestion = props.flashcardSides.some((s) => s.isQuestion);
  const hasAnswer = props.flashcardSides.some((s) => s.isAnswer);
  const isFlashcardValid = hasQuestion && hasAnswer;

  const errorMessage = !hasQuestion
    ? "At least one question side is required to save"
    : "At least one answer side is required to save";

  return (
    <>
      <div className="pt-4 pb-6 -mx-8 px-8 bg-gray-50 flex flex-col gap-y-2">
        <Typography variant="overline" color="textSecondary">
          {props.title}
        </Typography>

        {/* Prop destructuring is fix for type error */}
        {props.operation === "view" ? (
          <ItemFormSectionPreview item={props.item} />
        ) : (
          <ItemFormSection {...props} />
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {props.flashcardSides.map((currentSide, i) =>
            props.operation === "view" ? (
              <FlashcardSidePreview
                key={`flashcard-${props.title}-side-${i}`}
                sideData={currentSide}
              />
            ) : (
              <FlashcardSide
                key={`flashcard-${props.title}-side-${i}`}
                sideData={currentSide}
                sideDataIndex={i}
                setSideData={props.setSideData}
                operation={props.operation}
              />
            )
          )}
          {props.operation !== "view" &&
            (addNewFlashcardSide ? (
              <EditSideModal
                onClose={() => setAddNewFlashcardSide(false)}
                onSubmit={(data) => {
                  props.setSideData((prev) => {
                    const newSideData = [...prev];
                    newSideData.push(data);
                    return newSideData;
                  });
                  setAddNewFlashcardSide(false);
                }}
              />
            ) : (
              <IconButton onClick={() => setAddNewFlashcardSide(true)}>
                <Add fontSize="small" />
              </IconButton>
            ))}
        </div>
      </div>
      {props.operation !== "view" && (
        // unfortunately, this css must be adjusted to the one in lecturer.tsx
        <div className="flex gap-x-2 mt-4">
          <Tooltip title={errorMessage} disableHoverListener={isFlashcardValid}>
            {/* required for Tooltip to work */}
            <span>
              <Button
                variant="contained"
                disabled={!isFlashcardValid}
                onClick={props.onSave}
              >
                Save
                {props.isProcessing && "ing..."}
              </Button>
            </span>
          </Tooltip>
          <Button onClick={props.onCancel}>Cancel</Button>
        </div>
      )}
    </>
  );
};

export default Flashcard;
