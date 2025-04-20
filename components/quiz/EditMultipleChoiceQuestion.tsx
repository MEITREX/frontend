import { EditMultipleChoiceQuestionFragment$key } from "@/__generated__/EditMultipleChoiceQuestionFragment.graphql";
import { EditMultipleChoiceQuestionMutation } from "@/__generated__/EditMultipleChoiceQuestionMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { questionUpdaterClosure } from "@/src/relay-helpers/question";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useFragment, useMutation } from "react-relay";
import { useError } from "../ErrorContext";
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
  fragment EditMultipleChoiceQuestionFragment on MultipleChoiceQuestion {
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
  mutation EditMultipleChoiceQuestionMutation(
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
        modifiedQuestion {
          number
          type
          hint
          ... on MultipleChoiceQuestion {
            answers {
              answerText
              correct
              feedback
            }
            text
            # TODO adjust schema
            # numberOfCorrectAnswers
            item {
              id
              associatedBloomLevels
              associatedSkills {
                id
                skillName
                skillCategory
                isCustomSkill
              }
            }
          }
        }
      }
    }
  }
`;

type Props = {
  _allRecords: MediaRecordSelector$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  question: EditMultipleChoiceQuestionFragment$key;
  onClose: () => void;
  open: boolean;
};

export function EditMultipleChoiceQuestion({
  _allRecords,
  allSkillsQueryRef,
  question,
  onClose,
  open,
}: Readonly<Props>) {
  const { quizId, courseId } = useParams();
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
    useMutation<EditMultipleChoiceQuestionMutation>(
      MultipleChoiceQuestionMutation
    );

  const updater = useCallback(
    () =>
      questionUpdaterClosure(
        "update",
        "MultipleChoiceQuestion",
        quizId,
        courseId
      ),
    [courseId, quizId]
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
      updater: updater(),
      onError: setError,
      onCompleted: () => onClose(),
    });
  }, [
    quizId,
    questionData,
    data.itemId,
    item,
    updateQuestion,
    updater,
    setError,
    onClose,
  ]);

  return (
    <MultipleChoiceQuestionModal
      _allRecords={_allRecords}
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
