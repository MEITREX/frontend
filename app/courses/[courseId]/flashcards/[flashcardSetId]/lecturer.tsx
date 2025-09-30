import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { lecturerDeleteFlashcardMutation } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";
import { lecturerEditFlashcardsQuery } from "@/__generated__/lecturerEditFlashcardsQuery.graphql";
import { lecturerUpdateFlashcardAssessmentMutation } from "@/__generated__/lecturerUpdateFlashcardAssessmentMutation.graphql";
import { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { EditFlashcardSetModal } from "@/components/EditFlashcardSetModal";
import { ErrorContext, ES2022Error } from "@/components/ErrorContext";
import { PageError } from "@/components/PageError";
import { AddFlashcard } from "@/components/flashcard/AddFlashcard";
import { EditFlashcard } from "@/components/flashcard/EditFlashcard";
import LecturerFlashcardHeader from "@/components/flashcard/FlashcardHeader";
import FlashcardView from "@/components/flashcard/FlashcardView";
import SuccessSnackbar from "@/components/flashcard/SuccessSnackbar";
import { flashcardUpdaterDeleteClosure } from "@/src/relay-helpers/flashcard";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  graphql,
  useLazyLoadQuery,
  useMutation,
  useQueryLoader,
} from "react-relay";

const RootQuery = graphql`
  query lecturerEditFlashcardsQuery($id: UUID!) {
    contentsByIds(ids: [$id]) {
      id
      metadata {
        name
        chapterId
      }

      ...FlashcardHeaderFragment
      ...EditFlashcardSetModalFragment
      ...AddFlashcardFragment
      ... on FlashcardSetAssessment {
        flashcardSet {
          __id
          flashcards {
            itemId
            ...EditFlashcardFragment
          }
        }
      }
    }
  }
`;

const UpdateFlashcardSetMutation = graphql`
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
const DeleteFlashcard = graphql`
  mutation lecturerDeleteFlashcardMutation(
    $flashcardId: UUID!
    $assessmentId: UUID!
  ) {
    mutateFlashcardSet(assessmentId: $assessmentId) {
      deleteFlashcard(id: $flashcardId)
    }
  }
`;

export const AllSkillQuery = graphql`
  query lecturerAllSkillsQuery($courseId: UUID!) {
    coursesByIds(ids: [$courseId]) {
      ...ItemFormSectionNewAllSkillsFragment
    }
  }
`;

export default function LecturerFlashcards() {
  const { flashcardSetId, courseId } = useParams();
  const [error, setError] = useState<ES2022Error | Error | null>(null);
  const errorContext = useMemo(() => ({ error, setError }), [error]);

  const data = useLazyLoadQuery<lecturerEditFlashcardsQuery>(RootQuery, {
    id: flashcardSetId,
  });

  const [queryReference, loadQuery] =
    useQueryLoader<lecturerAllSkillsQuery>(AllSkillQuery);

  const [updateFlashcardSet, isUpdatingFlashcardSet] =
    useMutation<lecturerUpdateFlashcardAssessmentMutation>(
      UpdateFlashcardSetMutation
    );

  const [isEditSetOpen, setEditSetOpen] = useState(false);

  const [isAddFlashcardOpen, setIsAddFlashcardOpen] = useState(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState<boolean>(false);

  const [editingFlashcard, setEditingFlashcard] = useState<number | null>(null);
  const onEditCancel = useCallback(() => {
    setEditingFlashcard(null);
  }, []);

  useEffect(() => {
    if (!queryReference) {
      loadQuery({ courseId });
    }
  }, [courseId, loadQuery, queryReference]);

  const [deleteFlashcard, isDeleting] =
    useMutation<lecturerDeleteFlashcardMutation>(DeleteFlashcard);

  const handleDeleteFlashcard = useCallback(
    (flashcardId: string, flashcardNumber: number) => {
      deleteFlashcard({
        variables: {
          flashcardId: flashcardId,
          assessmentId: flashcardSetId,
        },
        onError: setError,
        updater: flashcardUpdaterDeleteClosure(
          flashcardSetId,
          flashcardNumber,
          courseId
        ),
      });
    },
    [deleteFlashcard, courseId, flashcardSetId]
  );

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

  const content = data.contentsByIds[0];
  const flashcardSet = content.flashcardSet;

  const [flashcardSetsAdded, setFlashcardSetsAdded] = useState<number>(
    // can be enforced since only used in AddFlashcard, which only can be present if the FlashcardSet is defined
    flashcardSet!.flashcards.length
  );

  if (flashcardSet == null) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content is not of type flashcard set."
      />
    );
  }

  return (
    <main>
      <ErrorContext.Provider value={errorContext}>
        <LecturerFlashcardHeader
          content={content}
          openEditFlashcardSetModal={() => setEditSetOpen(true)}
        />

        <div className="mt-8">
          {flashcardSet.flashcards.map((flashcard, i) => (
            <div key={i}>
              {editingFlashcard === i ? (
                <EditFlashcard
                  key={flashcard.itemId}
                  title={`Card ${i + 1}/${flashcardSet.flashcards.length}`}
                  flashcard={flashcard}
                  assessmentId={content.id}
                  onCancel={onEditCancel}
                  allSkillsQueryRef={queryReference}
                  flashcardNumber={i}
                />
              ) : (
                <>
                  <FlashcardView
                    title={`Card ${i + 1}/${flashcardSet.flashcards.length}`}
                    flashcard={flashcard}
                  />
                  {/* unfortunately, this css must be adjusted to the one in Flashcard.tsx */}
                  <div className="flex flex-row justify-between gap-x-2 mt-4">
                    <Button
                      disabled={isAddFlashcardOpen}
                      startIcon={<Edit />}
                      onClick={() => setEditingFlashcard(i)}
                    >
                      Edit
                    </Button>
                    <Button
                      disabled={isAddFlashcardOpen}
                      sx={{ color: "red" }}
                      startIcon={<Delete />}
                      onClick={() => {
                        if (
                          confirm(
                            "Do you really want to delete this flashcard? This can't be undone."
                          )
                        ) {
                          handleDeleteFlashcard(flashcard.itemId, i);
                        }
                      }}
                    >
                      Delete Flashcard
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          {isAddFlashcardOpen ? (
            <AddFlashcard
              onClose={() => setIsAddFlashcardOpen(false)}
              flashcardSet={content}
              allSkillsQueryRef={queryReference}
              flashcardSetNumber={flashcardSetsAdded}
              setFlashcardSetNumber={setFlashcardSetsAdded}
              showSuccessSnackbar={() => setIsSnackbarVisible(true)}
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

        {isEditSetOpen && (
          <EditFlashcardSetModal
            onClose={() => setEditSetOpen(false)}
            onSubmit={handleUpdateFlashcardSet}
            _content={content}
          />
        )}
      </ErrorContext.Provider>

      <SuccessSnackbar
        visible={isSnackbarVisible}
        onClose={() => setIsSnackbarVisible(false)}
        message="Flashcard added successfully!"
      />
    </main>
  );
}
