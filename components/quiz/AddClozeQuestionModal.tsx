import { AddClozeQuestionModalMutation } from "@/__generated__/AddClozeQuestionModalMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { graphql, PreloadedQuery, useMutation } from "react-relay";
import { useError } from "../ErrorContext";
import { CreateItem } from "../form-sections/item/ItemFormSectionNew";
import { ClozeQuestionData, ClozeQuestionModal } from "./ClozeQuestionModal";

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
        questionPool {
          itemId
          type # without type and number, the question will not appear properly and be deletable until a page reload
          number
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
  onClose: () => void;
  open: boolean;
};

export function AddClozeQuestionModal({
  _allRecords,
  open,
  onClose,
  allSkillsQueryRef,
}: Readonly<Props>) {
  const { quizId } = useParams();
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
            addClozeQuestion: { questionPool /* item */ },
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
      onError: setError,
    });
    window.location.reload();
  }, [addQuestion, item, onClose, questionData, quizId, setError]);

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
