import { AddFlashcardMutation$data } from "@/__generated__/AddFlashcardMutation.graphql";
import { FlashcardHeaderDeleteFlashcardSetMutation$data } from "@/__generated__/FlashcardHeaderDeleteFlashcardSetMutation.graphql";
import { QuizHeaderDeleteQuizMutation$data } from "@/__generated__/QuizHeaderDeleteQuizMutation.graphql";
import { RecordProxy, RecordSourceSelectorProxy } from "relay-runtime";

export const generateRelayStoreDataIdCourseIdSkills = (courseId: string) =>
  `client:root:coursesByIds(ids:["${courseId}"]):0`;

type ItemPayload =
  AddFlashcardMutation$data["mutateFlashcardSet"]["createFlashcard"]["flashcard"]["item"];
/**
 * Newly crated skills are already present in the store & linked to its item - but not linked to the all skill query
 * This function adds the new skills to the all skill query
 *
 * The all skill query is used in the AutoComplete part of the ItemFormSection
 */
export const createItemFromPayload = (
  store: RecordSourceSelectorProxy,
  payload: ItemPayload,
  courseId: string
) => {
  const courseByIds = store.get(
    generateRelayStoreDataIdCourseIdSkills(courseId)
  )!;

  const allCourseSkills = courseByIds.getLinkedRecords("skills")!;
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
  courseByIds.setLinkedRecords(allCourseSkills, "skills");

  return store.get(payload.id)!;
};

type Data =
  | FlashcardHeaderDeleteFlashcardSetMutation$data
  | QuizHeaderDeleteQuizMutation$data;
export const updaterSetDelete =
  (courseId: string) => (store: RecordSourceSelectorProxy<Data>, data: Data) =>
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
        if (contents?.length === 0) continue;

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
