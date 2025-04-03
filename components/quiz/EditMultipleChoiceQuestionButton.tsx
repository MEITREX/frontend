import { EditMultipleChoiceQuestionButtonFragment$key } from "@/__generated__/EditMultipleChoiceQuestionButtonFragment.graphql";
import { EditMultipleChoiceQuestionButtonMutation } from "@/__generated__/EditMultipleChoiceQuestionButtonMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useFragment, useMutation } from "react-relay";
import {
  CreateItem,
  Item,
  mapRelayItemToItem,
} from "../form-sections/item/ItemFormSectionNew";
import {
  MultipleChoiceQuestionData,
  MultipleChoiceQuestionModal,
} from "./MutlipleChoiceQuestionModal";

const MultipleChoiceQuestionFragment = graphql`
  fragment EditMultipleChoiceQuestionButtonFragment on MultipleChoiceQuestion {
    itemId
    item {
      associatedBloomLevels
      associatedSkills {
        id
        skillName
        skillCategory
        isCustomSkill
      }
    }

    text
    hint
    answers {
      answerText
      correct
      feedback
    }
  }
`;

const MultipleChoiceQuestionMutation = graphql`
  mutation EditMultipleChoiceQuestionButtonMutation(
    $assessmentId: UUID!
    $questionInput: UpdateMultipleChoiceQuestionInput!
    $item: ItemInput!
  ) {
    mutateQuiz(assessmentId: $assessmentId) {
      assessmentId
      updateMultipleChoiceQuestion(
        questionInput: $questionInput
        assessmentId: $assessmentId
        item: $item
      ) {
        assessmentId
        questionPool {
          ...EditMultipleChoiceQuestionButtonFragment
        }
      }
    }
  }
`;

type Props = {
  mediaRecords: MediaRecordSelector$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  question: EditMultipleChoiceQuestionButtonFragment$key;
  onClose: () => void;
  open: boolean;
};

export function EditMultipleChoiceQuestionButton({
  mediaRecords,
  allSkillsQueryRef,
  question,
  onClose,
  open,
}: Props) {
  const { quizId } = useParams();
  const { setError } = useError();

  const data = useFragment(MultipleChoiceQuestionFragment, question);

  const [item, setItem] = useState<Item | CreateItem>(mapRelayItemToItem(data));
  const [questionData, setQuestionData] = useState<MultipleChoiceQuestionData>({
    text: data.text,
    hint: data.hint,
    answers: data.answers.map((answer) => ({
      answerText: answer.answerText,
      correct: answer.correct,
      feedback: answer.feedback,
    })),
  });

  const [updateQuestion, isUpdating] =
    useMutation<EditMultipleChoiceQuestionButtonMutation>(
      MultipleChoiceQuestionMutation
    );

  const onSubmit = useCallback(() => {
    const questionUpdate = {
      assessmentId: quizId,
      questionInput: {
        ...questionData,
        itemId: data.itemId,
      },
      item: item,
    };
    updateQuestion({
      variables: questionUpdate,
      onCompleted: onClose,
      onError: setError,
      updater: (store) => store.invalidateStore(),
    });
  }, [
    data.itemId,
    item,
    onClose,
    questionData,
    quizId,
    setError,
    updateQuestion,
  ]);

  return (
    <MultipleChoiceQuestionModal
      _allRecords={mediaRecords}
      allSkillsQueryRef={allSkillsQueryRef}
      title="Edit multiple choice question"
      open={open}
      isLoading={isUpdating}
      item={item}
      setItem={setItem}
      questionData={questionData}
      setQuestionData={setQuestionData}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}
