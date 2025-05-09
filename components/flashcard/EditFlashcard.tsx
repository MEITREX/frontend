import { EditFlashcardFragment$key } from "@/__generated__/EditFlashcardFragment.graphql";
import {
  EditFlashcardMutation,
  UpdateFlashcardInput,
} from "@/__generated__/EditFlashcardMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { flashcardUpdaterClosure } from "@/src/relay-helpers/flashcard";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useFragment, useMutation } from "react-relay";
import { useError } from "../ErrorContext";
import {
  CreateItem,
  Item,
  mapRelayItemToItem,
} from "../form-sections/item/ItemFormSection";
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
          item {
            id
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
  flashcardNumber: number;
}

export function EditFlashcard({
  title,
  flashcard,
  assessmentId,
  onCancel,
  allSkillsQueryRef,
  flashcardNumber,
}: Props) {
  const { flashcardSetId, courseId } = useParams();
  const { setError } = useError();

  const data = useFragment(FlashcardFragment, flashcard);
  const [updateFlashcard, isUpdating] = useMutation<EditFlashcardMutation>(
    editFlashcardMutation
  );

  const [item, setItem] = useState<Item | CreateItem>(mapRelayItemToItem(data));
  const [flashcardSides, setFlashcardSides] = useState<FlashcardSideData[]>(
    data.sides.map((readOnlySide) => ({ ...readOnlySide }))
  );

  const updater = useCallback(
    () =>
      flashcardUpdaterClosure(
        "update",
        flashcardSetId,
        flashcardNumber,
        courseId
      ),
    [flashcardNumber, flashcardSetId, courseId]
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
      updater: updater(),
      onCompleted: () => {
        onCancel();
        // TODO add snackbar
      },
    });
  }, [
    assessmentId,
    data.itemId,
    flashcardSides,
    item,
    onCancel,
    setError,
    updateFlashcard,
    updater,
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
