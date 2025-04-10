import { AddMultipleChoiceQuestionModalMutation } from "@/__generated__/AddMultipleChoiceQuestionModalMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useError } from "@/app/courses/[courseId]/quiz/[quizId]/lecturer";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useMutation } from "react-relay";
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
        questionPool {
          itemId
          type # without type and number, the question will not appear properly and be deletable until a page reload
          number
          ...MultipleChoiceQuestionPreviewFragment
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

export function AddMultipleChoiceQuestionModal({
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
  const [questionData, setQuestionData] = useState<MultipleChoiceQuestionData>({
    text: "",
    hint: "",
    answers: [],
  });

  const [addQuestion, isUpdating] =
    useMutation<AddMultipleChoiceQuestionModalMutation>(
      MultipleChoiceQuestionMutation
    );
  const onSubmit = useCallback(() => {
    const questionUpdate = {
      assessmentId: quizId,
      input: questionData,
      item: item,
    };

    addQuestion({
      variables: questionUpdate,
      onCompleted: () => onClose(),
      updater(
        store,
        {
          mutateQuiz: {
            addMultipleChoiceQuestion: { questionPool /* item */ },
          },
        }
      ) {
        console.log(store);
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
        console.log("updatedQuestion");
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
        console.log(store);
      },
      onError: setError,
    });
    window.location.reload();
  }, [addQuestion, item, onClose, questionData, quizId, setError]);

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
