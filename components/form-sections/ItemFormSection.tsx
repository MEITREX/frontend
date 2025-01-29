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
import { Record as RecordIm, Set as SetIm } from "immutable";
import { cache, useEffect, useMemo, useState } from "react";
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
  skillCategory: string;
  isCustomSkillCategory: boolean | null;
  toBeAdded?: boolean;
};
type SkillInAutocomplete = {
  skillName: string;
  isCustomSkill: boolean | null;
  toBeAdded?: boolean;
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

  const [bloomLevelsSelected, setBloomLevelsSelected] = useState<BloomLevel[]>(
    item?.associatedBloomLevels ?? []
  );
  const [skillsSelected, setSkillsSelected] = useState<Skill[]>(
    item.associatedSkills
  );
  const currentItemBloomAndSkillPresent =
    bloomLevelsSelected.length > 0 && skillsSelected.length > 0;

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
  const availableSkills = coursesByIds[0].skills;

  const [skillNewAdded, setSkillNewAdded] = useState(false);
  const [newSkillCategory, setNewSkillCategory] = useState<Omit<
    SkillCategoryInAutocomplete,
    "toBeAdded"
  > | null>(null);
  const [newSkill, setNewSkill] = useState<
    Omit<SkillInAutocomplete, "toBeAdded">[]
  >([]);

  useEffect(() => {
    onChange(
      currentItemBloomAndSkillPresent
        ? {
            id: item?.id,
            associatedBloomLevels: bloomLevelsSelected,
            associatedSkills: skillsSelected,
          }
        : null,
      skillNewAdded
    );
  }, [
    bloomLevelsSelected,
    currentItemBloomAndSkillPresent,
    item?.id,
    onChange,
    skillNewAdded,
    skillsSelected,
  ]);

  const { allSkillCategoriesSorted, amountOfUsedSkillCategories } =
    useMemo(() => {
      // selected skills take precedence in sorting over ones available in the course
      const categoryOccurrencesSelected = skillsSelected.reduce(
        (acc, skill) => {
          const currentOccurrence = acc.get(skill.skillCategory) ?? 0;
          return acc.set(skill.skillCategory, currentOccurrence + 1);
        },
        new Map<string, number>()
      );
      const categoryOccurrencesAvailable = availableSkills.reduce(
        (acc, skill) => {
          const currentOccurrence = acc.get(skill.skillCategory) ?? 0;
          return acc.set(skill.skillCategory, currentOccurrence + 1);
        },
        new Map<string, number>()
      );

      // if the skill category fetched/ fetched in parent component (=> not having isCustomSkill property)
      //   is not present in the catalogue, it's a custom skill category
      const validateCustomSkillCategory = (
        isCustomSkillProperty: boolean | null | undefined,
        skillCategory: string
      ): isCustomSkillProperty is boolean =>
        isCustomSkillProperty === undefined || isCustomSkillProperty === null
          ? !SKILL_CATALOGUE[skillCategory]
          : isCustomSkillProperty;

      // using immutable records to easily enable structural comparison between objects
      const SkillCategoryRecord = RecordIm<SkillCategoryInAutocomplete>({
        skillCategory: "",
        isCustomSkillCategory: false,
      });
      const allCategoriesSorted = [
        ...SetIm([
          ...skillsSelected.map(
            (s) =>
              new SkillCategoryRecord({
                skillCategory: s.skillCategory,
                isCustomSkillCategory: validateCustomSkillCategory(
                  s.isCustomSkill,
                  s.skillCategory
                ),
              })
          ),
          ...availableSkills.map(
            (s) =>
              new SkillCategoryRecord({
                skillCategory: s.skillCategory,
                isCustomSkillCategory: validateCustomSkillCategory(
                  s.isCustomSkill,
                  s.skillCategory
                ),
              })
          ),
        ]),
      ];

      // sorting with precedence by leveraging occurrences
      allCategoriesSorted.sort((a, b) => {
        const aOccSelected = categoryOccurrencesSelected.get(a.skillCategory);
        const bOccSelected = categoryOccurrencesSelected.get(b.skillCategory);
        if (!aOccSelected && bOccSelected) return -1;
        else if (aOccSelected && !bOccSelected) return 1;
        else if (aOccSelected && bOccSelected)
          return bOccSelected !== aOccSelected
            ? bOccSelected - aOccSelected
            : a.skillCategory.localeCompare(b.skillCategory);

        const aOccAvailable = categoryOccurrencesAvailable.get(a.skillCategory);
        const bOccAvailable = categoryOccurrencesAvailable.get(b.skillCategory);
        if (!aOccAvailable && bOccAvailable) return -1;
        else if (aOccAvailable && !bOccAvailable) return 1;
        else if (aOccAvailable && bOccAvailable)
          return aOccAvailable !== bOccAvailable
            ? bOccAvailable - aOccAvailable
            : a.skillCategory.localeCompare(b.skillCategory);
        else return a.skillCategory.localeCompare(b.skillCategory);
      });

      const skillCategoriesIEEESansAvailable = Object.keys(SKILL_CATALOGUE)
        .filter((category) => !categoryOccurrencesSelected.has(category))
        .map((category) => ({
          skillCategory: category,
          isCustomSkillCategory: false,
        }))
        .toSorted((a, b) => a.skillCategory.localeCompare(b.skillCategory));

      const elementsInOrderMaps = new Set([
        ...categoryOccurrencesSelected.keys(),
        ...categoryOccurrencesAvailable.keys(),
      ]).size;
      return {
        allSkillCategoriesSorted: [
          ...allCategoriesSorted.map((category) => category.toJS()),
          ...skillCategoriesIEEESansAvailable,
        ],
        amountOfUsedSkillCategories: elementsInOrderMaps,
      };
    }, [SKILL_CATALOGUE, availableSkills, skillsSelected]);

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
          value={bloomLevelsSelected ?? []}
          onChange={({ target: { value } }) =>
            setBloomLevelsSelected(
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
              <Checkbox
                checked={(bloomLevelsSelected ?? []).indexOf(val) > -1}
              />

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
            label={
              (SKILL_CATEGORY_ABBREVIATION[skill.skillCategory] ||
                skill.skillCategory) +
              ": " +
              skill.skillName
            }
            onDelete={() =>
              setSkillsSelected((prev) => {
                const newSelectedSkills = [...prev];
                newSelectedSkills.splice(i, 1);
                return newSelectedSkills;
              })
            }
          />
        ))}
      </Stack>

      <Stack direction="row" spacing="1rem" display="flex" flex="1">
        <Autocomplete
          fullWidth
          isOptionEqualToValue={(option, value) =>
            option.skillCategory === value.skillCategory
          }
          options={allSkillCategoriesSorted}
          getOptionLabel={(option) => option.skillCategory}
          onChange={(_, newValue) =>
            // if a new skill category is selected, reset the skill since one skill shouldn't be present in multiple categories
            setNewSkillCategory((prev) => {
              if (newValue && newValue.skillCategory !== prev?.skillCategory)
                setNewSkill([]);
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
                skillCategory: params.inputValue,
                isCustomSkillCategory: true,
                toBeAdded: true,
              });
            }
            return filtered;
          }}
          renderOption={(props, option: SkillCategoryInAutocomplete) => {
            // key prop is available in browser - api bug?
            const { key, ...optionProps } =
              props as React.HTMLAttributes<HTMLLIElement> & {
                key: string;
              } & Record<string, unknown>;
            // if this prop isn't present on all browsers (tested on FireFox), the ruler won't be displayed
            const index = optionProps["data-option-index"] as unknown as
              | number
              | undefined;

            return (
              <>
                <Box key={index ?? key} {...optionProps} component="li">
                  {option?.toBeAdded && "Add: "}
                  {option.skillCategory}
                  {option.isCustomSkillCategory && " (Custom)"}
                </Box>
                {/* add ruler after use categories */}
                {index === amountOfUsedSkillCategories - 1 && (
                  <>
                    <Box
                      key="used-in-course-label"
                      component="li"
                      sx={{
                        textAlign: "center",
                        color: "text.secondary",
                        fontSize: "14px",
                        margin: "0.5rem 0",
                      }}
                    >
                      Used in Course
                    </Box>
                    <Box
                      key="ruler"
                      component="li"
                      sx={{
                        height: "2px",
                        backgroundColor: "divider",
                        margin: "0.5rem 0",
                        width: "100%",
                      }}
                    />
                  </>
                )}
              </>
            );
          }}
        />

        <Autocomplete
          fullWidth
          // key={key}
          disabled={!newSkillCategory?.skillCategory}
          multiple
          value={newSkill}
          onChange={(_, newValue) => {
            setNewSkill([]);
            // setKey((prev) => prev + 1);
            setSkillsSelected((prev) => {
              // TODO is this necessary?
              if (!newValue) return prev;

              const newSkills = [...prev];
              // TODO check if array is always one element only?
              newSkills.push(
                ...newValue
                  .filter(
                    (skillFromNewVal) =>
                      !skillsSelected.some(
                        (s) =>
                          s.skillName === skillFromNewVal.skillName &&
                          s.skillCategory === newSkillCategory!.skillCategory
                      )
                  )
                  .map((skill) => ({
                    skillName: skill.skillName,
                    skillCategory: newSkillCategory!.skillCategory,
                    isCustomSkill: skill.isCustomSkill,
                  }))
              );
              // TODO FIXME this isn't <=> to the previous state
              setSkillNewAdded(newSkills.length > prev.length);
              return newSkills;
            });
          }}
          isOptionEqualToValue={(option, value) =>
            option.skillName === value.skillName
          }
          options={
            !newSkillCategory?.skillCategory
              ? []
              : [
                  ...(SKILL_CATALOGUE[newSkillCategory.skillCategory]
                    ? SKILL_CATALOGUE[newSkillCategory.skillCategory].map(
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
                        skill.skillCategory ===
                          newSkillCategory.skillCategory &&
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
                skill.skillCategory === newSkillCategory?.skillCategory &&
                value.skillName === skill.skillName
            )
          }
          filterOptions={(options, params) => {
            const filtered = filterOptionsSkill(options, params);

            const inputValueExists = options.some(
              (option) =>
                option.skillName.toLowerCase() ===
                params.inputValue.toLowerCase()
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
          renderOption={(props, option: SkillInAutocomplete) => {
            // api bug
            const { key, ...optionProps } =
              props as React.HTMLAttributes<HTMLLIElement> & { key: string };
            return (
              <Box key={key} {...optionProps} component="li">
                {option.toBeAdded && "Add: "}
                {option.skillName}
                {option.isCustomSkill && " (Custom)"}
              </Box>
            );
          }}
        />
      </Stack>
    </FormSection>
  );
}
