import { AddAssociationQuestionModalMutation$data } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import { AddClozeQuestionModalMutation$data } from "@/__generated__/AddClozeQuestionModalMutation.graphql";
import { AddFlashcardMutation$data } from "@/__generated__/AddFlashcardMutation.graphql";
import { AddMultipleChoiceQuestionModalMutation$data } from "@/__generated__/AddMultipleChoiceQuestionModalMutation.graphql";
import { EditAssociationQuestionMutation$data } from "@/__generated__/EditAssociationQuestionMutation.graphql";
import { EditClozeQuestionMutation$data } from "@/__generated__/EditClozeQuestionMutation.graphql";
import { EditFlashcardMutation$data } from "@/__generated__/EditFlashcardMutation.graphql";
import { EditMultipleChoiceQuestionMutation$data } from "@/__generated__/EditMultipleChoiceQuestionMutation.graphql";
import { FlashcardHeaderDeleteFlashcardSetMutation$data } from "@/__generated__/FlashcardHeaderDeleteFlashcardSetMutation.graphql";
import { lecturerDeleteFlashcardMutation$data } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";
import _ from "lodash";
import { RecordProxy, RecordSourceSelectorProxy } from "relay-runtime";

/*
 * id generation for relay store
 */
const generateRelayStoreDataIdFCSet = (flashcardSetAssessmentId: string) =>
  `client:${flashcardSetAssessmentId}:flashcardSet`;
const generateRelayStoreDataIdFC = (
  flashcardSetAssessmentId: string,
  number: number
) => `client:${flashcardSetAssessmentId}:flashcardSet:flashcards:${number}`;
const generateRelayStoreDataIdFCSide = (
  flashcardSetAssessmentId: string,
  flashcardSetNumber: number,
  sideNumber: number
) =>
  `${generateRelayStoreDataIdFC(
    flashcardSetAssessmentId,
    flashcardSetNumber
  )}:sides:${sideNumber}`;

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

const generateRelayStoreDataIdCourseIdSkills = (courseId: string) =>
  `client:root:coursesByIds(ids:["${courseId}"]):0`;

/*
 * updater functions, wrapped in closures to provide necessary context & play well with react's useCallback
 */

export function flashcardUpdaterClosure(
  mode: "add",
  flashcardSetId: string,
  flashcardNumber: number,
  courseId: string
): (
  store: RecordSourceSelectorProxy<AddFlashcardMutation$data>,
  data: AddFlashcardMutation$data
) => void;

export function flashcardUpdaterClosure(
  mode: "update",
  flashcardSetId: string,
  flashcardNumber: number,
  courseId: string
): (
  store: RecordSourceSelectorProxy<EditFlashcardMutation$data>,
  data: EditFlashcardMutation$data
) => void;

// Implementation signature (less specific)
export function flashcardUpdaterClosure(
  mode: "add" | "update",
  flashcardSetAssessmentId: string,
  flashcardNumber: number,
  courseId: string
) {
  return (
    store: RecordSourceSelectorProxy<
      AddFlashcardMutation$data | EditFlashcardMutation$data
    >,
    data: AddFlashcardMutation$data | EditFlashcardMutation$data
  ) => {
    const payloadFlashcard =
      mode === "add"
        ? (data as AddFlashcardMutation$data).mutateFlashcardSet.createFlashcard
            .flashcard
        : (data as EditFlashcardMutation$data).mutateFlashcardSet
            .updateFlashcard.flashcard;

    let flashcard;
    const flashcardDataId = generateRelayStoreDataIdFC(
      flashcardSetAssessmentId,
      flashcardNumber
    );
    if (mode === "add") {
      flashcard = store.create(flashcardDataId, "Flashcard");
    } /* update */ else {
      flashcard = assertRecordExists(
        store.get(flashcardDataId),
        flashcardDataId
      );
    }

    const flashcardSides = createFlashcardSidesFromPayload(
      store,
      payloadFlashcard,
      _.curry(generateRelayStoreDataIdFCSide)(
        flashcardSetAssessmentId,
        flashcardNumber
      )
    );
    flashcard.setLinkedRecords(flashcardSides, "sides");

    const flashcardItem = createItemFromPayload(
      store,
      payloadFlashcard.item,
      courseId
    );
    flashcard.setLinkedRecord(flashcardItem, "item");
    flashcard.setValue(payloadFlashcard.item.id, "itemId");

    const flashcardSet = store
      .get(data.mutateFlashcardSet.assessmentId)!
      .getLinkedRecord("flashcardSet")!;
    let currentFlashcards = flashcardSet.getLinkedRecords("flashcards")!;
    currentFlashcards =
      mode === "add"
        ? [...currentFlashcards, flashcard]
        : [
            ...currentFlashcards.slice(0, flashcardNumber),
            flashcard,
            ...currentFlashcards.slice(flashcardNumber + 1),
          ];
    flashcardSet.setLinkedRecords(currentFlashcards, "flashcards");
  };
}

/**
 * To our luck relay seems to already interconnect entities that contain a prop named `id`
 */
export const flashcardUpdaterDeleteClosure =
  (
    flashcardSetAssessmentId: string,
    flashcardNumber: number,
    courseId: string
  ) =>
  (
    store: RecordSourceSelectorProxy<lecturerDeleteFlashcardMutation$data>,
    data: lecturerDeleteFlashcardMutation$data
  ) => {
    const flashcardSet = store.get(
      generateRelayStoreDataIdFCSet(flashcardSetAssessmentId)
    )!;
    const flashcards = flashcardSet.getLinkedRecords("flashcards")!;
    const flashcardDeleted = flashcards.splice(flashcardNumber, 1)[0];
    flashcardSet.setLinkedRecords(flashcards, "flashcards");

    // removing the skills so that they won't appear in the Autocompletes
    const coursesByIds = assertRecordExists(
      store.get(generateRelayStoreDataIdCourseIdSkills(courseId)),
      "coursesByIds"
    );
    const knownSkills = new Map(
      coursesByIds
        .getLinkedRecords("skills")!
        .map((skill) => [skill.getValue("id") as string, skill])
    );

    const flashcardDeletedSkills = flashcardDeleted
      .getLinkedRecord("item")!
      .getLinkedRecords("associatedSkills")!;
    flashcardDeletedSkills.forEach((skill: any) =>
      knownSkills.delete(skill.getValue("id") as string)
    );
    coursesByIds.setLinkedRecords(Array.from(knownSkills.values()), "skills");

    flashcardDeletedSkills.forEach((skill: any) =>
      store.delete(skill.getDataID())
    );
  };

export const flashcardSetUpdaterDelete =
  (courseId: string) =>
  (
    store: RecordSourceSelectorProxy<FlashcardHeaderDeleteFlashcardSetMutation$data>,
    data: FlashcardHeaderDeleteFlashcardSetMutation$data
  ) =>
    // avoiding null pointers
    setTimeout(() => {
      const deletedContent = data.mutateContent.deleteContent;
      console.log("id:", deletedContent, store.get(deletedContent));

      const chapters = store
        .get(courseId)!
        .getLinkedRecord("chapters")!
        .getLinkedRecords("elements")!;
      for (const chapter of chapters) {
        const contents = chapter.getLinkedRecords("contents")!;
        if (contents.length === 0) continue;

        const newContents = contents.filter((content) => {
          const isNotDeleted = content.getDataID() !== deletedContent;
          if (!isNotDeleted) {
            store.delete(deletedContent);
            // FIXME: deletion of content isn't propagated to the "other content" section, even though it should
            // my guess is that something's not handled the right way in the course lecturer view
          }

          return isNotDeleted;
        });
        chapter.setLinkedRecords(newContents, "contents");
      }

      store.delete(data.mutateContent.deleteContent);
    }, 500);

// question

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

/*
 * helper functions to create records from payloads
 */

const createFlashcardSidesFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: AddFlashcardMutation$data["mutateFlashcardSet"]["createFlashcard"]["flashcard"],
  getFlashcardSideDataId: (index: number) => string
) =>
  payload.sides.map((flashcardSide, i) => {
    const dataId = getFlashcardSideDataId(i);
    const sideRecord =
      store.get(dataId) ?? store.create(dataId, "FlashcardSide");

    sideRecord.setValue(flashcardSide.label, "label");
    sideRecord.setValue(flashcardSide.isAnswer, "isAnswer");
    sideRecord.setValue(flashcardSide.isQuestion, "isQuestion");
    sideRecord.setValue(flashcardSide.text, "text");

    return sideRecord;
  });

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

/*
 * helper functions for items & skills
 */

type ItemPayload =
  AddFlashcardMutation$data["mutateFlashcardSet"]["createFlashcard"]["flashcard"]["item"];
const createItemFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: ItemPayload,
  courseId: string
) => {
  // update skills in second query for ItemFormSection Autocompletes
  // FIXME: might be null??
  const courseByIds = store.get(
    generateRelayStoreDataIdCourseIdSkills(courseId)
  );

  const allCourseSkills = courseByIds?.getLinkedRecords("skills")!;
  const knownSkills = new Set(
    allCourseSkills.map((skill) => skill.getValue("id") as string)
  );

  payload.associatedSkills.forEach((skill) => {
    const skillRecord = store.get(skill.id)!;
    skillRecord.setValue(skill.skillName, "skillName");

    if (!knownSkills.has(skill.id)) {
      allCourseSkills.push(skillRecord);
    }
  });
  courseByIds?.setLinkedRecords(allCourseSkills, "skills");

  return store.get(payload.id)!;
};

/*
 * etc.
 */

const assertRecordExists = <T, U>(
  record: RecordProxy<T> | null | undefined,
  identifier: string,
  baseRecord?: RecordProxy<U>
): RecordProxy<T> | never => {
  if (record) return record;

  let errorMessage = `Failure to access '${identifier}' in relay store`;
  if (baseRecord) {
    errorMessage += ` on base record ${baseRecord.getDataID()}`;
    console.error(baseRecord);
  }
  throw Error(errorMessage);
};
