import { AddFlashcardFragment$key } from "@/__generated__/AddFlashcardFragment.graphql";
import { AddFlashcardMutation } from "@/__generated__/AddFlashcardMutation.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { CreateItem } from "../form-sections/item/ItemFormSectionNew";
import Flashcard from "./Flashcard";
import { FlashcardSideData } from "./FlashcardSide";

const addFlashcardFragment = graphql`
  fragment AddFlashcardFragment on FlashcardSetAssessment {
    flashcardSet {
      assessmentId # __id
    }
  }
`;

const addFlashcardMutation = graphql`
  mutation AddFlashcardMutation(
    $flashcard: CreateFlashcardInputWithoutItem!
    $assessmentId: UUID!
    $item: CreateItemInput!
  ) {
    mutateFlashcardSet(assessmentId: $assessmentId) {
      assessmentId
      createFlashcard(
        flashcardInput: $flashcard
        assessmentId: $assessmentId
        item: $item
      ) {
        flashcard {
          sides {
            label
            text
            isQuestion
            isAnswer
          }
          item {
            id
            associatedBloomLevels
            associatedSkills {
              id
              isCustomSkill
              skillCategory
              skillName
            }
          }
        }
      }
    }
  }
`;

interface Props {
  onCancel: () => void;
  flashcardSet: AddFlashcardFragment$key;
}

export function AddFlashcard({ onCancel, flashcardSet }: Props) {
  const { courseId } = useParams();
  const { setError } = useError();

  const data = useFragment(addFlashcardFragment, flashcardSet);
  const [addFlashcard] =
    useMutation<AddFlashcardMutation>(addFlashcardMutation);

  const [flashcardItem, setFlashcardItem] = useState<CreateItem>({
    associatedBloomLevels: [],
    associatedSkills: [],
  });
  const [flashcardSides, setFlashcardSides] = useState<FlashcardSideData[]>([]);

  const handleAddFlashcard = useCallback(() => {
    const newFlashcard = { sides: flashcardSides };
    console.log("🚨 alarm " + "flashcardItem:", flashcardItem);
    console.log("🚨 alarm " + "flashcardSides:", flashcardSides);

    addFlashcard({
      variables: {
        flashcard: newFlashcard,
        assessmentId: data.flashcardSet!.assessmentId,
        item: flashcardItem,
      },
      onError: (error) => {
        console.log("🚨 alarm " + "error:", error);
        setError(error);
      },
      // updater: (store, response) => {
      //   // TODO this shouldn't fit the schema any more; some id's might be ambiguous?!

      //   const payload = response.mutateFlashcardSet?.createFlashcard;
      //   console.log("👾️ alien " + "payload:", payload);
      //   if (!payload) return;

      //   const flashcardSetId = data.flashcardSet!;
      //   const flashcardSetsAssessmentRecord = store.get(
      //     flashcardSetId.assessmentId
      //   );
      //   console.log(
      //     "🧠 brain.exe " + "flashcardSetRecord:",
      //     flashcardSetsAssessmentRecord
      //   );
      //   if (!flashcardSetsAssessmentRecord) return;

      //   // Add new flashcard to record
      //   const newFlashcardRecord = store.get(payload.flashcard.item.id);
      //   console.log("🐒 monkey " + "newFlashcardRecord:", newFlashcardRecord);
      //   if (!newFlashcardRecord) return;
      //   const existingFlashcards =
      //     flashcardSetsAssessmentRecord.getLinkedRecords("flashcards") || [];
      //   console.log("🐒 monkey " + "existingFlashcards:", existingFlashcards);
      //   flashcardSetsAssessmentRecord.setLinkedRecords(
      //     [...existingFlashcards, newFlashcardRecord],
      //     "flashcards"
      //   );

      //   // Add the new item record
      //   const newItemRecord = store.get(payload.flashcard.item.id);
      //   console.log("🔍 debug " + "newFlashcardRecord:", newFlashcardRecord);
      //   if (!newItemRecord) return;
      //   const existingItems =
      //     flashcardSetsAssessmentRecord.getLinkedRecords("items") || [];
      //   console.log("🔍 debug " + "existingItems:", existingItems);
      //   const isItemPresent = existingItems.some(
      //     (rec) => rec.getDataID() === newItemRecord.getDataID()
      //   );
      //   if (!isItemPresent) {
      //     flashcardSetsAssessmentRecord.setLinkedRecords(
      //       [...existingItems, newItemRecord],
      //       "items"
      //     );
      //   }
      // },
    });
  }, [
    addFlashcard,
    data.flashcardSet,
    flashcardItem,
    flashcardSides,
    setError,
  ]);

  return (
    <Flashcard
      operation="create"
      title="Add new Flashcard"
      setSideData={setFlashcardSides}
      flashcardSides={flashcardSides}
      item={flashcardItem}
      setItem={setFlashcardItem}
      onSave={handleAddFlashcard}
      onCancel={onCancel}
    />
  );
}
