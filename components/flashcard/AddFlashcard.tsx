import { AddFlashcardFragment$key } from "@/__generated__/AddFlashcardFragment.graphql";
import { AddFlashcardMutation } from "@/__generated__/AddFlashcardMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { flashcardUpdaterClosure } from "@/src/relay-helpers";
import { useParams } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { PreloadedQuery, useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { useError } from "../ErrorContext";
import { CreateItem } from "../form-sections/item/ItemFormSectionNew";
import Flashcard from "./Flashcard";
import { FlashcardSideData } from "./FlashcardSide";

const addFlashcardFragment = graphql`
  fragment AddFlashcardFragment on FlashcardSetAssessment {
    flashcardSet {
      assessmentId # == __id?
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
  flashcardSet: AddFlashcardFragment$key;
  onClose: () => void;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  flashcardSetNumber: number;
  setFlashcardSetNumber: Dispatch<SetStateAction<number>>;
  showSuccessSnackbar: () => void;
}

export function AddFlashcard({
  onClose,
  flashcardSet,
  allSkillsQueryRef,
  flashcardSetNumber,
  setFlashcardSetNumber,
  showSuccessSnackbar,
}: Props) {
  const { flashcardSetId, courseId } = useParams();
  const { setError } = useError();

  const data = useFragment(addFlashcardFragment, flashcardSet);
  const [addFlashcard] =
    useMutation<AddFlashcardMutation>(addFlashcardMutation);

  const [flashcardItem, setFlashcardItem] = useState<CreateItem>({
    associatedBloomLevels: [],
    associatedSkills: [],
  });
  const [flashcardSides, setFlashcardSides] = useState<FlashcardSideData[]>([]);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const updater = useCallback(
    () =>
      flashcardUpdaterClosure(
        "create",
        flashcardSetId,
        flashcardSetNumber,
        courseId
      ),
    [flashcardSetId, flashcardSetNumber, courseId]
  );

  const handleAddFlashcard = useCallback(() => {
    setIsAdding(true);
    const newFlashcard = { sides: flashcardSides };

    addFlashcard({
      variables: {
        flashcard: newFlashcard,
        assessmentId: data.flashcardSet!.assessmentId,
        item: flashcardItem,
      },
      onError: setError,
      updater: updater(),
      onCompleted: (response) => {
        setFlashcardSetNumber((prev) => prev + 1);
        setIsAdding(false);

        showSuccessSnackbar();
        onClose();
      },
    });
  }, [
    flashcardSides,
    addFlashcard,
    data.flashcardSet,
    flashcardItem,
    setError,
    updater,
    setFlashcardSetNumber,
    showSuccessSnackbar,
    onClose,
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
      onCancel={onClose}
      allSkillsQueryRef={allSkillsQueryRef}
      isProcessing={isAdding}
    />
  );
}
