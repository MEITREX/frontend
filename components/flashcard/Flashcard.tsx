import { Add } from "@mui/icons-material";
import { Button, IconButton, Tooltip, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import ItemFormSection, {
  isItemEditable,
  ItemFormSectionProps,
} from "../form-sections/item/ItemFormSection";
import { EditSideModal } from "./EditSideModal";
import { FlashcardSide, FlashcardSideData } from "./FlashcardSide";

type FlashcardProps = {
  title: string;
  flashcardSides: FlashcardSideData[];
} & ItemFormSectionProps &
  (
    | {
        operation: "edit" | "create";
        setSideData: Dispatch<SetStateAction<FlashcardSideData[]>>;
        onCancel: () => void;
        onSave: () => void;
        isProcessing: boolean;
      }
    | {
        operation: "view";
      }
  );

const Flashcard = (props: FlashcardProps) => {
  const { title, operation, flashcardSides, item } = props;
  const isEditable = operation !== "view";

  const [addNewFlashcardSide, setAddNewFlashcardSide] =
    useState<boolean>(false);

  // predicates for valid flashcard entry
  const hasQuestion = flashcardSides.some((s) => s.isQuestion);
  const hasAnswer = flashcardSides.some((s) => s.isAnswer);
  //const isAssociatedDataPresent = item.associatedBloomLevels.length > 0 && item.associatedSkills.length > 0;
  const isFlashcardValid = hasQuestion && hasAnswer; //&& isAssociatedDataPresent;

  const errorMessage = !hasQuestion
    ? "At least one question side is required to save"
    : "At least one answer side is required to save";

  return (
    <>
      <div className="pt-4 pb-6 -mx-8 px-8 bg-gray-50">
        <Typography variant="overline" color="textSecondary">
          {title}
        </Typography>

        {/* Prop destructuring is fix for type error */}
        <ItemFormSection {...(isItemEditable(props) ? props : props)} />
        <div className="flex flex-wrap gap-2 mt-4">
          {flashcardSides.map((currentSide, i) => (
            <FlashcardSide
              key={`flashcard-${title}-side-${i}`}
              sideData={currentSide}
              // If editable, setter for the side data is necessary
              {...(isEditable
                ? {
                    sideDataIndex: i,
                    setSideData: props.setSideData,
                    operation,
                  }
                : {
                    operation,
                  })}
            />
          ))}
          {isEditable &&
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
      {isEditable && (
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
