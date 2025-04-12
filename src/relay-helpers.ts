import { AddFlashcardMutation$data } from "@/__generated__/AddFlashcardMutation.graphql";
import { EditFlashcardMutation$data } from "@/__generated__/EditFlashcardMutation.graphql";
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

const generateRelayStoreDataIdCourseIdSkills = (courseId: string) =>
  `client:root:coursesByIds(ids:["${courseId}"]):0`;

/*
 * updater functions, wrapped in closures to provide necessary context & play well with react's useCallback
 */

export function flashcardUpdaterClosure(
  mode: "create",
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
  mode: "create" | "update",
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
      mode === "create"
        ? (data as AddFlashcardMutation$data).mutateFlashcardSet.createFlashcard
            .flashcard
        : (data as EditFlashcardMutation$data).mutateFlashcardSet
            .updateFlashcard.flashcard;

    let flashcard;
    const flashcardDataId = generateRelayStoreDataIdFC(
      flashcardSetAssessmentId,
      flashcardNumber
    );
    if (mode === "create") {
      flashcard = store.create(flashcardDataId, "Flashcard");
    } /* update */ else {
      flashcard = assertRecordExists(
        store.get(flashcardDataId),
        flashcardDataId
      );

      // delete leftover sides
      const flashcardSides = flashcard.getLinkedRecords("sides");
      const sidesLengthRecord = Number(flashcardSides?.length);
      const sidesLengthPayload = payloadFlashcard.sides.length;
      if (sidesLengthRecord > sidesLengthPayload) {
        const delta = sidesLengthRecord - sidesLengthPayload;

        // mimic pythons range without possibility for an offset
        [...Array<undefined>(delta).keys()].forEach((n) => {
          store.delete(flashcardSides![sidesLengthPayload + n].getDataID());
        });
      }
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
      mode === "create"
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

/*
 * helper functions to create records from payloads
 */

const createFlashcardSidesFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: Omit<
    AddFlashcardMutation$data["mutateFlashcardSet"]["createFlashcard"]["flashcard"],
    "item"
  >,
  getFlashcardSideDataId: (index: number) => string
): RecordProxy[] =>
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
  const courseByIds = assertRecordExists(
    store.get(generateRelayStoreDataIdCourseIdSkills(courseId)),
    "coursesByIds"
  );
  const allCourseSkills = courseByIds.getLinkedRecords("skills")!;
  const knownSkills = new Set(
    allCourseSkills.map((skill) => skill.getValue("id") as string)
  );

  payload.associatedSkills.forEach((skill) => {
    const skillRecord = store.get(skill.id)!;
    if (!knownSkills.has(skill.id)) {
      allCourseSkills.push(skillRecord);
    }
  });
  courseByIds.setLinkedRecords(allCourseSkills, "skills");

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
