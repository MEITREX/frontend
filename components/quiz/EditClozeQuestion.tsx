import { EditClozeQuestionFragment$key } from "@/__generated__/EditClozeQuestionFragment.graphql";
import { EditClozeQuestionMutation } from "@/__generated__/EditClozeQuestionMutation.graphql";
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
import { ClozeQuestionData, ClozeQuestionModal } from "./ClozeQuestionModal";

const ClozeQuestionFragment = graphql`
  fragment EditClozeQuestionFragment on ClozeQuestion {
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

    showBlanksList
    additionalWrongAnswers
    hint
    clozeElements {
      __typename
      ... on ClozeTextElement {
        text
      }
      ... on ClozeBlankElement {
        correctAnswer
        feedback
      }
    }
  }
`;

const ClozeQuestionMutation = graphql`
  mutation EditClozeQuestionMutation(
    $assessmentId: UUID!
    $questionInput: UpdateClozeQuestionInput!
    $item: ItemInput!
  ) {
    mutateQuiz(assessmentId: $assessmentId) {
      assessmentId
      updateClozeQuestion(
        questionInput: $questionInput
        assessmentId: $assessmentId
        item: $item
      ) {
        assessmentId
        questionPool {
          itemId
          ...EditClozeQuestionFragment
          ...ClozeQuestionPreviewFragment
        }
        # item {
        #   id
        #   associatedSkills {
        #     id
        #     skillName
        #   }
        #   associatedBloomLevels
        # }
      }
    }
  }
`;

type Props = {
  _allRecords: MediaRecordSelector$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
  question: EditClozeQuestionFragment$key;
  onClose: () => void;
  open: boolean;
};

export function EditClozeQuestion({
  _allRecords,
  allSkillsQueryRef,
  question,
  onClose,
  open,
}: Readonly<Props>) {
  const { quizId } = useParams();
  const { setError } = useError();

  const data = useFragment(ClozeQuestionFragment, question);

  const [item, setItem] = useState<Item | CreateItem>(mapRelayItemToItem(data));
  const [questionData, setQuestionData] = useState<ClozeQuestionData>({
    showBlanksList: data.showBlanksList,
    additionalWrongAnswers: data.additionalWrongAnswers.map((e) => e),
    hint: data.hint,
    clozeElements: data.clozeElements.map((e) =>
      e.__typename === "ClozeTextElement"
        ? { type: "TEXT", text: e.text }
        : e.__typename === "ClozeBlankElement"
        ? {
            type: "BLANK",
            correctAnswer: e.correctAnswer,
            feedback: e.feedback ?? "",
          }
        : {
            type: "TEXT",
            text: "Type of cloze element is '%other'; this shouldn't happen",
          }
    ),
  });

  const [updateQuestion, isUpdating] = useMutation<EditClozeQuestionMutation>(
    ClozeQuestionMutation
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
      updater: (store) => store.invalidateStore(),
      onCompleted: onClose,
      onError: setError,
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
