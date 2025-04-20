import { AddAssociationQuestionModalMutation$data } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import { AddClozeQuestionModalMutation$data } from "@/__generated__/AddClozeQuestionModalMutation.graphql";
import { AddMultipleChoiceQuestionModalMutation$data } from "@/__generated__/AddMultipleChoiceQuestionModalMutation.graphql";
import { DeleteQuestionButtonMutation$data } from "@/__generated__/DeleteQuestionButtonMutation.graphql";
import { EditAssociationQuestionMutation$data } from "@/__generated__/EditAssociationQuestionMutation.graphql";
import { EditClozeQuestionMutation$data } from "@/__generated__/EditClozeQuestionMutation.graphql";
import { EditMultipleChoiceQuestionMutation$data } from "@/__generated__/EditMultipleChoiceQuestionMutation.graphql";
import _ from "lodash";
import { RecordSourceSelectorProxy } from "relay-runtime";
import {
  assertRecordExists,
  createItemFromPayload,
  deleteDanglingItems,
} from "./common";

const generateRelayStoreDataIdQuiz = (quizAssessmentId: string) =>
  `client:${quizAssessmentId}:quiz`;
const generateRelayStoreDataIdQuestion = (
  quizAssessmentId: string,
  questionNumber: number
) => `client:${quizAssessmentId}:quiz:questionPool:${questionNumber}`;
const generateRelayStoreDataIdMCAnswer = (
  quizAssessmentId: string,
  questionNumber: number,
  answerNumber: number
) =>
  `${generateRelayStoreDataIdQuestion(
    quizAssessmentId,
    questionNumber
  )}:answers:${answerNumber}`;
const generateRelayStoreDataIdCorrectAssociation = (
  quizAssessmentId: string,
  questionNumber: number,
  associationNumber: number
) =>
  `${generateRelayStoreDataIdQuestion(
    quizAssessmentId,
    questionNumber
  )}:correctAssociations:${associationNumber}`;
const generateRelayStoreDataIdClozeElement = (
  quizAssessmentId: string,
  questionNumber: number,
  associationNumber: number
) =>
  `${generateRelayStoreDataIdQuestion(
    quizAssessmentId,
    questionNumber
  )}:clozeElements:${associationNumber}`;

type MutatorMap = {
  readonly add: {
    readonly MultipleChoiceQuestion: AddMultipleChoiceQuestionModalMutation$data;
    readonly AssociationQuestion: AddAssociationQuestionModalMutation$data;
    readonly ClozeQuestion: AddClozeQuestionModalMutation$data;
  };
  readonly update: {
    readonly MultipleChoiceQuestion: EditMultipleChoiceQuestionMutation$data;
    readonly AssociationQuestion: EditAssociationQuestionMutation$data;
    readonly ClozeQuestion: EditClozeQuestionMutation$data;
  };
};
type Mode = keyof MutatorMap;
type Variant = keyof MutatorMap[Mode];
type MutationData<M extends Mode, V extends Variant> = MutatorMap[M][V];

export function questionUpdaterClosure<M extends Mode, V extends Variant>(
  mode: M,
  variant: V,
  quizAssessmentId: string,
  courseId: string
) {
  type D = MutationData<M, V>;
  return (store: RecordSourceSelectorProxy<D>, data: D) => {
    const { mutateQuiz } = data;

    // TODO fix the typing
    type OtherKeys = Exclude<typeof mutateQuiz, "assessmentId">;
    const mutationResult = mutateQuiz[`${mode}${variant}` as keyof OtherKeys];
    const payloadQuestion = (
      mutationResult as unknown as {
        modifiedQuestion: MCQuestion | ClozeQuestion | AssociationQuestion;
      }
    ).modifiedQuestion;

    let question;
    let questionIndex;
    // questions are mapped via array index numbers, not via the number prop
    const questionDataId = _.curry(generateRelayStoreDataIdQuestion)(
      quizAssessmentId
    );
    if (mode === "add") {
      questionIndex = store
        .get(generateRelayStoreDataIdQuiz(quizAssessmentId))!
        .getLinkedRecords("questionPool")!.length;
      // prevent index collisions when adding a question after deleting one
      // this is probably a bit dirty
      while (store.get(questionDataId(questionIndex))) {
        ++questionIndex;
      }
      question = store.create(questionDataId(questionIndex), variant);
    } /* update */ else {
      const indexInQuestionPool = store
        .get(generateRelayStoreDataIdQuiz(quizAssessmentId))!
        .getLinkedRecords("questionPool")!
        .findIndex(
          (question) => question.getValue("itemId") === payloadQuestion.item!.id
        );
      questionIndex = indexInQuestionPool;

      question = assertRecordExists(
        store.get(questionDataId(indexInQuestionPool)),
        questionDataId(indexInQuestionPool)
      );
    }

    if (variant === "MultipleChoiceQuestion") {
      const mcQuestion = payloadQuestion as unknown as MCQuestion;
      const questionAnswers = createMCAnswersFromPayload(
        store,
        mcQuestion,
        _.curry(generateRelayStoreDataIdMCAnswer)(
          quizAssessmentId,
          questionIndex
        )
      );
      question.setLinkedRecords(questionAnswers, "answers");

      question.setValue(mcQuestion.text, "text");

      // TODO fix schema
      // question.setValue(
      //   payloadQuestion.numberOfCorrectAnswers,
      //   "numberOfCorrectAnswers"
      // );
    } else if (variant === "AssociationQuestion") {
      const associationQuestion = payloadQuestion as AssociationQuestion;

      const questionAssociations = createCorrectAssociationsFromPayload(
        store,
        associationQuestion,
        _.curry(generateRelayStoreDataIdCorrectAssociation)(
          quizAssessmentId,
          questionIndex
        )
      );
      question.setLinkedRecords(questionAssociations, "correctAssociations");

      // TODO fix schema
      // forgot what I commented out...
      question.setValue(associationQuestion.text, "text");
    } else if (variant === "ClozeQuestion") {
      const clozeQuestion = payloadQuestion as ClozeQuestion;

      const questionClozeElements = createClozeElementsFromPayload(
        store,
        clozeQuestion,
        _.curry(generateRelayStoreDataIdClozeElement)(
          quizAssessmentId,
          questionIndex
        )
      );
      question.setLinkedRecords(questionClozeElements, "clozeElements");

      question.setValue(clozeQuestion.allBlanks as string[], "allBlanks");
      question.setValue(clozeQuestion.showBlanksList, "showBlankList");
      question.setValue(
        clozeQuestion.additionalWrongAnswers as string[],
        "additionalWrongAnswers"
      );
    }

    question.setValue(payloadQuestion.number, "number");
    question.setValue(payloadQuestion.type, "type");
    if ("hint" in payloadQuestion)
      question.setValue(payloadQuestion.hint, "hint");

    const questionItem = createItemFromPayload(
      store,
      payloadQuestion.item!,
      courseId
    );
    if (questionItem) question.setLinkedRecord(questionItem, "item");
    question.setValue(payloadQuestion.item!.id, "itemId");

    const questionQuiz = store.get(quizAssessmentId)!.getLinkedRecord("quiz")!;
    let currentQuestionPool = questionQuiz.getLinkedRecords("questionPool")!;
    currentQuestionPool =
      mode === "add"
        ? [...currentQuestionPool, question]
        : [
            ...currentQuestionPool.slice(0, questionIndex),
            question,
            ...currentQuestionPool.slice(questionIndex + 1),
          ];
    questionQuiz.setLinkedRecords(currentQuestionPool, "questionPool");
  };
}

type MCQuestion = Omit<
  | AddMultipleChoiceQuestionModalMutation$data["mutateQuiz"]["addMultipleChoiceQuestion"]["modifiedQuestion"]
  | EditMultipleChoiceQuestionMutation$data["mutateQuiz"]["updateMultipleChoiceQuestion"]["modifiedQuestion"],
  " $fragmentSpreads"
>;
const createMCAnswersFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: MCQuestion,
  getMCAnswerDataId: (index: number) => string
) =>
  payload.answers!.map((answer, i) => {
    const dataId = getMCAnswerDataId(i);
    const answerRecord =
      store.get(dataId) ?? store.create(dataId, "MultipleChoiceAnswer");

    answerRecord.setValue(answer.answerText, "answerText");
    answerRecord.setValue(answer.correct, "correct");
    answerRecord.setValue(answer.feedback, "feedback");

    return answerRecord;
  });

type AssociationQuestion = Omit<
  | AddAssociationQuestionModalMutation$data["mutateQuiz"]["addAssociationQuestion"]["modifiedQuestion"]
  | EditAssociationQuestionMutation$data["mutateQuiz"]["updateAssociationQuestion"]["modifiedQuestion"],
  " $fragmentSpreads"
>;
const createCorrectAssociationsFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: AssociationQuestion,
  getCorrectAssociationAnswerDataId: (index: number) => string
) =>
  payload.correctAssociations?.map((association, i) => {
    const dataId = getCorrectAssociationAnswerDataId(i);
    const assocRecord =
      store.get(dataId) ?? store.create(dataId, "SingleAssociation");

    assocRecord.setValue(association.right, "right");
    assocRecord.setValue(association.left, "left");
    if (association.feedback)
      assocRecord.setValue(association.feedback, "feedback");

    return assocRecord;
  });

type ClozeQuestion = Omit<
  | AddClozeQuestionModalMutation$data["mutateQuiz"]["addClozeQuestion"]["modifiedQuestion"]
  | EditClozeQuestionMutation$data["mutateQuiz"]["updateClozeQuestion"]["modifiedQuestion"],
  " $fragmentSpreads"
>;
const createClozeElementsFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: ClozeQuestion,
  getClozeElementDataId: (index: number) => string
) =>
  payload.clozeElements!.map((clozeElement, i) => {
    const dataId = getClozeElementDataId(i);
    const clozeRecord =
      store.get(dataId) ?? store.create(dataId, "MultipleChoiceAnswer");

    clozeRecord.setValue(clozeElement.__typename, "__typename");
    if (clozeElement.__typename === "ClozeTextElement") {
      clozeRecord.setValue(clozeElement.text, "text");
    } else if (clozeElement.__typename === "ClozeBlankElement") {
      clozeRecord.setValue(clozeElement.correctAnswer, "correctAnswer");
      if (clozeElement.feedback)
        clozeRecord.setValue(clozeElement.feedback, "feedback");
    }

    return clozeRecord;
  });

export const questionUpdaterDeleteClosure =
  (quizAssessmentId: string, questionNumber: number, courseId: string) =>
  (
    store: RecordSourceSelectorProxy<DeleteQuestionButtonMutation$data>,
    data: DeleteQuestionButtonMutation$data
  ) => {
    const quiz = store.get(generateRelayStoreDataIdQuiz(quizAssessmentId))!;

    const questionPool = quiz.getLinkedRecords("questionPool")!;
    const questionDeleted = questionPool.splice(questionNumber - 1, 1)[0];
    quiz.setLinkedRecords(questionPool, "questionPool");

    deleteDanglingItems(
      store,
      questionDeleted.getLinkedRecord("item"),
      courseId
    );
  };