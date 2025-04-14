import { AddAssociationQuestionModalMutation } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { addAssociationQuestionUpdaterClosure } from "@/src/relay-helpers/question";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useMutation } from "react-relay";
import { useError } from "../ErrorContext";
import { CreateItem } from "../form-sections/item/ItemFormSectionNew";
import {
  AssociationQuestionData,
  AssociationQuestionModal,
} from "./AssociationQuestionModal";

const AssociationQuestionMutation = graphql`
  mutation AddAssociationQuestionModalMutation(
    $input: CreateAssociationQuestionInputWithoutItem!
    $assessmentId: UUID!
    $item: CreateItemInput!
  ) {
    mutateQuiz(assessmentId: $assessmentId) {
      assessmentId
      addAssociationQuestion(
        questionInput: $input
        assessmentId: $assessmentId
        item: $item
      ) {
        modifiedQuestion {
          number
          type
          hint
          ... on AssociationQuestion {
            correctAssociations {
              feedback
              left
              right
            }
            # TODO fix schema
            # leftSide
            # rightSide
            text
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

export function AddAssociationQuestionModal({
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
  const [questionData, setQuestionData] = useState<AssociationQuestionData>({
    text: "",
    hint: "",
    correctAssociations: [],
  });

  const [addQuestion, isUpdating] =
    useMutation<AddAssociationQuestionModalMutation>(
      AssociationQuestionMutation
    );

  const updater = useCallback(
    () => addAssociationQuestionUpdaterClosure(quizId, courseId),
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
      onCompleted: onClose,
    });
  }, [addQuestion, item, onClose, questionData, quizId, setError, updater]);

  return (
    <AssociationQuestionModal
      title="Add association question"
      _allRecords={_allRecords}
      allSkillsQueryRef={allSkillsQueryRef}
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
