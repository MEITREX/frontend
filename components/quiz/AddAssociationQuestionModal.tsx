import { AddAssociationQuestionModalMutation } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useMutation } from "react-relay";
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
        questionPool {
          itemId
          type # without type and number, the question will not appear properly and be deletable until a page reload
          number
          ...AssociationQuestionPreviewFragment
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
  onClose: () => void;
  open: boolean;
};

export function AddAssociationQuestionModal({
  _allRecords,
  allSkillsQueryRef,
  open,
  onClose,
}: Readonly<Props>) {
  const { quizId } = useParams();
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

  const onSubmit = useCallback(() => {
    const questionUpdate = {
      assessmentId: quizId,
      input: questionData,
      item: item,
    };

    addQuestion({
      variables: questionUpdate,
      onCompleted: onClose,
      onError: setError,
      updater(
        store,
        {
          mutateQuiz: {
            addAssociationQuestion: { questionPool /* item */ },
          },
        }
      ) {
        store.invalidateStore();

        const content = store.get(quizId);
        const quiz = content?.getLinkedRecord("quiz");
        const allQuestions = questionPool.flatMap((x) => {
          const record = store.get(x.itemId);
          return record ? [record] : [];
        });

        if (!quiz) {
          console.error("not found");
          return;
        }

        quiz.setLinkedRecords(allQuestions, "questionPool");
        const items = store
          .getRoot()
          .getLinkedRecord("items")
          ?.getLinkedRecords("elements");
        const newItem = store.get("item!.id"); // TODO
        if (!items || !newItem) return;

        store
          .getRoot()
          .getLinkedRecord("items")
          ?.setLinkedRecords([...items, newItem], "elements");
      },
    });
    window.location.reload();
  }, [addQuestion, item, onClose, questionData, quizId, setError]);

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
