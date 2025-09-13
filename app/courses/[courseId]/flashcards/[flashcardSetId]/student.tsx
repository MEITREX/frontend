"use client";

import { studentFlashcardsQuery } from "@/__generated__/studentFlashcardsQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { StudentFlashcardSet } from "@/components/StudentFlashcardSet";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function StudentFlashcards() {
  const { flashcardSetId, courseId } = useParams();
  const [error, setError] = useState<any>(null);

  const safeCourseId = Array.isArray(courseId) ? courseId[0] : courseId;
  const safeSetId = Array.isArray(flashcardSetId)
    ? flashcardSetId[0]
    : flashcardSetId;

  const { findContentsByIds } = useLazyLoadQuery<studentFlashcardsQuery>(
    graphql`
      query studentFlashcardsQuery($id: [UUID!]!) {
        findContentsByIds(ids: $id) {
          id
          metadata {
            name
            ...ContentTags
          }
          ... on FlashcardSetAssessment {
            flashcardSet {
              flashcards {
                itemId
                ...StudentFlashcard
              }
            }
          }
        }
      }
    `,
    { id: [safeSetId] }
  );

  const content = findContentsByIds[0];
  const flashcardSet =
    content && "flashcardSet" in content ? content.flashcardSet : null;

  const memoFlashcards = useMemo(
    () =>
      flashcardSet
        ? flashcardSet.flashcards.map((x) => ({ id: x.itemId, _flashcard: x }))
        : [],
    [flashcardSet]
  );

  const handleComplete = useCallback(() => {
    window.location.replace(`/courses/${safeCourseId}`);
  }, [safeCourseId]);

  if (!content) {
    return <PageError message="No flashcards found with given id." />;
  }
  if (!flashcardSet) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content is not of type flashcards."
      />
    );
  }

  return (
    <main className="flex flex-col h-full">
      <Heading title={content.metadata.name} backButton />
      <ContentTags metadata={content.metadata} />
      <FormErrors error={error} onClose={() => setError(null)} />

      <StudentFlashcardSet
        flashcards={memoFlashcards}
        emptyMessage="Empty flashcard set."
        onComplete={handleComplete}
        onError={setError}
      />
    </main>
  );
}
