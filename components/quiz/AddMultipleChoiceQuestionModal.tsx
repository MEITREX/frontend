import { AddMultipleChoiceQuestionModalMutation } from "@/__generated__/AddMultipleChoiceQuestionModalMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { questionUpdaterClosure } from "@/src/relay-helpers";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useMutation } from "react-relay";
import { useError } from "../ErrorContext";
import { CreateItem } from "../form-sections/item/ItemFormSectionNew";
import {
  MultipleChoiceQuestionData,
  MultipleChoiceQuestionModal,
} from "./MutlipleChoiceQuestionModal";

const MultipleChoiceQuestionMutation = graphql`
  mutation AddMultipleChoiceQuestionModalMutation(
    $assessmentId: UUID!
    $input: CreateMultipleChoiceQuestionInputWithoutItem!
    $item: CreateItemInput!
  ) {
    mutateQuiz(assessmentId: $assessmentId) {
      assessmentId
      addMultipleChoiceQuestion(
        questionInput: $input
        assessmentId: $assessmentId
        item: $item
      ) {
        assessmentId
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
  onClose: () => void;
  open: boolean;
};

export function AddMultipleChoiceQuestionModal({
  _allRecords,
  allSkillsQueryRef,
  open,
  onClose,
}: Readonly<Props>) {
  const { quizId, courseId } = useParams();
  const { setError } = useError();

  const [item, setItem] = useState<CreateItem>({
    associatedSkills: [],
    associatedBloomLevels: [],
  });
  const [questionData, setQuestionData] = useState<MultipleChoiceQuestionData>({
    text: "",
    hint: "",
    answers: [],
  });

  const [addQuestion, isUpdating] =
    useMutation<AddMultipleChoiceQuestionModalMutation>(
      MultipleChoiceQuestionMutation
    );

  const updater = useCallback(
    () =>
      questionUpdaterClosure("add", "MultipleChoiceQuestion", quizId, courseId),
    [courseId, quizId]
  );

  const onSubmit = useCallback(() => {
    const questionUpdate = {
      assessmentId: quizId,
      input: questionData,
      item: item,
    };

    addQuestion({
      variables: questionUpdate,
      updater: updater(),
      onError: setError,
      onCompleted: () => onClose(),
    });
  }, [addQuestion, item, onClose, questionData, quizId, setError, updater]);

  return (
    <MultipleChoiceQuestionModal
      _allRecords={_allRecords}
      allSkillsQueryRef={allSkillsQueryRef}
      title="Add multiple choice question"
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
