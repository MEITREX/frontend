import { AddFlashcardMutation$data } from "@/__generated__/AddFlashcardMutation.graphql";
import { EditFlashcardMutation$data } from "@/__generated__/EditFlashcardMutation.graphql";
import { FlashcardHeaderDeleteFlashcardSetMutation$data } from "@/__generated__/FlashcardHeaderDeleteFlashcardSetMutation.graphql";
import { lecturerDeleteFlashcardMutation$data } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";
import _ from "lodash";
import { RecordSourceSelectorProxy } from "relay-runtime";
import {
  assertRecordExists,
  createItemFromPayload,
  generateRelayStoreDataIdCourseIdSkills,
} from "./common";

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
