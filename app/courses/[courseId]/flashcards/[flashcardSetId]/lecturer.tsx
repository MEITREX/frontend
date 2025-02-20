import { lecturerDeleteFlashcardMutation } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";
import { lecturerEditFlashcardsQuery } from "@/__generated__/lecturerEditFlashcardsQuery.graphql";
import { lecturerUpdateFlashcardAssessmentMutation } from "@/__generated__/lecturerUpdateFlashcardAssessmentMutation.graphql";
import { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { EditFlashcardSetModal } from "@/components/EditFlashcardSetModal";
import { PageError } from "@/components/PageError";
import { LocalFlashcard } from "@/components/flashcard/AddFlashcard";
import { Flashcard } from "@/components/flashcard/LecturerEditFlashcard";
import LecturerFlashcardHeading from "@/components/flashcard/LecturerFlashcardHeading";
import { ItemData } from "@/components/form-sections/ItemFormSection";
import { Add, Delete } from "@mui/icons-material";
import { Backdrop, Button, CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
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

const updateFlashcardSetMutation = graphql`
  mutation lecturerUpdateFlashcardAssessmentMutation(
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
`;

export default function LecturerFlashcards() {
  const { flashcardSetId, courseId } = useParams();
  const [error, setError] = useState<Error | null>(null);

  const [isAddFlashcardOpen, setIsAddFlashcardOpen] = useState(false);

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
          ...AddFlashcardFragment
          ... on FlashcardSetAssessment {
            flashcardSet {
              __id
              flashcards {
                ...ItemFormSectionFragment
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
  const [updateFlashcardSet, isUpdatingFlashcardSet] =
    useMutation<lecturerUpdateFlashcardAssessmentMutation>(
      updateFlashcardSetMutation
    );

  const [isEditSetOpen, setEditSetOpen] = useState(false);

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
  // const isUpdating = isAddingFlashcard || isUpdatingFlashcardSet || isDeleting;
  const isUpdating = false;

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
              onClose={() => setIsAddFlashcardOpen(false)}
              flashcardSet={contentsByIds[0]}
            />
          ) : (
            <Button
              startIcon={<Add />}
              onClick={() => setIsAddFlashcardOpen(true)}
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
