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
import { useCallback, useEffect, useState } from "react";
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

  // const [content, setContent] = useState<(typeof contentsByIds)[0] | null>(
  //   null
  // );
  // useEffect(() => {
  //   if (contentsByIds.length == 0) return;
  //   setContent(contentsByIds[0]);
  // }, [contentsByIds]);
  // const flashcardSet = content?.flashcardSet;

  const [item, setItem] = useState<ItemData | null>({
    associatedBloomLevels: [],
    associatedSkills: [],
    id: undefined,
  });
  useEffect(() => {
    console.log("findAvailableItem", items, flashcard.itemId);

    for (const itemFromList of items) {
      if (itemFromList.id === flashcard.itemId) {
        setItem(itemFromList);
        return;
      }
    }
    setItem({
      associatedBloomLevels: [],
      associatedSkills: [],
      id: undefined,
    });
  }, [flashcard.itemId, items]);

  const [addSideOpen, setAddSideOpen] = useState(false);

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
                skillCategory
                isCustomSkill
              }
              associatedBloomLevels
            }
          }
        }
      }
    `);

  const handleEditFlashcardSide = useCallback(
    (idx: number, editedSide: FlashcardSideData) => {
      const newFlashcard = {
        itemId: flashcard.itemId,
        sides: flashcard.sides.map((side, i) => {
          const { label, text, isQuestion, isAnswer } =
            i == idx ? editedSide : side;
          return { label, text, isQuestion, isAnswer };
        }),
      };

      console.log("handleEditFlashcardSide", newFlashcard);
      updateFlashcard({
        variables: {
          assessmentId: _assessmentId,
          flashcard: newFlashcard,
          item: item,
        },
        onError,
      });
    },
    [
      _assessmentId,
      flashcard.itemId,
      flashcard.sides,
      item,
      onError,
      updateFlashcard,
    ]
  );

  const handleItem = useCallback(
    (item: ItemData | null, newSkillAdded?: boolean) => {
      if (item) {
        setItem(item);
        const newFlashcard = {
          itemId: flashcard.itemId,
          sides: flashcard.sides,
        };

        console.log("handleItem", newFlashcard);
        updateFlashcard({
          variables: {
            assessmentId: _assessmentId,
            flashcard: newFlashcard,
            item: item,
          },
          onError,
          onCompleted() {
            console.log("reloading in LecturerEditFlashcard.tsx");
          },
        });
      }
    },
    [_assessmentId, flashcard.itemId, flashcard.sides, onError, updateFlashcard]
  );

  const handleDeleteFlashcardSide = useCallback(
    (idx: number) => {
      const newFlashcard = {
        itemId: flashcard.itemId,
        sides: flashcard.sides.filter((_, i) => i != idx),
      };

      console.log("handleDeleteFlashcardSide", newFlashcard);
      updateFlashcard({
        variables: {
          assessmentId: _assessmentId,
          flashcard: newFlashcard,
          item: item,
        },
        onError,
      });
    },
    [
      _assessmentId,
      flashcard.itemId,
      flashcard.sides,
      item,
      onError,
      updateFlashcard,
    ]
  );

  const handleAddSideSubmit = useCallback(
    (newSide: FlashcardSideData) => {
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

      console.log("handleAddSideSubmit", newFlashcard);
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
    },
    [
      _assessmentId,
      flashcard.itemId,
      flashcard.sides,
      item,
      onError,
      updateFlashcard,
    ]
  );

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
