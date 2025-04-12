import { AddAssociationQuestionModalMutation$data } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import { AddClozeQuestionModalMutation$data } from "@/__generated__/AddClozeQuestionModalMutation.graphql";
import { AddMultipleChoiceQuestionModalMutation$data } from "@/__generated__/AddMultipleChoiceQuestionModalMutation.graphql";
import { EditAssociationQuestionMutation$data } from "@/__generated__/EditAssociationQuestionMutation.graphql";
import { EditClozeQuestionMutation$data } from "@/__generated__/EditClozeQuestionMutation.graphql";
import { EditMultipleChoiceQuestionMutation$data } from "@/__generated__/EditMultipleChoiceQuestionMutation.graphql";
import _ from "lodash";
import { RecordSourceSelectorProxy } from "relay-runtime";
import { assertRecordExists, createItemFromPayload } from "./common";

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

type Types =
  | AddMultipleChoiceQuestionModalMutation$data
  | EditMultipleChoiceQuestionMutation$data
  | AddAssociationQuestionModalMutation$data
  | EditAssociationQuestionMutation$data
  | AddClozeQuestionModalMutation$data
  | EditClozeQuestionMutation$data;
export function questionUpdaterClosure(
  mode: "add" | "update",
  variant: "AssociationQuestion" | "ClozeQuestion" | "MultipleChoiceQuestion",
  quizAssessmentId: string,
  courseId: string
) {
  return (store: RecordSourceSelectorProxy<Types>, data: Types) => {
    // (data.mutateQuiz[`${mode}${variant}`] as undefined as Types)
    //  as undefined as AddAssociationQuestionModalMutation$data["mutateQuiz"]["addAssociationQuestion"]["modifiedQuestion"];

    let payloadQuestion = data.mutateQuiz[`${mode}${variant}`].modifiedQuestion;
    let question;
    let questionIndex;
    // questions are mapped via array index numbers, not via the number prop
    const questionDataId = _.curry(generateRelayStoreDataIdQuestion)(
      quizAssessmentId
    );
    if (mode === "add") {
      const questionPoolSize = store
        .get(generateRelayStoreDataIdQuiz(quizAssessmentId))!
        .getLinkedRecords("questionPool")!.length;
      questionIndex = questionPoolSize;

      question = store.create(questionDataId(questionPoolSize), variant);
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
      const questionAnswers = createMCAnswersFromPayload(
        store,
        payloadQuestion,
        _.curry(generateRelayStoreDataIdMCAnswer)(
          quizAssessmentId,
          questionIndex
        )
      );
      question.setLinkedRecords(questionAnswers, "answers");

      question.setValue(payloadQuestion.text, "text");
      // TODO fix schema
      // question.setValue(
      //   payloadQuestion.numberOfCorrectAnswers,
      //   "numberOfCorrectAnswers"
      // );
    } else if (variant === "AssociationQuestion") {
      const questionAssociations = createCorrectAssociationsFromPayload(
        store,
        payloadQuestion,
        _.curry(generateRelayStoreDataIdCorrectAssociation)(
          quizAssessmentId,
          questionIndex
        )
      );
      question.setLinkedRecords(questionAssociations, "correctAssociations");

      // TODO fix schema
      // forgot what I commented out...
      question.setValue(payloadQuestion.text, "text");
    } else if (variant === "ClozeQuestion") {
      const questionClozeElements = createClozeElementsFromPayload(
        store,
        payloadQuestion,
        _.curry(generateRelayStoreDataIdClozeElement)(
          quizAssessmentId,
          questionIndex
        )
      );
      question.setLinkedRecords(questionClozeElements, "clozeElements");

      question.setValue(payloadQuestion.allBlanks, "allBlanks");
      question.setValue(payloadQuestion.showBlankList, "showBlankList");
      question.setValue(
        payloadQuestion.additionalWrongAnswers,
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
    question.setLinkedRecord(questionItem, "item");
    question.setValue(payloadQuestion.item!.id, "itemId");

    const questionQuiz = store
      .get(data.mutateQuiz.assessmentId)!
      .getLinkedRecord("quiz")!;
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

const createMCAnswersFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: Omit<
    AddMultipleChoiceQuestionModalMutation$data["mutateQuiz"]["addMultipleChoiceQuestion"]["modifiedQuestion"],
    " $fragmentSpreads"
  >,
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

const createCorrectAssociationsFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: Omit<
    AddAssociationQuestionModalMutation$data["mutateQuiz"]["addAssociationQuestion"]["modifiedQuestion"],
    " $fragmentSpreads"
  >,
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

const createClozeElementsFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: Omit<
    AddClozeQuestionModalMutation$data["mutateQuiz"]["addClozeQuestion"]["modifiedQuestion"],
    " $fragmentSpreads"
  >,
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
