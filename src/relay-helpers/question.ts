import { AddAssociationQuestionModalMutation$data } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import { AddClozeQuestionModalMutation$data } from "@/__generated__/AddClozeQuestionModalMutation.graphql";
import { AddMultipleChoiceQuestionModalMutation$data } from "@/__generated__/AddMultipleChoiceQuestionModalMutation.graphql";
import { EditAssociationQuestionMutation$data } from "@/__generated__/EditAssociationQuestionMutation.graphql";
import { EditClozeQuestionMutation$data } from "@/__generated__/EditClozeQuestionMutation.graphql";
import { EditMultipleChoiceQuestionMutation$data } from "@/__generated__/EditMultipleChoiceQuestionMutation.graphql";
import _ from "lodash";
import { RecordSourceSelectorProxy, RecordProxy } from "relay-runtime";
import {
  assertRecordExists,
  createItemFromPayload,
  generateRelayStoreDataIdCourseIdSkills,
} from "./common";
import { lecturerDeleteFlashcardMutation$data } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";

type Types =
  | AddMultipleChoiceQuestionModalMutation$data
  | EditMultipleChoiceQuestionMutation$data
  | AddAssociationQuestionModalMutation$data
  | EditAssociationQuestionMutation$data
  | AddClozeQuestionModalMutation$data
  | EditClozeQuestionMutation$data;

export function updateMCQuestionUpdaterClosure(
  quizAssessmentId: string,
  courseId: string
) {
  return (store: RecordSourceSelectorProxy<Types>, data: Types) => {
    // get payloadQuestion from the data
    data = data as EditMultipleChoiceQuestionMutation$data;
    let payloadQuestion =
      data.mutateQuiz.updateMultipleChoiceQuestion.modifiedQuestion;

    // get the question record
    let questionIndex = payloadQuestion.number - 1;
    let questionRecord = store.get(
      `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}`
    );
    if (!questionRecord) {
      throw new Error("Question record not found");
    }

    // update the question record's properties
    // property: answers
    if (payloadQuestion.answers) {
      let answersRecord: RecordProxy[] = [];
      payloadQuestion.answers.map((answer, i) => {
        const dataId = `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}:answer:${i}`;
        const answerRecord =
          store.get(dataId) ?? store.create(dataId, "MultipleChoiceAnswer");
        answerRecord.setValue(answer.answerText, "answerText");
        answerRecord.setValue(answer.correct, "correct");
        if (answer.feedback) {
          answerRecord.setValue(answer.feedback, "feedback");
        }
        answersRecord.push(answerRecord);
      });
      questionRecord.setLinkedRecords(answersRecord, "answers");
    }

    // property: hint
    if (payloadQuestion.hint) {
      questionRecord.setValue(payloadQuestion.hint, "hint");
    }

    // property: item
    const questionItemNew = createItemFromPayload(
      store,
      payloadQuestion.item!,
      courseId
    );
    questionItemNew.setValue(payloadQuestion.item!.id, "id");
    questionRecord.setLinkedRecord(questionItemNew, "item");
    questionRecord.setValue(payloadQuestion.item!.id, "itemId");

    // property: text
    if (payloadQuestion.text) {
      questionRecord.setValue(payloadQuestion.text, "text");
    }

    // property: type
    questionRecord.setValue("MULTIPLE_CHOICE", "type");
  };
}

export function addMCQuestionUpdaterClosure(
  quizAssessmentId: string,
  courseId: string
) {
  return (store: RecordSourceSelectorProxy<Types>, data: Types) => {
    // get payloadQuestion from the data
    data = data as AddMultipleChoiceQuestionModalMutation$data;
    let payloadQuestion =
      data.mutateQuiz.addMultipleChoiceQuestion.modifiedQuestion;

    // create the question record
    let questionIndex = getQuestionPoolSize(store, quizAssessmentId);
    let questionRecord = store.create(
      `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}`,
      "MultipleChoiceQuestion"
    );
    if (!questionRecord) {
      throw new Error("Question record could not be created");
    }

    // update the question record's properties
    // property: answers
    if (payloadQuestion.answers) {
      let answersRecord: RecordProxy[] = [];
      payloadQuestion.answers.map((answer, i) => {
        const dataId = `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}:answer:${i}`;
        const answerRecord =
          store.get(dataId) ?? store.create(dataId, "MultipleChoiceAnswer");
        answerRecord.setValue(answer.answerText, "answerText");
        answerRecord.setValue(answer.correct, "correct");
        if (answer.feedback) {
          answerRecord.setValue(answer.feedback, "feedback");
        }
        answersRecord.push(answerRecord);
      });
      questionRecord.setLinkedRecords(answersRecord, "answers");
    }

    // property: hint
    if (payloadQuestion.hint) {
      questionRecord.setValue(payloadQuestion.hint, "hint");
    }

    // property: item
    const questionItemNew = createItemFromPayload(
      store,
      payloadQuestion.item!,
      courseId
    );
    questionItemNew.setValue(payloadQuestion.item!.id, "id");
    questionRecord.setLinkedRecord(questionItemNew, "item");
    questionRecord.setValue(payloadQuestion.item!.id, "itemId");

    // property: text
    if (payloadQuestion.text) {
      questionRecord.setValue(payloadQuestion.text, "text");
    }

    // property: type
    questionRecord.setValue("MULTIPLE_CHOICE", "type");

    const quizRecord = store.get(`client:${quizAssessmentId}:quiz`)!;
    let questionPool = quizRecord.getLinkedRecords("questionPool")!;
    questionPool.push(questionRecord);
    quizRecord.setLinkedRecords(questionPool, "questionPool");
  };
}

export function addAssociationQuestionUpdaterClosure(
  quizAssessmentId: string,
  courseId: string
) {
  return (store: RecordSourceSelectorProxy<Types>, data: Types) => {
    // get payloadQuestion from the data
    data = data as AddAssociationQuestionModalMutation$data;
    let payloadQuestion =
      data.mutateQuiz.addAssociationQuestion.modifiedQuestion;

    // create the question record
    let questionIndex = getQuestionPoolSize(store, quizAssessmentId);
    let questionRecord = store.create(
      `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}`,
      "AssociationQuestion"
    );
    if (!questionRecord) {
      throw new Error("Question record could not be created");
    }

    // update the question record's properties
    // property: correctAssociations
    let correctAssociationsRecords: RecordProxy[] = [];
    payloadQuestion.correctAssociations!.map((association, i) => {
      const dataId = `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}:correctAssociations:${i}`;
      const associationRecord =
        store.get(dataId) ?? store.create(dataId, "SingleAssociation");
      associationRecord.setValue(association.right, "right");
      associationRecord.setValue(association.left, "left");
      if (association.feedback) {
        associationRecord.setValue(association.feedback, "feedback");
      }
      correctAssociationsRecords.push(associationRecord);
    });
    questionRecord.setLinkedRecords(
      correctAssociationsRecords,
      "correctAssociations"
    );

    // property: hint
    if (payloadQuestion.hint) {
      questionRecord.setValue(payloadQuestion.hint, "hint");
    }

    // property: item
    const questionItemNew = createItemFromPayload(
      store,
      payloadQuestion.item!,
      courseId
    );
    questionItemNew.setValue(payloadQuestion.item!.id, "id");
    questionRecord.setLinkedRecord(questionItemNew, "item");
    questionRecord.setValue(payloadQuestion.item!.id, "itemId");

    // property: text
    if (payloadQuestion.text) {
      questionRecord.setValue(payloadQuestion.text, "text");
    }

    // property: type
    questionRecord.setValue("ASSOCIATION", "type");

    const quizRecord = store.get(`client:${quizAssessmentId}:quiz`)!;
    let questionPool = quizRecord.getLinkedRecords("questionPool")!;
    questionPool.push(questionRecord);
    quizRecord.setLinkedRecords(questionPool, "questionPool");
  };
}

export function updateAssociationQuestionUpdaterClosure(
  quizAssessmentId: string,
  courseId: string
) {
  return (store: RecordSourceSelectorProxy<Types>, data: Types) => {
    // get payloadQuestion from the data
    data = data as EditAssociationQuestionMutation$data;
    let payloadQuestion =
      data.mutateQuiz.updateAssociationQuestion.modifiedQuestion;

    // get the question record
    let questionIndex = payloadQuestion.number - 1;
    let questionRecord = store.get(
      `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}`
    );
    if (!questionRecord) {
      throw new Error("Question record not found");
    }

    // update the question record's properties
    // property: correctAssociations
    let correctAssociationsRecords: RecordProxy[] = [];
    payloadQuestion.correctAssociations!.map((association, i) => {
      const dataId = `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}:correctAssociations:${i}`;
      const associationRecord =
        store.get(dataId) ?? store.create(dataId, "SingleAssociation");
      associationRecord.setValue(association.right, "right");
      associationRecord.setValue(association.left, "left");
      if (association.feedback) {
        associationRecord.setValue(association.feedback, "feedback");
      }
      correctAssociationsRecords.push(associationRecord);
    });
    questionRecord.setLinkedRecords(
      correctAssociationsRecords,
      "correctAssociations"
    );

    // property: hint
    if (payloadQuestion.hint) {
      questionRecord.setValue(payloadQuestion.hint, "hint");
    }

    // property: item
    const questionItemNew = createItemFromPayload(
      store,
      payloadQuestion.item!,
      courseId
    );
    questionItemNew.setValue(payloadQuestion.item!.id, "id");
    questionRecord.setLinkedRecord(questionItemNew, "item");
    questionRecord.setValue(payloadQuestion.item!.id, "itemId");

    // property: text
    if (payloadQuestion.text) {
      questionRecord.setValue(payloadQuestion.text, "text");
    }
  };
}

export function addClozeQuestionUpdaterClosure(
  quizAssessmentId: string,
  courseId: string
) {
  return (store: RecordSourceSelectorProxy<Types>, data: Types) => {
    // get payloadQuestion from the data
    data = data as AddClozeQuestionModalMutation$data;
    let payloadQuestion = data.mutateQuiz.addClozeQuestion.modifiedQuestion;

    // create the question record
    let questionIndex = getQuestionPoolSize(store, quizAssessmentId);
    let questionRecord = store.create(
      `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}`,
      "ClozeQuestion"
    );
    if (!questionRecord) {
      throw new Error("Question record could not be created");
    }

    // set the question record's properties
    // property: additional wrong answers
    if (payloadQuestion.additionalWrongAnswers) {
      let newAWAs: string[] = [];
      payloadQuestion.additionalWrongAnswers.map((answer, i) => {
        newAWAs.push(answer);
      });
      questionRecord.setValue(newAWAs, "additionalWrongAnswers");
    }

    // property: allBlanks
    if (payloadQuestion.allBlanks) {
      let newAllBlanks: string[] = [];
      payloadQuestion.allBlanks.map((answer, i) => {
        newAllBlanks.push(answer);
      });
      questionRecord.setValue(newAllBlanks, "allBlanks");
    }

    // property: clozeElements
    let clozeElementsRecords: RecordProxy[] = [];
    payloadQuestion.clozeElements!.map((clozeElement, i) => {
      const dataId = `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}:clozeElements:${i}`;
      const clozeElementRecord =
        store.get(dataId) ?? store.create(dataId, "ClozeElement");
      clozeElementRecord.setValue(clozeElement.__typename, "__typename");
      if (clozeElement.__typename === "ClozeTextElement") {
        clozeElementRecord.setValue(clozeElement.text, "text");
      } else if (clozeElement.__typename === "ClozeBlankElement") {
        clozeElementRecord.setValue(
          clozeElement.correctAnswer,
          "correctAnswer"
        );
        if (clozeElement.feedback) {
          clozeElementRecord.setValue(clozeElement.feedback, "feedback");
        }
      }
      clozeElementsRecords.push(clozeElementRecord);
    });
    questionRecord.setLinkedRecords(clozeElementsRecords, "clozeElements");

    // property: hint
    if (payloadQuestion.hint) {
      questionRecord.setValue(payloadQuestion.hint, "hint");
    }

    // property: item
    const questionItemNew = createItemFromPayload(
      store,
      payloadQuestion.item!,
      courseId
    );
    questionItemNew.setValue(payloadQuestion.item!.id, "id");
    questionRecord.setLinkedRecord(questionItemNew, "item");
    questionRecord.setValue(payloadQuestion.item!.id, "itemId");

    // property: show blanks list
    if (payloadQuestion.showBlanksList) {
      questionRecord.setValue(payloadQuestion.showBlanksList, "showBlanksList");
    }

    // property: type
    questionRecord.setValue("CLOZE", "type");

    const quizRecord = store.get(`client:${quizAssessmentId}:quiz`)!;
    let questionPool = quizRecord.getLinkedRecords("questionPool")!;
    questionPool.push(questionRecord);
    quizRecord.setLinkedRecords(questionPool, "questionPool");
  };
}

export function updateClozeQuestionUpdaterClosure(
  quizAssessmentId: string,
  courseId: string
) {
  return (store: RecordSourceSelectorProxy<Types>, data: Types) => {
    // get payloadQuestion from the data
    data = data as EditClozeQuestionMutation$data;
    let payloadQuestion = data.mutateQuiz.updateClozeQuestion.modifiedQuestion;

    // get the question record
    let questionIndex = payloadQuestion.number - 1;
    let questionRecord = store.get(
      `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}`
    );
    if (!questionRecord) {
      throw new Error("Question record not found");
    }

    // update the question record's properties
    // property: additional wrong answers
    if (payloadQuestion.additionalWrongAnswers) {
      let newAWAs: string[] = [];
      payloadQuestion.additionalWrongAnswers.map((answer, i) => {
        newAWAs.push(answer);
      });
      questionRecord.setValue(newAWAs, "additionalWrongAnswers");
    }

    // property: allBlanks
    if (payloadQuestion.allBlanks) {
      let newAllBlanks: string[] = [];
      payloadQuestion.allBlanks.map((answer, i) => {
        newAllBlanks.push(answer);
      });
      questionRecord.setValue(newAllBlanks, "allBlanks");
    }

    // property: clozeElements
    let clozeElementsRecords: RecordProxy[] = [];
    payloadQuestion.clozeElements!.map((clozeElement, i) => {
      const dataId = `client:${quizAssessmentId}:quiz:questionPool:${questionIndex}:clozeElements:${i}`;
      const clozeElementRecord =
        store.get(dataId) ?? store.create(dataId, "ClozeElement");
      clozeElementRecord.setValue(clozeElement.__typename, "__typename");
      if (clozeElement.__typename === "ClozeTextElement") {
        clozeElementRecord.setValue(clozeElement.text, "text");
      } else if (clozeElement.__typename === "ClozeBlankElement") {
        clozeElementRecord.setValue(
          clozeElement.correctAnswer,
          "correctAnswer"
        );
        if (clozeElement.feedback) {
          clozeElementRecord.setValue(clozeElement.feedback, "feedback");
        }
      }
      clozeElementsRecords.push(clozeElementRecord);
    });
    questionRecord.setLinkedRecords(clozeElementsRecords, "clozeElements");

    // property: hint
    if (payloadQuestion.hint) {
      questionRecord.setValue(payloadQuestion.hint, "hint");
    }

    // property: item
    const questionItemNew = createItemFromPayload(
      store,
      payloadQuestion.item!,
      courseId
    );
    questionItemNew.setValue(payloadQuestion.item!.id, "id");
    questionRecord.setLinkedRecord(questionItemNew, "item");
    questionRecord.setValue(payloadQuestion.item!.id, "itemId");

    // property: show blanks list
    if (payloadQuestion.showBlanksList) {
      questionRecord.setValue(payloadQuestion.showBlanksList, "showBlanksList");
    }
  };
}

function getQuestionPoolSize(
  store: RecordSourceSelectorProxy<Types>,
  quizAssessmentId: string
) {
  let size: number;
  if (
    store
      .get(`client:${quizAssessmentId}:quiz`)
      ?.getLinkedRecords("questionPool")
  ) {
    size = store
      .get(`client:${quizAssessmentId}:quiz`)!
      .getLinkedRecords("questionPool")!.length;
  } else {
    size = 0;
  }
  return size;
}
