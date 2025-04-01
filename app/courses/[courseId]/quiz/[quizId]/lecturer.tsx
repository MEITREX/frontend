import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { ES2022Error } from "@/components/FormErrors";
import { PageError } from "@/components/PageError";
import { QuizModal } from "@/components/QuizModal";
import { ItemData } from "@/components/form-sections/ItemFormSection";
import { AddQuestionButton } from "@/components/quiz/AddQuestionButton";
import { AssociationQuestionPreview } from "@/components/quiz/AssociationQuestionPreview";
import { ClozeQuestionPreview } from "@/components/quiz/ClozeQuestionPreview";
import { DeleteQuestionButton } from "@/components/quiz/DeleteQuestionButton";
import { EditAssociationQuestionButton } from "@/components/quiz/EditAssociationQuestionButton";
import { EditClozeQuestionButton } from "@/components/quiz/EditClozeQuestionButton";
import { EditMultipleChoiceQuestionButton } from "@/components/quiz/EditMultipleChoiceQuestionButton";
import LecturerQuizHeader from "@/components/quiz/LecturerQuizHeader";
import { MultipleChoiceQuestionPreview } from "@/components/quiz/MultipleChoiceQuestionPreview";
import { useParams } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

const rootQuery = graphql`
  query lecturerEditQuizQuery($id: UUID!, $courseId: UUID!) {
    ...MediaRecordSelector
    contentsByIds(ids: [$id]) {
      ...LecturerQuizHeaderFragment

      id
      metadata {
        name
        chapterId
        ...ContentTags
      }
      ... on QuizAssessment {
        quiz {
          assessmentId
          questionPool {
            itemId
            type
            number
            ...MultipleChoiceQuestionPreviewFragment
            ...ClozeQuestionPreviewFragment
            ...EditMultipleChoiceQuestionButtonFragment
            ...AssociationQuestionPreviewFragment
            ...EditClozeQuestionButtonFragment
            ...EditAssociationQuestionButtonFragment
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

interface ErrorContextProps {
  error: ES2022Error | null;
  setError: (error: ES2022Error | null) => void;
}
const ErrorContext = createContext<ErrorContextProps>({
  error: null,
  setError: () => {},
});
export const useError = () => useContext(ErrorContext);

export default function LecturerQuiz() {
  const { quizId, courseId } = useParams();
  const [error, setError] = useState<ES2022Error | null>(null);

  // TODO `...query` should be removed after clean relay.js fragment refactoring
  const { contentsByIds, ...query } = useLazyLoadQuery<lecturerEditQuizQuery>(
    rootQuery,
    {
      id: quizId,
      courseId,
    }
  );

  const [isEditSetOpen, setEditSetOpen] = useState(false);

  const content = contentsByIds[0];
  const quiz = content.quiz;

  function getItem(itemId: string): ItemData {
    if (content && content.items) {
      for (let i = 0; i < content.items.length; i++) {
        if (content.items[i].id === itemId) {
          return {
            associatedBloomLevels: [...content.items[i].associatedBloomLevels],
            associatedSkills: [...content.items[i].associatedSkills],
            id: itemId,
          };
        }
      }
    }
    return { associatedBloomLevels: [], associatedSkills: [] };
  }

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
      <ErrorContext.Provider value={{ error, setError }}>
        <LecturerQuizHeader
          openEditQuizModal={() => setEditSetOpen(true)}
          content={content}
        />

        {quiz.questionPool.map((question, i) => (
          <div
            key={question.itemId}
            className="my-3 py-3 border-b flex justify-between items-start"
          >
            {question.type === "MULTIPLE_CHOICE" && (
              <>
                <MultipleChoiceQuestionPreview _question={question} />
                <div className="flex">
                  <EditMultipleChoiceQuestionButton
                    _allRecords={query}
                    _question={question}
                    assessmentId={content.id!}
                    courseId={courseId}
                    item={getItem(question.itemId)}
                  />
                  <DeleteQuestionButton
                    assessmentId={content.id!}
                    questionId={question.itemId}
                    num={question.number}
                  />
                </div>
              </>
            )}
            {question.type === "CLOZE" && (
              <>
                <ClozeQuestionPreview _question={question} />
                <div className="flex">
                  <EditClozeQuestionButton
                    _allRecords={query}
                    _question={question}
                    assessmentId={content.id}
                    courseId={courseId}
                    item={getItem(question.itemId)}
                  />
                  <DeleteQuestionButton
                    assessmentId={content.id}
                    questionId={question.itemId}
                    num={question.number}
                  />
                </div>
              </>
            )}
            {question.type === "ASSOCIATION" && (
              <>
                <AssociationQuestionPreview _question={question} />
                <div className="flex">
                  <EditAssociationQuestionButton
                    _allRecords={query}
                    _question={question}
                    assessmentId={content.id}
                    courseId={courseId}
                    item={getItem(question.itemId)}
                  />
                  <DeleteQuestionButton
                    assessmentId={content.id}
                    questionId={question.itemId}
                    num={question.number}
                  />
                </div>
              </>
            )}
          </div>
        ))}

        <div className="mt-8 flex flex-col items-start">
          <AddQuestionButton
            _allRecords={query}
            assessmentId={content.id}
            courseId={courseId}
          />
        </div>

        <QuizModal
          onClose={() => setEditSetOpen(false)}
          isOpen={isEditSetOpen}
          _existingQuiz={quiz}
          chapterId={content.metadata.chapterId}
        />
      </ErrorContext.Provider>
    </main>
  );
}
