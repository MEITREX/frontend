import { LecturerEditFlashcardFragment$key } from "@/__generated__/LecturerEditFlashcardFragment.graphql";
import { LecturerEditFlashcardMutation } from "@/__generated__/LecturerEditFlashcardMutation.graphql";
import { Add } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Backdrop,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { ItemData, ItemFormSection } from "../form-sections/ItemFormSection";
import { EditSideModal } from "./EditSideModal";
import { FlashcardSide, FlashcardSideData } from "./FlashcardSide";
export function Flashcard({
  title,
  onError,
  _flashcard,
  _assessmentId,
  courseId,
  items,
}: {
  title: string;
  onError: (error: any) => void;
  _flashcard: LecturerEditFlashcardFragment$key;
  _assessmentId: string;
  courseId: string;
  items: ItemData[];
}) {
  const flashcard = useFragment(
    graphql`
      fragment LecturerEditFlashcardFragment on Flashcard {
        itemId
        sides {
          label
          text
          isQuestion
          isAnswer
        }
      }
    `,
    _flashcard
  );

  const findAvailableItem = (items: ItemData[], itemId: string): ItemData => {
    for (let itemFromList of items) {
      if (itemFromList.id === itemId) {
        return itemFromList;
      }
    }
    return {
      associatedBloomLevels: [],
      associatedSkills: [],
      id: undefined,
    };
  };

  const [addSideOpen, setAddSideOpen] = useState(false);
  const [item, setItem] = useState<ItemData>(() =>
    findAvailableItem(items, flashcard.itemId)
  );
  const [updateFlashcard, isUpdating] =
    useMutation<LecturerEditFlashcardMutation>(graphql`
      mutation LecturerEditFlashcardMutation(
        $flashcard: UpdateFlashcardInput!
        $assessmentId: UUID!
        $item: ItemInput!
      ) {
        mutateFlashcardSet(assessmentId: $assessmentId) {
          assessmentId
          updateFlashcard(
            flashcardInput: $flashcard
            assessmentId: $assessmentId
            item: $item
          ) {
            flashcard {
              __id
              itemId
              ...LecturerEditFlashcardFragment
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

  function handleEditFlashcardSide(idx: number, editedSide: FlashcardSideData) {
    const newFlashcard = {
      itemId: flashcard.itemId,
      sides: flashcard.sides.map((side, i) => {
        const { label, text, isQuestion, isAnswer } =
          i == idx ? editedSide : side;
        return { label, text, isQuestion, isAnswer };
      }),
    };

    updateFlashcard({
      variables: {
        assessmentId: _assessmentId,
        flashcard: newFlashcard,
        item: item,
      },
      onError,
    });
  }

  function handleItem(item: ItemData | null, newSkillAdded?: boolean) {
    if (item) {
      setItem(item);
      const newFlashcard = {
        itemId: flashcard.itemId,
        sides: flashcard.sides,
      };

      updateFlashcard({
        variables: {
          assessmentId: _assessmentId,
          flashcard: newFlashcard,
          item: item,
        },
        onError,
        onCompleted() {
          //reload page, when a new skill is added
          if (newSkillAdded) {
            console.log("reload");
            window.location.reload();
          }
          console.log("logger");
        },
      });
    }
  }

  function handleDeleteFlashcardSide(idx: number) {
    const newFlashcard = {
      itemId: flashcard.itemId,
      sides: flashcard.sides.filter((_, i) => i != idx),
    };

    updateFlashcard({
      variables: {
        assessmentId: _assessmentId,
        flashcard: newFlashcard,
        item: item,
      },
      onError,
    });
  }

  function handleAddSideSubmit(newSide: FlashcardSideData) {
    const newFlashcard = {
      itemId: flashcard.itemId,
      sides: [
        ...flashcard.sides.map(({ label, text, isQuestion, isAnswer }) => ({
          label,
          text,
          isQuestion,
          isAnswer,
        })),
        newSide,
      ],
    };

    updateFlashcard({
      variables: {
        assessmentId: _assessmentId,
        flashcard: newFlashcard,
        item: item,
      },
      onError,
      onCompleted() {
        setAddSideOpen(false);
      },
    });
  }

  return (
    <>
      <div>
        <Typography variant="overline" color="textSecondary">
          {title}
        </Typography>
        <ItemFormSection
          onChange={handleItem}
          item={item}
          courseId={courseId}
        />
        <div className="flex flex-wrap gap-2">
          {flashcard.sides.map((side, i) => (
            <div key={i} className="flex items-center">
              <FlashcardSide
                key={`${flashcard.itemId}-${i}`}
                side={side}
                onChange={(data) => handleEditFlashcardSide(i, data)}
              />
              <IconButton onClick={() => handleDeleteFlashcardSide(i)}>
                <ClearIcon />
              </IconButton>
            </div>
          ))}
        </div>
        <Button
          sx={{ marginTop: 1 }}
          startIcon={<Add />}
          onClick={() => setAddSideOpen(true)}
        >
          Add side
        </Button>
      </div>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
      {addSideOpen && (
        <EditSideModal
          onClose={() => setAddSideOpen(false)}
          onSubmit={handleAddSideSubmit}
        />
      )}
    </>
  );
}
