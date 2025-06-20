import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { ErrorContext, ES2022Error } from "@/components/ErrorContext";
import { PageError } from "@/components/PageError";
import { QuizModal } from "@/components/QuizModal";
import { AddQuestionButton } from "@/components/quiz/AddQuestionButton";
import QuestionPreview from "@/components/quiz/QuestionPreview";
import QuizHeader from "@/components/quiz/QuizHeader";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { graphql, useLazyLoadQuery, useQueryLoader } from "react-relay";
import { AllSkillQuery } from "../../flashcards/[flashcardSetId]/lecturer";

const RootQuery = graphql`
  query lecturerEditQuizQuery($id: UUID!, $courseId: UUID!) {
    ...MediaRecordSelector

    contentsByIds(ids: [$id]) {
      ...QuizHeaderFragment

      id
      metadata {
        name
        chapterId
      }
      ... on QuizAssessment {
        quiz {
          assessmentId
          questionPool {
            ...QuestionPreviewFragment

            itemId
            type
            number
            ...MultipleChoiceQuestionPreviewFragment
            ...ClozeQuestionPreviewFragment
            ...AssociationQuestionPreviewFragment
          }
          ...QuizModalFragment
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
    }
  }
`;

export default function LecturerQuiz() {
  const { quizId, courseId } = useParams();
  const [error, setError] = useState<ES2022Error | null>(null);
  const errorContext = useMemo(() => ({ error, setError }), [error, setError]);

  const { contentsByIds, ...mediaSelectorQuery } =
    useLazyLoadQuery<lecturerEditQuizQuery>(RootQuery, {
      id: quizId,
      courseId,
    });
  const [queryReference, loadQuery] =
    useQueryLoader<lecturerAllSkillsQuery>(AllSkillQuery);
  useEffect(() => {
    if (!queryReference) {
      loadQuery({ courseId });
    }
  }, [courseId, loadQuery, queryReference]);

  const [isEditSetModalOpen, setEditSetModalOpen] = useState(false);

  const content = contentsByIds[0];
  const quiz = content.quiz;

  if (!quiz) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content not of type quiz."
      />
    );
  }
  return (
    <main>
      <ErrorContext.Provider value={errorContext}>
        <QuizHeader
          openEditQuizModal={() => setEditSetModalOpen(true)}
          content={content}
        />

        <div className="mt-8 flex flex-col items-stretch">
          {quiz.questionPool.map((question, i) => (
            <div key={i}>
              <QuestionPreview
                mediaRecords={mediaSelectorQuery}
                allSkillsQueryRef={queryReference}
                question={question}
              />
            </div>
          ))}
        </div>

        <AddQuestionButton
          _allRecords={mediaSelectorQuery}
          allSkillsQueryRef={queryReference}
          assessmentId={content.id}
          courseId={courseId}
        />

        <QuizModal
          onClose={() => setEditSetModalOpen(false)}
          isOpen={isEditSetModalOpen}
          _existingQuiz={quiz}
          chapterId={content.metadata.chapterId}
        />
      </ErrorContext.Provider>
    </main>
  );
}
