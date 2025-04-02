import {
  BloomLevel,
  EditFlashcardFragment$key,
} from "@/__generated__/EditFlashcardFragment.graphql";
import {
  EditFlashcardMutation,
  UpdateFlashcardInput,
} from "@/__generated__/EditFlashcardMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { editFlashcardUpdaterClosure } from "@/src/relay-helpers";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useFragment, useMutation } from "react-relay";
import { CreateItem, Item } from "../form-sections/item/ItemFormSectionNew";
import Flashcard from "./Flashcard";
import { FlashcardSideData } from "./FlashcardSide";

// Move the whole thing into react-state to handle updates on it
export const FlashcardFragment = graphql`
  fragment EditFlashcardFragment on Flashcard {
    itemId
    sides {
      label
      text
      isAnswer
      isQuestion
    }
    item {
      associatedBloomLevels
      associatedSkills {
        id
        skillName
        skillCategory
        isCustomSkill
      }
    }
  }
`;

const editFlashcardMutation = graphql`
  mutation EditFlashcardMutation(
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
          itemId
          item {
            associatedBloomLevels
            associatedSkills {
              id
              skillCategory
              skillName
              isCustomSkill
            }
          }
          sides {
            label
            isAnswer
            isQuestion
            text
          }
        }
      }
    }
  }
`;

interface Props {
  title: string;
  onCancel: () => void;
  flashcard: EditFlashcardFragment$key;
  assessmentId: string;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  flashcardPosition: number;
  flashcardSetId: string;
}

export function EditFlashcard({
  title,
  flashcard,
  assessmentId,
  onCancel,
  allSkillsQueryRef,
  flashcardPosition,
  flashcardSetId,
}: Props) {
  const data = useFragment(FlashcardFragment, flashcard);
  const [updateFlashcard, isUpdating] = useMutation<EditFlashcardMutation>(
    editFlashcardMutation
  );

  const { setError } = useError();

  // Destructuring necessary due to `readonly` types from relay
  const [item, setItem] = useState<Item | CreateItem>({
    id: data.itemId,
    associatedSkills: data.item.associatedSkills.map((skill) => ({
      ...skill,
    })),
    associatedBloomLevels: data.item.associatedBloomLevels as BloomLevel[],
  });
  const [flashcardSides, setFlashcardSides] = useState<FlashcardSideData[]>(
    data.sides.map((readOnlySide) => ({ ...readOnlySide }))
  );

  const updaterClosure = useCallback(
    () => editFlashcardUpdaterClosure(flashcardPosition, flashcardSetId),
    []
  );

  const onSave = useCallback(() => {
    const flashcardUpdate: UpdateFlashcardInput = {
      itemId: data.itemId,
      sides: flashcardSides,
    };

    updateFlashcard({
      variables: {
        assessmentId: assessmentId,
        item: item,
        flashcard: flashcardUpdate,
      },
      onError: setError,
      updater: updaterClosure(),
      onCompleted(response, errors) {
        onCancel();
      },
    });
  }, [
    assessmentId,
    data.itemId,
    flashcardSides,
    item,
    setError,
    updateFlashcard,
    updaterClosure,
  ]);

  return (
    <Flashcard
      operation="edit"
      title={title}
      item={item}
      setItem={setItem}
      flashcardSides={flashcardSides}
      setSideData={setFlashcardSides}
      onSave={onSave}
      onCancel={onCancel}
      allSkillsQueryRef={allSkillsQueryRef}
      isProcessing={isUpdating}
    />
  );
}
