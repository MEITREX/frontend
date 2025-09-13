"use client";

import { studentFlashcardsQuery } from "@/__generated__/studentFlashcardsQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { StudentFlashcardSet } from "@/components/StudentFlashcardSet";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function StudentFlashcards() {
  // Get course id from url
  const { flashcardSetId, courseId } = useParams();
  const router = useRouter();
  const [error, setError] = useState<any>(null);

  const safeCourseId = Array.isArray(courseId) ? courseId[0] : courseId;
  const safeSetId = Array.isArray(flashcardSetId)
    ? flashcardSetId[0]
    : flashcardSetId;

  // Fetch course data
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
  if (!content)
    return <PageError message="No flashcards found with given id." />;
  if (!("flashcardSet" in content) || !content.flashcardSet)
    return (
      <PageError
        title={content.metadata.name}
        message="Content is not of type flashcards."
      />
    );

  const memoFlashcards = useMemo(
    () =>
      content.flashcardSet!.flashcards.map((x) => ({
        id: x.itemId,
        _flashcard: x,
      })),
    [content.flashcardSet]
  );

  const handleComplete = useCallback(() => {
    window.location.replace(`/courses/${safeCourseId}`);
  }, [safeCourseId]);

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
