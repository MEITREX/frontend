import { AddFlashcardMutation$data } from "@/__generated__/AddFlashcardMutation.graphql";
import { RecordProxy, RecordSourceSelectorProxy } from "relay-runtime";

export const generateRelayStoreDataIdCourseIdSkills = (courseId: string) =>
  `client:root:coursesByIds(ids:["${courseId}"]):0`;

type ItemPayload =
  AddFlashcardMutation$data["mutateFlashcardSet"]["createFlashcard"]["flashcard"]["item"];
export const createItemFromPayload = (
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

export const assertRecordExists = <T, U>(
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
