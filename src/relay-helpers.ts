import { AddFlashcardMutation$data } from "@/__generated__/AddFlashcardMutation.graphql";
import { EditFlashcardMutation$data } from "@/__generated__/EditFlashcardMutation.graphql";
import { RecordProxy, RecordSourceSelectorProxy } from "relay-runtime";

const generateRelayStoreSideDataId = (
  flashcardSetId: string,
  flashcardSetNumber: number,
  sideNumber: number
) =>
  `client:${flashcardSetId}:flashcardSet:flashcards:${flashcardSetNumber}:sides:${sideNumber}`;
const generateRelayStoreSkillDataId = (itemId: string, skillNumber: number) =>
  `${itemId}:skills:${skillNumber}`;
const generateRelayStoreItemDataId = (
  flashcardSetId: string,
  flashcardSetNumber: number
) =>
  `client:${flashcardSetId}:flashcardSet:flashcards:${flashcardSetNumber}:item`;

/**
 * Wrapper to make the function to provide necessary context/ closure and paly
 * well with react's useCallback hook for performant caching
 */
// TODO refactor this to avoid redundancy with similar functions to be added
export const addFlashcardUpdaterClosure =
  (flashcardSetId: string, flashcardSetNumber: number) =>
  (
    store: RecordSourceSelectorProxy<AddFlashcardMutation$data>,
    data: AddFlashcardMutation$data
  ) => {
    const flashcardSetAssessmentRecord = store.get(
      data.mutateFlashcardSet.assessmentId
    )!;
    const flashcardSetRecord =
      flashcardSetAssessmentRecord.getLinkedRecord("flashcardSet")!;
    const currentFlashcardsRecords =
      flashcardSetRecord.getLinkedRecords("flashcards")!;

    const payloadFlashcard = data.mutateFlashcardSet.createFlashcard.flashcard;
    const newFlashcardRecord = store.get(payloadFlashcard.item.id);
    if (!newFlashcardRecord) return;

    // sides aren't automatically added to store, hence adding them from response
    const newFlashcardRecordSides: RecordProxy[] = [];
    payloadFlashcard.sides.forEach((flashcardSide, i) => {
      const record = store.create(
        generateRelayStoreSideDataId(flashcardSetId, flashcardSetNumber, i),
        "FlashcardSide"
      );
      record.setValue(flashcardSide.label, "label");
      record.setValue(flashcardSide.isAnswer, "isAnswer");
      record.setValue(flashcardSide.isQuestion, "isQuestion");
      record.setValue(flashcardSide.text, "text");
      newFlashcardRecordSides.push(record);
    });
    newFlashcardRecord.setLinkedRecords(newFlashcardRecordSides, "sides");

    const newFlashcardRecordSkills: RecordProxy[] = [];
    payloadFlashcard.item.associatedSkills.forEach((skill, i) => {
      const record = store.create(
        generateRelayStoreSkillDataId(payloadFlashcard.item.id, i),
        "Skill"
      );
      record.setValue(skill.id, "id");
      record.setValue(skill.skillCategory, "skillCategory");
      record.setValue(skill.skillName, "skillName");
      record.setValue(skill.isCustomSkill, "isCustomSkill");
      newFlashcardRecordSkills.push(record);
    });
    const newFlashcardRecordItem = store.create(
      generateRelayStoreItemDataId(flashcardSetId, flashcardSetNumber),
      "Item"
    );
    newFlashcardRecordItem.setLinkedRecords(
      newFlashcardRecordSkills,
      "associatedSkills"
    );
    newFlashcardRecordItem.setValue(payloadFlashcard.item.id, "id");
    newFlashcardRecordItem.setValue(
      [...payloadFlashcard.item.associatedBloomLevels],
      "associatedBloomLevels"
    );
    newFlashcardRecord.setLinkedRecord(newFlashcardRecordItem, "item");

    const flashcardRecordsUpdated = [
      ...currentFlashcardsRecords,
      newFlashcardRecord,
    ];
    flashcardSetRecord.setLinkedRecords(flashcardRecordsUpdated, "flashcards");
  };

export const editFlashcardUpdaterClosure =
  (test: string) =>
  (
    store: RecordSourceSelectorProxy<EditFlashcardMutation$data>,
    data: EditFlashcardMutation$data
  ) => {
    console.log("🤷 " + test);
  };
