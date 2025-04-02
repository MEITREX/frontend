import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { lecturerDeleteFlashcardMutation } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";
import { lecturerEditFlashcardsQuery } from "@/__generated__/lecturerEditFlashcardsQuery.graphql";
import { lecturerUpdateFlashcardAssessmentMutation } from "@/__generated__/lecturerUpdateFlashcardAssessmentMutation.graphql";
import { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { EditFlashcardSetModal } from "@/components/EditFlashcardSetModal";
import { ES2022Error } from "@/components/FormErrors";
import { PageError } from "@/components/PageError";
import { AddFlashcard } from "@/components/flashcard/AddFlashcard";
import { EditFlashcard } from "@/components/flashcard/EditFlashcard";
import FlashcardView from "@/components/flashcard/FlashcardView";
import LecturerFlashcardHeader from "@/components/flashcard/LecturerFlashcardHeader";
import SuccessSnackbar from "@/components/flashcard/SuccessSnackbar";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  graphql,
  useLazyLoadQuery,
  useMutation,
  useQueryLoader,
} from "react-relay";

const rootQuery = graphql`
  query lecturerEditFlashcardsQuery($id: UUID!) {
    contentsByIds(ids: [$id]) {
      id
      metadata {
        name
        chapterId
      }

      ...LecturerFlashcardHeaderFragment
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

export const allSkillQuery = graphql`
  query lecturerAllSkillsQuery($courseId: UUID!) {
    coursesByIds(ids: [$courseId]) {
      ...ItemFormSectionNewAllSkillsFragment
    }
  }
`;

interface ErrorContextProps {
  error: ES2022Error | null;
  setError: (error: ES2022Error | null) => void;
}
const ErrorContext = createContext<ErrorContextProps>({
  error: null,
  setError: () => {},
});
export const useError = () => useContext(ErrorContext);

export default function LecturerFlashcards() {
  const { flashcardSetId, courseId } = useParams();
  const [error, setError] = useState<ES2022Error | null>(null);

  const data = useLazyLoadQuery<lecturerEditFlashcardsQuery>(rootQuery, {
    id: flashcardSetId,
  });
  const [queryReference, loadQuery] =
    useQueryLoader<lecturerAllSkillsQuery>(allSkillQuery);

  const [updateFlashcardSet, isUpdatingFlashcardSet] =
    useMutation<lecturerUpdateFlashcardAssessmentMutation>(
      updateFlashcardSetMutation
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

  const handleDeleteFlashcard = useCallback(
    (flashcardId: string) => {
      deleteFlashcard({
        variables: {
          flashcardId: flashcardId,
          assessmentId: flashcardSetId,
        },
        onError: setError,
        updater(store) {
          console.log("updater @lecturer", store, data);
          
          // TODO re-implement this without relying on query flashcard set data

          // Get record of flashcard set
          // const flashcardSetRecord = store.get(flashcardSet!.__id);
          // if (!flashcardSetRecord) return;

          // Update the linked records of the flashcard set
          // const flashcardRecords =
          //   flashcardSetRecord.getLinkedRecords("flashcards") ?? [];
          // flashcardSetRecord.setLinkedRecords(
          //   flashcardRecords.filter((x) => x.getDataID() !== flashcardId),
          //   "flashcards"
          // );
        },
      });
    },
    [data, deleteFlashcard, flashcardSetId]
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
      <ErrorContext.Provider value={{ error, setError }}>
        <LecturerFlashcardHeader
          content={content}
          openEditFlashcardSetModal={() => setEditSetOpen(false)}
        />

        <div className="mt-8 flex flex-col gap-6">
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
                  flashcardPosition={i}
                  flashcardSetId={flashcardSet.__id}
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
                        handleDeleteFlashcard(flashcard.itemId);
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
              flashcardSetNumber={flashcardSetsAdded!}
              setFlashcardSetNumber={setFlashcardSetsAdded!}
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
