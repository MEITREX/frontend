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
import { FormSection } from "../../Form";
import standardizedCompetencies from "../data/standardized-competency-catalog.json";
import ItemFormSectionAutocompletes from "./ItemFormSectionAutocompletes";
import { processStandardizedCompetencies } from "./standardizedCompentencies";

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

export const itemFormSectionFragment = graphql`
  fragment ItemFormSectionNewAllSkillsFragment on Course {
    skills {
      id
      skillName
      skillCategory
      isCustomSkill
    }
  }
`;

export type ItemFormSectionProps =
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

const ItemFormSection = (props: ItemFormSectionProps) => {
  const { item } = props;

  const {
    staticSkillCategorySkillMap: SKILL_CATALOGUE,
    staticSkillCategoryTitleShortNameMap: SKILL_CATEGORY_ABBREVIATION,
  } = getStandardizedCompetencies();

  const skillsSelected = item.associatedSkills;

  return (
    <FormSection title="Item Information">
      <FormControl variant="outlined">
        <InputLabel htmlFor="assessmentBloomLevelsInput">
          Levels of Blooms Taxonomy
        </InputLabel>

        <Select
          // prevent selection text from
          sx={{
            ".Mui-disabled": {
              "-webkit-text-fill-color": "rgba(0, 0, 0, 0.87) !important",
            },
          }}
          className="min-w-[16rem] "
          label="Bloom Level"
          labelId="assessmentBloomLevelsLabel"
          value={item.associatedBloomLevels}
          onChange={({ target: { value } }) =>
            props.setItem((prev) => ({
              ...prev,
              associatedBloomLevels: (typeof value === "string"
                ? value.split(",")
                : value) as BloomLevel[],
            }))
          }
          renderValue={(selectedLevels) =>
            selectedLevels
              .map(
                (level) => level[0].toUpperCase() + level.slice(1).toLowerCase()
              )
              .join(", ")
          }
          inputProps={{ id: "assessmentBloomLevelsInput" }}
          required
          multiple
        >
          {BLOOM_LEVELS.map((level) => (
            <MenuItem value={level} key={level}>
              <Checkbox
                checked={item.associatedBloomLevels.indexOf(level) !== -1}
              />
              <ListItemText>
                {level[0].toUpperCase() + level.slice(1).toLowerCase()}
              </ListItemText>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {item.associatedSkills.length > 0 ? (
        <>
          <InputLabel htmlFor="skills-selected">Associated Skills:</InputLabel>
          <Stack
            id="skills-selected"
            direction="row"
            sx={{
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            {skillsSelected.map((skill, i) => (
              <Chip
                key={i}
                sx={{
                  maxWidth: "250px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
                title={skill.skillCategory + ": " + skill.skillName}
                label={
                  (SKILL_CATEGORY_ABBREVIATION[skill.skillCategory] ||
                    skill.skillCategory) +
                  ": " +
                  skill.skillName
                }
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
              />
            ))}
          </Stack>
        </>
      ) : (
        // for vertical spacing
        <div className="my-[-6px]" />
      )}

      {props.allSkillsQueryRef && (
        <ItemFormSectionAutocompletes
          skillsSelected={skillsSelected}
          setItem={props.setItem}
          allSkillsQueryRef={props.allSkillsQueryRef}
          SKILL_CATALOGUE={SKILL_CATALOGUE}
          SKILL_CATEGORY_ABBREVIATION={SKILL_CATEGORY_ABBREVIATION}
        />
      )}
      <div className="text-red-600 text-xs mr-3 mb-4">
        {item.associatedBloomLevels.length < 1 && skillsSelected.length < 1 ? (
          <div>
            Attention without Blooms Taxonomy and Skill, task cannot be
            considered in the performance analysis
          </div>
        ) : (
          (item.associatedBloomLevels.length < 1 && (
            <div>
              Attention without Blooms Taxonomy, task cannot be considered in
              the performance analysis
            </div>
          )) ||
          (skillsSelected.length < 1 && (
            <div>
              Attention without Skill, task cannot be considered in the
              performance analysis
            </div>
          ))
        )}
      </div>
    </FormSection>
  );
};

export default ItemFormSection;
