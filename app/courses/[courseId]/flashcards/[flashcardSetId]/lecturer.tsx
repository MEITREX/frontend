import { lecturerAddFlashcardMutation } from "@/__generated__/lecturerAddFlashcardMutation.graphql";
import { lecturerDeleteFlashcardMutation } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";
import { lecturerEditFlashcardSetMutation } from "@/__generated__/lecturerEditFlashcardSetMutation.graphql";
import { lecturerEditFlashcardsQuery } from "@/__generated__/lecturerEditFlashcardsQuery.graphql";
import { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { EditFlashcardSetModal } from "@/components/EditFlashcardSetModal";
import { PageError } from "@/components/PageError";
import { FlashcardSideData } from "@/components/flashcard/FlashcardSide";
import { Flashcard } from "@/components/flashcard/LecturerEditFlashcard";
import LecturerFlashcardHeading from "@/components/flashcard/LecturerFlashcardHeading";
import { LocalFlashcard } from "@/components/flashcard/LocalFlashcard";
import { ItemData } from "@/components/form-sections/ItemFormSection";
import { Add, Delete } from "@mui/icons-material";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

interface ErrorContextProps {
  error: Error | null;
  setError: (error: Error | null) => void;
}
const ErrorContext = createContext<ErrorContextProps>({
  error: null,
  setError: () => {},
});
export const useError = () => useContext(ErrorContext);

export default function LecturerFlashcards() {
  const { flashcardSetId, courseId } = useParams();
  const router = useRouter();

  const [error, setError] = useState<Error | null>(null);

  const { contentsByIds } = useLazyLoadQuery<lecturerEditFlashcardsQuery>(
    graphql`
      query lecturerEditFlashcardsQuery($id: UUID!) {
        contentsByIds(ids: [$id]) {
          id
          metadata {
            name
            chapterId
          }

          ...LecturerFlashcardHeadingFragment
          ... on FlashcardSetAssessment {
            flashcardSet {
              __id
              flashcards {
                itemId
                ...LecturerEditFlashcardFragment
              }
            }
            items {
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
          ...EditFlashcardSetModalFragment
        }
      }
    `,
    { id: flashcardSetId }
  );

  const [isAddFlashcardOpen, setAddFlashcardOpen] = useState(false);
  const [isEditSetOpen, setEditSetOpen] = useState(false);

  const [addFlashcard, isAddingFlashcard] =
    useMutation<lecturerAddFlashcardMutation>(graphql`
      mutation lecturerAddFlashcardMutation(
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
    `);
  const [updateFlashcardSet, isUpdatingFlashcardSet] =
    useMutation<lecturerEditFlashcardSetMutation>(graphql`
      mutation lecturerEditFlashcardSetMutation(
        $assessment: UpdateAssessmentInput!
        $contentId: UUID!
      ) {
        mutateContent(contentId: $contentId) {
          updateAssessment(input: $assessment) {
            id
            metadata {
              chapterId
              rewardPoints
              tagNames
              suggestedDate
            }

            assessmentMetadata {
              initialLearningInterval
              skillPoints
              skillTypes
            }
          }
        }
      }
    `);

  const [deleteFlashcard, isDeleting] =
    useMutation<lecturerDeleteFlashcardMutation>(graphql`
      mutation lecturerDeleteFlashcardMutation(
        $flashcardId: UUID!
        $assessmentId: UUID!
      ) {
        mutateFlashcardSet(assessmentId: $assessmentId) {
          deleteFlashcard(id: $flashcardId)
        }
      }
    `);
  const isUpdating = isAddingFlashcard || isUpdatingFlashcardSet || isDeleting;

  if (contentsByIds.length == 0) {
    return <PageError message="No flashcards found with given id." />;
  }

  const content = contentsByIds[0];
  const flashcardSet = content.flashcardSet;
  const transformedItems: ItemData[] =
    content.items?.map((item) => ({
      associatedBloomLevels: Array.from(item.associatedBloomLevels),
      associatedSkills: Array.from(item.associatedSkills).map((skill) => ({
        id: skill.id || undefined,
        skillName: skill.skillName,
        skillCategory: skill.skillCategory,
        isCustomSkill: skill.isCustomSkill,
      })),
      id: item.id,
    })) || [];
  const items = transformedItems;

  if (flashcardSet == null) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content is not of type flashcards."
      />
    );
  }

  function handleAddFlashcard(
    sides: FlashcardSideData[],
    item: ItemData,
    newSkillAdded?: boolean
  ) {
    const newFlashcard = {
      sides,
      itemId: null,
    };

    setAddFlashcardOpen(false);
    addFlashcard({
      variables: {
        flashcard: newFlashcard,
        assessmentId: flashcardSetId,
        item: item,
      },
      onError: setError,
      updater(store, response) {
        // Get record of flashcard set and of the new flashcard
        const flashcardSetRecord = store.get(flashcardSet!.__id);
        const newRecord = store.get(
          response.mutateFlashcardSet.createFlashcard.flashcard!.__id
        );
        if (!flashcardSetRecord || !newRecord) return;

        // Update the linked records of the flashcard set
        const flashcardRecords =
          flashcardSetRecord.getLinkedRecords("flashcards") ?? [];
        console.log(flashcardRecords);
        flashcardSetRecord.setLinkedRecords(
          [...flashcardRecords, newRecord],
          "flashcards"
        );
        const root = store.get(flashcardSetId);

        if (!root) return;

        const items = root?.getLinkedRecords("items") ?? [];

        const newItem = store.get(
          response.mutateFlashcardSet.createFlashcard.item!.id
        );

        if (newItem) {
          root.setLinkedRecords([...items, newItem], "items");
        } else {
          return;
        }
        /* const items = store
        .getRoot()
        .getLinkedRecord("items")
        ?.getLinkedRecords("elements");
        const newItem = store.get(response.mutateFlashcardSet.createFlashcard.item!.id);
        if (!items || !newItem) return;

        store
          .getRoot()
          .getLinkedRecord("items")
          ?.setLinkedRecords([...items, newItem], "elements");*/

        console.log(flashcardSetRecord.getLinkedRecords("flashcards"));
      },
      onCompleted() {
        //reload page, when a new skill is added
        if (newSkillAdded) {
          console.log("reload");
          window.location.reload();
        }
      },
    });
  }

  function handleDeleteFlashcard(flashcardId: string) {
    deleteFlashcard({
      variables: {
        flashcardId: flashcardId,
        assessmentId: flashcardSetId,
      },
      onError: setError,
      updater(store) {
        // Get record of flashcard set
        const flashcardSetRecord = store.get(flashcardSet!.__id);
        if (!flashcardSetRecord) return;

        // Update the linked records of the flashcard set
        const flashcardRecords =
          flashcardSetRecord.getLinkedRecords("flashcards") ?? [];
        flashcardSetRecord.setLinkedRecords(
          flashcardRecords.filter((x) => x.getDataID() !== flashcardId),
          "flashcards"
        );
      },
    });
  }

  function handleUpdateFlashcardSet(
    metadata: ContentMetadataPayload,
    assessmentMetadata: AssessmentMetadataPayload
  ) {
    setEditSetOpen(false);
    updateFlashcardSet({
      variables: {
        assessment: {
          metadata: {
            ...metadata,
            chapterId: content.metadata.chapterId,
          },
          assessmentMetadata,
        },
        contentId: content.id,
      },
      onError: setError,
    });
  }

  return (
    <main>
      <ErrorContext.Provider value={{ error, setError }}>
        <LecturerFlashcardHeading
          content={contentsByIds[0]}
          courseId={courseId}
          setEditContentModal={setEditSetOpen}
        />

        <div className="mt-8 flex flex-col gap-6">
          {flashcardSet.flashcards.map((flashcard, i) => (
            <div key={i}>
              <Flashcard
                key={flashcard.itemId}
                title={`Card ${i + 1}/${flashcardSet.flashcards.length}`}
                onError={setError}
                _flashcard={flashcard}
                _assessmentId={flashcardSetId}
                courseId={courseId}
                items={items}
              />
              <Button
                sx={{ float: "left", color: "red" }}
                startIcon={<Delete />}
                onClick={() => {
                  handleDeleteFlashcard(flashcard.itemId);
                }}
              >
                Delete Flashcard
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          {isAddFlashcardOpen ? (
            <LocalFlashcard
              courseId={courseId}
              onClose={() => setAddFlashcardOpen(false)}
              onSubmit={handleAddFlashcard}
            />
          ) : (
            <Button
              startIcon={<Add />}
              onClick={() => setAddFlashcardOpen(true)}
            >
              Add flashcard
            </Button>
          )}
        </div>

        <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
          <CircularProgress />
        </Backdrop>
        {isEditSetOpen && (
          <EditFlashcardSetModal
            onClose={() => setEditSetOpen(false)}
            onSubmit={handleUpdateFlashcardSet}
            _content={content}
          />
        )}
      </ErrorContext.Provider>
    </main>
  );
}
