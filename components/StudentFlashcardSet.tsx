import { StudentFlashcard$key } from "@/__generated__/StudentFlashcard.graphql";
import { StudentFlashcardSetLogProgressMutation } from "@/__generated__/StudentFlashcardSetLogProgressMutation.graphql";
import { SimilarSegments } from "@/app/courses/[courseId]/media/[mediaId]/SimilarSegments";
import { Search } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { graphql, useMutation } from "react-relay";
import { dispatch } from "use-bus";
import { DisplayError } from "./PageError";
import { StudentFlashcard } from "./StudentFlashcard";

export type FlashcardData = {
  id: string;
  _flashcard: StudentFlashcard$key;
};

export function StudentFlashcardSet({
  flashcards,
  emptyMessage,
  onError = () => {},
  onComplete = () => {},
}: {
  flashcards: FlashcardData[];
  emptyMessage: string;
  onError?: (error: any) => void;
  onComplete?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knew, setKnew] = useState(false);

  const handleChange = useCallback((correctness: number) => {
    setKnew(correctness === 1);
  }, []);

  const [setFlashcardLearned, logging] =
    useMutation<StudentFlashcardSetLogProgressMutation>(graphql`
      mutation StudentFlashcardSetLogProgressMutation(
        $input: LogFlashcardLearnedInput!
      ) {
        logFlashcardLearned(input: $input) {
          success
        }
      }
    `);

  if (flashcards.length === 0) {
    return <DisplayError message={emptyMessage} />;
  }

  const currentFlashcard = flashcards[currentIndex];
  const nextCard = async () => {
    setFlashcardLearned({
      variables: {
        input: {
          flashcardId: currentFlashcard.id,
          successful: knew,
        },
      },
      onCompleted() {
        if (currentIndex + 1 < flashcards.length) {
          setCurrentIndex(currentIndex + 1);
          setKnew(false);
        } else {
          onComplete();
        }
      },
      onError,
    });
  };

  return (
    <div>
      <SimilarSegments />
      <StudentFlashcard
        key={currentFlashcard.id}
        _flashcard={currentFlashcard._flashcard}
        label={`${currentIndex + 1}/${flashcards.length}`}
        onChange={handleChange}
      />

      <div className="mt-6 w-full flex justify-center">
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={nextCard}
          className="mb-6"
        >
          {logging ? (
            <CircularProgress size={16}></CircularProgress>
          ) : currentIndex + 1 < flashcards.length ? (
            "Next"
          ) : (
            "Finish"
          )}
        </Button>
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={(e) => {
            dispatch({
              type: "searchSimilarEntity",
              segmentId: currentFlashcard.id,
            });
          }}
          className="mb-6"
          startIcon={<Search />}
        >
          Study Material
        </Button>
      </div>
    </div>
  );
}
