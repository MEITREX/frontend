import {
  BloomLevel,
  SkillInput,
} from "@/__generated__/AddFlashcardSetModalMutation.graphql";
import { ItemFormSectionCourseSkillsQuery } from "@/__generated__/ItemFormSectionCourseSkillsQuery.graphql";
import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  createFilterOptions,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { cache, useEffect, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { FormSection } from "../Form";
import standardizedCompetencies from "./data/standardized-competency-catalog.json";

interface IEEEStandardizedCompetencies {
  knowledgeAreas: KnowledgeArea[];
  sources: Source[];
}
interface KnowledgeArea {
  title: string;
  shortTitle: string;
  competencies: Competence[];
}
interface Competence {
  title: string;
  description: string;
  taxonomy: string;
  version: string;
  sourceId: number;
}
interface Source {
  id: number;
  title: string;
  author: string;
  uri: string;
}

type MappedSkillType = {
  skillName: string;
  bloomTaxonomy: string;
  description: string;
  isCustomSkill: boolean;
};

export const processStandardizedCompetencies = (
  standardizedCompetenciesRaw: IEEEStandardizedCompetencies
): {
  staticSkillCategorySkillMap: Record<string, MappedSkillType[]>;
  staticSkillCategoryTitleShortNameMap: Record<string, string>;
} => {
  const staticSkillCategorySkillMap =
    standardizedCompetenciesRaw.knowledgeAreas.reduce((acc, knowledgeArea) => {
      const skills = knowledgeArea.competencies.map((competence) => ({
        skillName: competence.title,
        bloomTaxonomy: competence.taxonomy,
        description: competence.description,
        isCustomSkill: false,
      }));
      return {
        ...acc,
        [knowledgeArea.title]: skills,
      };
    }, {});
  const staticSkillCategoryTitleShortNameMap =
    standardizedCompetenciesRaw.knowledgeAreas.reduce((acc, knowledgeArea) => {
      return {
        ...acc,
        [knowledgeArea.title]: knowledgeArea.shortTitle,
      };
    }, {} as Record<string, string>);

  return {
    staticSkillCategorySkillMap,
    staticSkillCategoryTitleShortNameMap,
  };
};

const getStandardizedCompetencies = cache(() =>
  processStandardizedCompetencies(standardizedCompetencies)
);

const bloomLevelLabel: Record<BloomLevel, string> = {
  CREATE: "Create",
  EVALUATE: "Evaluate",
  ANALYZE: "Analyze",
  APPLY: "Apply",
  REMEMBER: "Remember",
  UNDERSTAND: "Understand",
  "%future added value": "Unknown",
};

export type ItemData = {
  associatedBloomLevels: BloomLevel[];
  associatedSkills: SkillInput[];
  id?: string;
};
export type Skill = {
  skillName: string;
  id?: string | null;
  skillCategory: string;
  isCustomSkill?: boolean | null;
};
type SkillCategoryInAutocomplete = {
  category: string;
  isCustomSkillCategory: boolean | null;
  toBeAdded: boolean;
};
type SkillInAutocomplete = {
  skillName: string;
  isCustomSkill: boolean | null;
  toBeAdded: boolean;
};

const filterOptionsSkillCategory =
  createFilterOptions<SkillCategoryInAutocomplete>({
    matchFrom: "start",
    trim: true,
  });
const filterOptionsSkill = createFilterOptions<SkillInAutocomplete>({
  matchFrom: "start",
  trim: true,
});

export function ItemFormSection({
  onChange,
  item,
  courseId,
}: {
  onChange: (item: ItemData | null, newSkillAdded?: boolean) => void;
  item: ItemData;
  courseId: string;
}) {
  const {
    staticSkillCategorySkillMap: SKILL_CATALOGUE,
    staticSkillCategoryTitleShortNameMap: SKILL_CATEGORY_ABBREVIATION,
  } = getStandardizedCompetencies();

  const [bloomLevels, setBloomLevels] = useState<BloomLevel[]>(
    item?.associatedBloomLevels ?? []
  );
  const [skillsSelected, setSkillsSelected] = useState<Skill[]>(
    item.associatedSkills
  );
  console.log("skillsSelected", skillsSelected);
  const [itemId] = useState(item?.id);

  const currentItemBloomAndSkillPresent =
    bloomLevels.length > 0 && skillsSelected.length > 0;

  const [skillNewAdded, setSkillNewAdded] = useState(false);
  const { coursesByIds } = useLazyLoadQuery<ItemFormSectionCourseSkillsQuery>(
    graphql`
      query ItemFormSectionCourseSkillsQuery($id: UUID!) {
        coursesByIds(ids: [$id]) {
          id
          skills {
            id
            skillName
            skillCategory
            isCustomSkill
          }
        }
      }
    `,
    { id: courseId }
  );

  const [availableSkills, setAvailableSkills] = useState(
    coursesByIds[0].skills
  );

  const [newSkill, setNewSkill] = useState<SkillInAutocomplete[]>([]);
  const [newSkillCategory, setNewSkillCategory] =
    useState<SkillCategoryInAutocomplete | null>(null);

  // const addNewSkillToSelected = useCallback(() => {
  //   if (!(newSkill[0] && newSkill[1])) return;

  //   const alreadySelected = skillsSelected.some(
  //     (skill) => skill[0] === newSkill[0] && skill[1] === newSkill[1]
  //   );
  //   if (alreadySelected) alert("Skill already selected");
  //   else {
  //     setSkillsSelected((prev) => [...prev, newSkill]);
  //     setSkillNewAdded(true);
  //   }
  // }, [newSkill, skillsSelected]);

  useEffect(() => {
    onChange(
      currentItemBloomAndSkillPresent
        ? {
            id: itemId,
            associatedBloomLevels: bloomLevels,
            associatedSkills: skillsSelected,
          }
        : null,
      skillNewAdded
    );
  }, [
    bloomLevels,
    currentItemBloomAndSkillPresent,
    itemId,
    onChange,
    skillNewAdded,
    skillsSelected,
  ]);

  const seenCategories = new Set();

  return (
    <FormSection title="Item Information">
      <FormControl variant="outlined">
        <InputLabel htmlFor="assessmentBloomLevelsInput">
          Levels of Blooms Taxonomy
        </InputLabel>

        <Select
          className="min-w-[16rem] "
          label="Bloom Level"
          labelId="assessmentBloomLevelsLabel"
          value={bloomLevels ?? []}
          onChange={({ target: { value } }) =>
            setBloomLevels(
              (typeof value === "string"
                ? value.split(",")
                : value) as BloomLevel[]
            )
          }
          renderValue={(selected) =>
            selected.map((x) => bloomLevelLabel[x]).join(", ")
          }
          inputProps={{ id: "assessmentBloomLevelsInput" }}
          required
          multiple
        >
          {(
            [
              "REMEMBER",
              "UNDERSTAND",
              "APPLY",
              "ANALYZE",
              "EVALUATE",
              "CREATE",
            ] as const
          ).map((val, i) => (
            <MenuItem value={val} key={i}>
              <Checkbox checked={(bloomLevels ?? []).indexOf(val) > -1} />

              <ListItemText>{bloomLevelLabel[val]}</ListItemText>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
            label={skill.skillCategory + ": " + skill.skillName}
            onDelete={() =>
              setSkillsSelected((prev) => {
                const newSkills = [...prev];
                newSkills.splice(i, 1);
                return newSkills;
              })
            }
          />
        ))}
      </Stack>

      <Stack direction="row" spacing="1rem" display="flex" flex="1">
        <Autocomplete
          // TODO introduce proper sorting of skills after usage in course + refactor
          isOptionEqualToValue={(option, value) =>
            option.category === value.category
          }
          options={[
            ...Object.keys(SKILL_CATALOGUE).map((category) => ({
              category,
              isCustomSkillCategory: true,
              toBeAdded: false,
            })),
            ...availableSkills
              .filter((skill) => !SKILL_CATALOGUE[skill.skillCategory])
              .filter((skill) => {
                if (seenCategories.has(skill.skillCategory)) {
                  return false;
                } else {
                  seenCategories.add(skill.skillCategory);
                  return true;
                }
              })
              .map((skill) => ({
                category: skill.skillCategory,
                isCustomSkillCategory: skill.isCustomSkill,
                toBeAdded: false,
              })),
          ]}
          getOptionLabel={(option) => option.category}
          onChange={(_, newValue) =>
            // if a new skill category is selected, reset the skill since one skill shouldn't be present in multiple categories
            setNewSkillCategory((prev) => {
              if (newValue?.category !== prev?.category) setNewSkill([]);
              return newValue;
            })
          }
          renderInput={(params) => (
            <TextField {...params} label="Knowledge Area" />
          )}
          sx={{ width: 300 }}
          filterOptions={(options, params) => {
            const filtered = filterOptionsSkillCategory(options, params);
            if (params.inputValue !== "" && filtered.length === 0) {
              filtered.push({
                category: params.inputValue,
                isCustomSkillCategory: true,
                toBeAdded: true,
              });
            }
            return filtered;
          }}
          renderOption={(props, option) => {
            // api bug
            const { key, ...optionProps } =
              props as React.HTMLAttributes<HTMLLIElement> & { key: string };
            return (
              <Box key={key} {...optionProps} component="li">
                {option.toBeAdded && "Add: "}
                {option.category}
                {!option.isCustomSkillCategory && " (Custom)"}
              </Box>
            );
          }}
        />

        <Autocomplete
          // key={key}
          disabled={!newSkillCategory?.category}
          multiple
          value={newSkill}
          onChange={(_, newValue) => {
            setNewSkill([]);
            // setKey((prev) => prev + 1);
            setSkillsSelected((prev) => {
              if (!newValue) return prev;

              const newSkills = [...prev];
              newSkills.push(
                ...newValue
                  .filter(
                    (skill) =>
                      !skillsSelected.some(
                        (s) =>
                          s.skillName === skill.skillName &&
                          s.skillCategory === newSkillCategory!.category
                      )
                  )
                  .map((skill) => ({
                    skillName: skill.skillName,
                    skillCategory: newSkillCategory?.category ?? "",
                    isCustomSkill: skill.isCustomSkill,
                  }))
              );
              setSkillNewAdded(newSkills.length > prev.length);
              return newSkills;
            });
          }}
          isOptionEqualToValue={(option, value) =>
            option.skillName === value.skillName
          }
          options={
            !newSkillCategory?.category
              ? []
              : [
                  ...(SKILL_CATALOGUE[newSkillCategory.category]
                    ? SKILL_CATALOGUE[newSkillCategory.category].map(
                        (skill) => ({
                          skillName: skill.skillName,
                          isCustomSkill: false,
                          toBeAdded: false,
                        })
                      )
                    : []),
                  ...availableSkills
                    .filter(
                      (skill) =>
                        skill.skillCategory === newSkillCategory.category &&
                        (newSkillCategory.isCustomSkillCategory ||
                          skill.isCustomSkill)
                    )
                    .map((skill) => ({
                      skillName: skill.skillName,
                      isCustomSkill: true,
                      toBeAdded: false,
                    })),
                ]
          }
          sx={{ width: 300 }}
          getOptionLabel={(option) => option.skillName ?? ""}
          renderInput={(params) => <TextField {...params} label="Skill" />}
          renderTags={() => null}
          getOptionDisabled={(value) =>
            skillsSelected.some(
              (skill) =>
                skill.skillCategory === newSkillCategory?.category &&
                value.skillName === skill.skillName
            )
          }
          filterOptions={(options, params) => {
            const filtered = filterOptionsSkill(options, params);

            const inputValueExists = options.some(
              (option) => option.skillName.toLowerCase() === params.inputValue.toLowerCase()
            );

            if (params.inputValue !== "" && !inputValueExists) {
              filtered.push({
                skillName: params.inputValue,
                isCustomSkill: true,
                toBeAdded: true,
              });
            }
            return filtered;
          }}
          renderOption={(props, option) => {
            // api bug
            const { key, ...optionProps } =
              props as React.HTMLAttributes<HTMLLIElement> & { key: string };
            return (
              <Box key={key} {...optionProps} component="li">
                {option.toBeAdded && "Add: "}
                {option.skillName}
                {!option.isCustomSkill && " (Custom)"}
              </Box>
            );
          }}
        />
      </Stack>
    </FormSection>
  );
}
