import {
  BloomLevel,
  EditFlashcardFragment$key,
} from "@/__generated__/EditFlashcardFragment.graphql";
import {
  EditFlashcardMutation,
  UpdateFlashcardInput,
} from "@/__generated__/EditFlashcardMutation.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { useCallback, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { CreateItem, Item } from "../form-sections/item/ItemFormSectionNew";
import Flashcard from "./Flashcard";
import { FlashcardSideData } from "./FlashcardSide";

// Move the whole thing into react-state to handle updates on it
export const FlashcardFragment = graphql`
  fragment EditFlashcardFragment on Flashcard {
    ...ItemFormSectionNewFragment
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
          item {
            associatedSkills {
              id
            }
          }
          sides {
            label
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
}

export function EditFlashcard({
  title,
  flashcard,
  assessmentId,
  onCancel,
}: Props) {
  const data = useFragment(FlashcardFragment, flashcard);
  const [updateFlashcard, isUpdating] = useMutation<EditFlashcardMutation>(
    editFlashcardMutation
  );

  const { setError } = useError();

  // FIXME state update cycles might occur when a new skill is added:
  //  returning a id to the new created skill should re-trigger the update

  // Destructuring necessary due to `readonly` types from relay
  const [item, setItem] = useState<Item | CreateItem>({
    id: data.itemId,
    associatedSkills: data.item.associatedSkills.map((skill) => ({
      ...skill,
    })),
    associatedBloomLevels: data.item.associatedBloomLevels as BloomLevel[],
  });
  // TODO does this work as expected?
  const [flashcardSides, setFlashcardSides] = useState<FlashcardSideData[]>(
    data.sides.map((readOnlySide) => ({ ...readOnlySide }))
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
      updater(store, data) {
        // TODO
        console.log("updater @EditFlashcard", store, data);
      },
      onCompleted(response, errors) {
        console.log("onCompleted", response, errors);
      },
    });
  }, [
    assessmentId,
    data.itemId,
    flashcardSides,
    item,
    setError,
    updateFlashcard,
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
    />
  );
}
