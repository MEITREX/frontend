import { BloomLevel } from "@/__generated__/AddFlashcardSetModalMutation.graphql";
import { EditFlashcardFragment$data } from "@/__generated__/EditFlashcardFragment.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import {
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { cache, Dispatch, SetStateAction } from "react";
import { graphql, PreloadedQuery } from "react-relay";
import { FormSection } from "./Form";
import standardizedCompetencies from "./form-sections/data/standardized-competency-catalog.json";
import ItemFormSectionAutocompletes from "./form-sections/item/ItemFormSectionAutocompletes";
import { processStandardizedCompetencies } from "./form-sections/item/standardizedCompentencies";

export const getStandardizedCompetencies = cache(() =>
  processStandardizedCompetencies(standardizedCompetencies)
);

const BLOOM_LEVELS = [
  "REMEMBER",
  "UNDERSTAND",
  "APPLY",
  "ANALYZE",
  "CREATE",
  "EVALUATE",
] as const;

export type CreateItem = {
  associatedBloomLevels: BloomLevel[];
  associatedSkills: CreateItemSkill[];
};
export type CreateItemSkill = {
  skillName: string;
  skillCategory: string;
  isCustomSkill: boolean;
};

export type Item = {
  id: string;
  associatedBloomLevels: BloomLevel[];
  associatedSkills: ItemSkill[];
};
export type ItemSkill = {
  id: string;
  skillName: string;
  skillCategory: string;
  isCustomSkill: boolean;
};

/**
 * This function maps the item > skill returned by relay to the react-state compatible type.
 * The destructuring is necessary due to `readonly` types from relay
 */
export const mapRelayItemToItem = (
  relayItem: Readonly<Pick<EditFlashcardFragment$data, "item" | "itemId">>
): Item => ({
  id: relayItem.itemId,
  associatedSkills: relayItem.item.associatedSkills.map((skill) => ({
    ...skill,
  })),
  associatedBloomLevels: relayItem.item.associatedBloomLevels as BloomLevel[],
});

export type AssessmentDetailsSkillSectionProps =
  | {
      operation: "create";
      item: CreateItem;
      setItem: Dispatch<SetStateAction<CreateItem>>;

      allSkillsQueryRef:
        | PreloadedQuery<lecturerAllSkillsQuery>
        | undefined
        | null;
    }
  | {
      operation: "edit";
      item: CreateItem | Item;
      setItem: Dispatch<SetStateAction<CreateItem | Item>>;

      allSkillsQueryRef:
        | PreloadedQuery<lecturerAllSkillsQuery>
        | undefined
        | null;
    };

const AssessmentDetailsSkillSection = (
  props: AssessmentDetailsSkillSectionProps
) => {
  const { item } = props;

  const {
    staticSkillCategorySkillMap: SKILL_CATALOGUE,
    staticSkillCategoryTitleShortNameMap: SKILL_CATEGORY_ABBREVIATION,
  } = getStandardizedCompetencies();

  const skillsSelected = item.associatedSkills;

  return (
    <>
      <Stack spacing={2} direction="column">
        {item.associatedSkills.length > 0 && (
          <Stack spacing={1} direction="column">
            <InputLabel htmlFor="skills-selected">
              Associated Skills:
            </InputLabel>
            <Stack
              id="skills-selected"
              direction="row"
              sx={{
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {skillsSelected.map((skill, i) => (
                <Chip
                  key={i}
                  label={`${
                    SKILL_CATEGORY_ABBREVIATION[skill.skillCategory] ||
                    skill.skillCategory
                  }: ${skill.skillName}`}
                  onDelete={() =>
                    props.setItem((prev) => {
                      const newSelectedSkills = [...prev.associatedSkills];
                      newSelectedSkills.splice(i, 1);
                      return {
                        ...prev,
                        associatedSkills: newSelectedSkills,
                      };
                    })
                  }
                  sx={{
                    maxWidth: "250px",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                  title={`${skill.skillCategory}: ${skill.skillName}`}
                />
              ))}
            </Stack>
          </Stack>
        )}

        {props.allSkillsQueryRef && (
          <ItemFormSectionAutocompletes
            skillsSelected={skillsSelected}
            setItem={props.setItem}
            allSkillsQueryRef={props.allSkillsQueryRef}
            SKILL_CATALOGUE={SKILL_CATALOGUE}
            SKILL_CATEGORY_ABBREVIATION={SKILL_CATEGORY_ABBREVIATION}
            stackDirection="column"
          />
        )}

        <div className="text-red-600 text-xs mr-3 mb-4">
          {skillsSelected.length < 1 && (
            <div>
              Attention without Skill, task cannot be considered in the
              performance analysis
            </div>
          )}
        </div>
      </Stack>
    </>
  );
};

export default AssessmentDetailsSkillSection;
