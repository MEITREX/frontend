import { AddFlashcardFragment$key } from "@/__generated__/AddFlashcardFragment.graphql";
import { AddFlashcardMutation } from "@/__generated__/AddFlashcardMutation.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { Add } from "@mui/icons-material";
import { Button, Tooltip, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { ItemData, ItemFormSection } from "../form-sections/ItemFormSection";
import { EditSideModal } from "./EditSideModal";
import { FlashcardSide, FlashcardSideData } from "./FlashcardSide";

const flashcardSetFragment = graphql`
  fragment AddFlashcardFragment on Content {
    ... on FlashcardSetAssessment {
      flashcardSet {
        __id
      }
    }
  }
`;
const addFlashcardMutation = graphql`
  mutation AddFlashcardMutation(
    $flashcard: CreateFlashcardInput!
    $assessmentId: UUID!
    $item: ItemInput!
  ) {
    mutateFlashcardSet(assessmentId: $assessmentId) {
      assessmentId
      createFlashcard(
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
`;

interface Props {
  onClose: () => void;
  flashcardSet: AddFlashcardFragment$key;
}

export function LocalFlashcard({ onClose, flashcardSet }: Props) {
  const { courseId } = useParams();
  const { setError } = useError();

  const data = useFragment(flashcardSetFragment, flashcardSet);
  const [addFlashcard] =
    useMutation<AddFlashcardMutation>(addFlashcardMutation);

  const handleAddFlashcard = useCallback(
    (sides: FlashcardSideData[], item: ItemData) => {
      const newFlashcard = { sides, itemId: null };

      // onClose();

      addFlashcard({
        variables: {
          flashcard: newFlashcard,
          assessmentId: data.flashcardSet!.__id,
          item: item,
        },
        onError: setError,
        updater: (store, response) => {
          const payload = response.mutateFlashcardSet?.createFlashcard;
          console.log("👾️ alien " + "payload:", payload);
          if (!payload) return;

          const flashcardSetId = data.flashcardSet!.__id;
          const flashcardSetRecord = store.get(flashcardSetId);
          console.log(
            "🧠 brain.exe " + "flashcardSetRecord:",
            flashcardSetRecord
          );
          if (!flashcardSetRecord) return;

          // Add new flashcard to record
          const newFlashcardRecord = store.get(payload.flashcard.__id);
          console.log("🐒 monkey " + "newFlashcardRecord:", newFlashcardRecord);
          if (!newFlashcardRecord) return;
          const existingFlashcards =
            flashcardSetRecord.getLinkedRecords("flashcards") || [];
          console.log("🐒 monkey " + "existingFlashcards:", existingFlashcards);
          flashcardSetRecord.setLinkedRecords(
            [...existingFlashcards, newFlashcardRecord],
            "flashcards"
          );

          // Add the new item record
          const newItemRecord = store.get(payload.item.id);
          console.log("🔍 debug " + "newFlashcardRecord:", newFlashcardRecord);
          if (!newItemRecord) return;
          const existingItems =
            flashcardSetRecord.getLinkedRecords("items") || [];
          console.log("🔍 debug " + "existingItems:", existingItems);
          const isItemPresent = existingItems.some(
            (rec) => rec.getDataID() === newItemRecord.getDataID()
          );
          if (!isItemPresent) {
            flashcardSetRecord.setLinkedRecords(
              [...existingItems, newItemRecord],
              "items"
            );
          }
        },
      });
    },
    [addFlashcard, data.flashcardSet, setError]
  );

  const [flashcardSides, setFlashcardSides] = useState<FlashcardSideData[]>([]);
  const [isAddSideModalOpen, setIsAddSideModalOpen] = useState(false);

  const hasQuestion = flashcardSides.some((s) => s.isQuestion);
  const hasAnswer = flashcardSides.some((s) => s.isAnswer);

  const [item, setItem] = useState({
    associatedBloomLevels: [],
    associatedSkills: [],
  });

  const isAssociatedDataPresent =
    item.associatedBloomLevels.length > 0 && item.associatedSkills.length > 0;
  const isFlashcardValid = hasQuestion && hasAnswer && isAssociatedDataPresent;

  const onEditFlashcardSide = useCallback(
    (index: number, sideEdited: FlashcardSideData) => {
      setFlashcardSides((prev) => prev.splice(index, 1, sideEdited));
    },
    []
  );

  const onAddFlashcardSide = useCallback((data: FlashcardSideData) => {
    setFlashcardSides((sides) => [...sides, data]);
    setIsAddSideModalOpen(false);
  }, []);

  const saveButton = (
    <span>
      <Button
        variant="contained"
        disabled={!isFlashcardValid}
        onClick={() => handleAddFlashcard(flashcardSides, item)}
      >
        Save
      </Button>
    </span>
  );

  return (
    <div className="pt-4 pb-6 -mx-8 px-8 bg-gray-50">
      <Typography variant="overline" color="textSecondary">
        New flashcard (not saved)
      </Typography>
      <ItemFormSection courseId={courseId} item={item} onChange={handleItem} />
      <div className="flex flex-wrap gap-2">
        {flashcardSides.map((side, i) => (
          <FlashcardSide
            key={`add-flashcard-${i}`}
            side={side}
            onChange={(data) => onEditFlashcardSide(i, data)}
          />
        ))}
      </div>
      <Button
        startIcon={<Add />}
        sx={{ marginTop: 1 }}
        onClick={() => setIsAddSideModalOpen(true)}
      >
        Add side
      </Button>
      <div className="mt-4 flex gap-2">
        {hasQuestion < 1 ? (
          <Tooltip title="At least one question side is required to save">
            {saveButton}
          </Tooltip>
        ) : hasAnswer < 1 ? (
          <Tooltip title="At least one answer side is required to save">
            {saveButton}
          </Tooltip>
        ) : (
          saveButton
        )}
        <Button onClick={onClose}>Cancel</Button>
      </div>
      {isAddSideModalOpen && (
        <EditSideModal
          onClose={() => setIsAddSideModalOpen(false)}
          onSubmit={onAddFlashcardSide}
        />
      )}
    </div>
  );
}
