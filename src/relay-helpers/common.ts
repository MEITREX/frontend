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
  // since this is a prefetch query: just to make sure...
  const courseByIds = store.get(
    generateRelayStoreDataIdCourseIdSkills(courseId)
  );
  if (!courseByIds) return;

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

export const deleteDanglingItems = (
  store: RecordSourceSelectorProxy,
  item: RecordProxy,
  courseId: string
) => {
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

  const flashcardDeletedSkills = item.getLinkedRecords("associatedSkills")!;
  flashcardDeletedSkills.forEach((skill: any) =>
    knownSkills.delete(skill.getValue("id") as string)
  );
  coursesByIds.setLinkedRecords(Array.from(knownSkills.values()), "skills");

  flashcardDeletedSkills.forEach((skill: any) =>
    store.delete(skill.getDataID())
  );
};

type Data =
  | FlashcardHeaderDeleteFlashcardSetMutation$data
  | QuizHeaderDeleteQuizMutation$data;
export const updaterSetDelete =
  (courseId: string) => (store: RecordSourceSelectorProxy<Data>, data: Data) =>
    // avoiding null pointers on the deleted content before navigating in `onComplete`
    setTimeout(() => {
      const deletedContent = data.mutateContent.deleteContent;
      console.log("id:", deletedContent, store.get(deletedContent));

      const chapters = store
        .get(courseId)!
        .getLinkedRecord("chapters")
        ?.getLinkedRecords("elements");
      // `.getLinkedRecord("chapters")` rarely seems to return null for some reason
      // since this is the behavior we actually want to archive here, I'm fine with it
      if (chapters)
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
