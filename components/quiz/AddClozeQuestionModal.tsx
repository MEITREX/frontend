import { AddClozeQuestionModalMutation } from "@/__generated__/AddClozeQuestionModalMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useMutation } from "react-relay";
import { useError } from "../ErrorContext";
import { CreateItem } from "../form-sections/item/ItemFormSectionNew";
import { ClozeQuestionData, ClozeQuestionModal } from "./ClozeQuestionModal";
import { addClozeQuestionUpdaterClosure } from "@/src/relay-helpers/question";

const ClozeQuestionMutation = graphql`
  mutation AddClozeQuestionModalMutation(
    $assessmentId: UUID!
    $input: CreateClozeQuestionInputWithoutItem!
    $item: CreateItemInput!
  ) {
    mutateQuiz(assessmentId: $assessmentId) {
      assessmentId
      addClozeQuestion(
        assessmentId: $assessmentId
        questionInput: $input
        item: $item
      ) {
        assessmentId
        modifiedQuestion {
          number
          type
          hint
          ... on ClozeQuestion {
            clozeElements {
              __typename
              ... on ClozeBlankElement {
                correctAnswer
                feedback
              }
              ... on ClozeTextElement {
                text
              }
            }
            showBlanksList
            additionalWrongAnswers
            allBlanks
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

export function AddClozeQuestionModal({
  _allRecords,
  open,
  onClose,
  allSkillsQueryRef,
}: Readonly<Props>) {
  const { quizId, courseId } = useParams();
  const { setError } = useError();

  const [item, setItem] = useState<CreateItem>({
    associatedSkills: [],
    associatedBloomLevels: [],
  });
  const [questionData, setQuestionData] = useState<ClozeQuestionData>({
    showBlanksList: true,
    clozeElements: [],
    additionalWrongAnswers: [],
    hint: null,
  });

  const [addQuestion, isUpdating] = useMutation<AddClozeQuestionModalMutation>(
    ClozeQuestionMutation
  );

  const updater = useCallback(
    () => addClozeQuestionUpdaterClosure(quizId, courseId),
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
      onError: setError,
      updater: updater(),
      onCompleted: () => onClose(),
    });
  }, [addQuestion, item, onClose, questionData, quizId, setError, updater]);

  return (
    <ClozeQuestionModal
      _allRecords={_allRecords}
      open={open}
      title="Add cloze question"
      item={item}
      isLoading={isUpdating}
      onSubmit={onSubmit}
      onClose={onClose}
      questionData={questionData}
      setItem={setItem}
      setQuestionData={setQuestionData}
      allSkillsQueryRef={allSkillsQueryRef}
    />
  );
}
