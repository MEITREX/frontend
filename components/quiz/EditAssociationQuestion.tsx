import { EditAssociationQuestionFragment$key } from "@/__generated__/EditAssociationQuestionFragment.graphql";
import { EditAssociationQuestionMutation } from "@/__generated__/EditAssociationQuestionMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
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
  AssociationQuestionData,
  AssociationQuestionModal,
} from "./AssociationQuestionModal";
import { questionUpdaterClosure } from "@/src/relay-helpers/question";

const AssociationQuestionMutation = graphql`
  mutation EditAssociationQuestionMutation(
    $assessmentId: UUID!
    $questionInput: UpdateAssociationQuestionInput!
    $item: ItemInput!
  ) {
    mutateQuiz(assessmentId: $assessmentId) {
      assessmentId
      updateAssociationQuestion(
        questionInput: $questionInput
        assessmentId: $assessmentId
        item: $item
      ) {
        assessmentId
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

const AssociationQuestionFragment = graphql`
  fragment EditAssociationQuestionFragment on AssociationQuestion {
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
    correctAssociations {
      left
      right
      feedback
    }
  }
`;

type Props = {
  _allRecords: MediaRecordSelector$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  question: EditAssociationQuestionFragment$key;
  onClose: () => void;
  open: boolean;
};

export function EditAssociationQuestion({
  _allRecords,
  allSkillsQueryRef,
  question,
  onClose,
  open,
}: Readonly<Props>) {
  const { quizId, courseId } = useParams();
  const { setError } = useError();

  const data = useFragment(AssociationQuestionFragment, question);

  const [item, setItem] = useState<Item | CreateItem>(mapRelayItemToItem(data));
  const [questionData, setQuestionData] = useState<AssociationQuestionData>({
    text: data.text,
    hint: data.hint,
    correctAssociations: data.correctAssociations.map((elem) => ({
      left: elem.left,
      right: elem.right,
      feedback: elem.feedback,
    })),
  });

  const [updateQuestion, isUpdating] =
    useMutation<EditAssociationQuestionMutation>(AssociationQuestionMutation);

  const updater = useCallback(
    () =>
      questionUpdaterClosure("update", "AssociationQuestion", quizId, courseId),
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
      onCompleted: onClose,
    });
  }, [
    data.itemId,
    item,
    onClose,
    questionData,
    quizId,
    setError,
    updateQuestion,
    updater,
  ]);

  return (
    <AssociationQuestionModal
      _allRecords={_allRecords}
      allSkillsQueryRef={allSkillsQueryRef}
      title="Edit association question"
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
