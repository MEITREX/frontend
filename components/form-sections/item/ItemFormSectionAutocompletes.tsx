import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { allSkillQuery } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import {
  Autocomplete,
  Box,
  Chip,
  createFilterOptions,
  Stack,
  TextField,
} from "@mui/material";
import { Record as RecordIm, Set as SetIm } from "immutable";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { PreloadedQuery, useFragment, usePreloadedQuery } from "react-relay";
import {
  CreateItem,
  CreateItemSkill,
  Item,
  itemFormSectionFragment,
  ItemSkill,
} from "./ItemFormSectionNew";
import { MappedSkillType } from "./standardizedCompentencies";

type SkillCategoryInAutocomplete = (
  | Pick<ItemSkill, "skillCategory" | "id">
  | Pick<CreateItemSkill, "skillCategory">
) & {
  isCustomSkillCategory: boolean;
  toBeAdded?: boolean;
};
type SkillInAutocomplete = (
  | Pick<ItemSkill, "skillName" | "isCustomSkill" | "id">
  | Pick<CreateItemSkill, "skillName" | "isCustomSkill">
) & {
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

// used for simple structural comparison between objects for sorting
const SkillCategoryRecord = RecordIm<SkillCategoryInAutocomplete>({
  skillCategory: "",
  isCustomSkillCategory: false,
});

interface Props {
  skillsSelected: (CreateItemSkill | ItemSkill)[];
  setItem: Dispatch<SetStateAction<CreateItem | Item>>;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery>;
  SKILL_CATALOGUE: Record<string, MappedSkillType[]>;
}

const ItemFormSectionAutocompletes = ({
  skillsSelected,
  setItem,
  allSkillsQueryRef,
  SKILL_CATALOGUE,
}: Props) => {
  const { coursesByIds } = usePreloadedQuery(allSkillQuery, allSkillsQueryRef);
  const { skills: skillsAvailable } = useFragment(
    itemFormSectionFragment,
    coursesByIds[0]
  ) as { skills: ItemSkill[] };

  const [newSkillCategory, setNewSkillCategory] = useState<Omit<
    SkillCategoryInAutocomplete,
    "toBeAdded"
  > | null>(null);
  const [newSkill, setNewSkill] = useState<
    Omit<SkillInAutocomplete, "toBeAdded">[]
  >([]);

  const { allSkillCategoriesSorted, allSkillCategoriesUsed } = useMemo(() => {
    // selected skills take precedence in sorting over ones available in the course
    const occurrenceReducer = (
      acc: Map<string, number>,
      skill: ItemSkill | CreateItemSkill
    ) => {
      const currentOccurrence = acc.get(skill.skillCategory) ?? 0;
      return acc.set(skill.skillCategory, currentOccurrence + 1);
    };
    const occurrencesSelected = skillsSelected.reduce(
      occurrenceReducer,
      new Map<string, number>()
    );
    const occurrencesAvailable = skillsAvailable.reduce(
      occurrenceReducer,
      new Map<string, number>()
    );

    // using immutable records to easily enable structural comparison between objects
    const allCategoriesSorted = [
      ...SetIm([
        ...skillsSelected.map(
          (s) =>
            new SkillCategoryRecord({
              skillCategory: s.skillCategory,
              isCustomSkillCategory: !SKILL_CATALOGUE[s.skillCategory],
            })
        ),
        ...skillsAvailable.map(
          (s) =>
            new SkillCategoryRecord({
              skillCategory: s.skillCategory,
              isCustomSkillCategory: !SKILL_CATALOGUE[s.skillCategory],
            })
        ),
      ]),
    ];

    // sorting with precedence by leveraging occurrences
    allCategoriesSorted.sort((a, b) => {
      const aOccSelected = occurrencesSelected.get(a.skillCategory);
      const bOccSelected = occurrencesSelected.get(b.skillCategory);
      if (!aOccSelected && bOccSelected) return -1;
      else if (aOccSelected && !bOccSelected) return 1;
      else if (aOccSelected && bOccSelected)
        return bOccSelected !== aOccSelected
          ? bOccSelected - aOccSelected
          : a.skillCategory.localeCompare(b.skillCategory);

      const aOccAvailable = occurrencesAvailable.get(a.skillCategory);
      const bOccAvailable = occurrencesAvailable.get(b.skillCategory);
      if (!aOccAvailable && bOccAvailable) return -1;
      else if (aOccAvailable && !bOccAvailable) return 1;
      else if (aOccAvailable && bOccAvailable)
        return aOccAvailable !== bOccAvailable
          ? bOccAvailable - aOccAvailable
          : a.skillCategory.localeCompare(b.skillCategory);
      else return a.skillCategory.localeCompare(b.skillCategory);
    });

    // IEEE skill categories that are not used in course or selected sorted alphabetically to be appended after used ones
    const skillCategoriesIEEESansAvailable = Object.keys(SKILL_CATALOGUE)
      .filter((category) => !occurrencesSelected.has(category))
      .map((category) => ({
        skillCategory: category,
        isCustomSkillCategory: false,
      }))
      .toSorted((a, b) => a.skillCategory.localeCompare(b.skillCategory));

    // used to show badge in Autocomplete list
    const usedSkillCategoryCount = new Set([
      ...occurrencesSelected.keys(),
      ...occurrencesAvailable.keys(),
    ]).size;
    return {
      allSkillCategoriesSorted: [
        ...allCategoriesSorted.map((category) => category.toJS()),
        ...skillCategoriesIEEESansAvailable,
      ],
      allSkillCategoriesUsed: usedSkillCategoryCount,
    };
  }, [SKILL_CATALOGUE, skillsAvailable, skillsSelected]);

  // TODO can this be simplified?
  const currentSkillsAvailableSorted = useMemo(() => {
    if (!newSkillCategory?.skillCategory) return [];

    // sort already skills to be placed to the bottom of the Autocomplete list
    const skillAlreadySelected = skillsSelected.reduce((acc, skill) => {
      return acc.set(skill.skillName, true);
    }, new Map<string, boolean>());
    const skillOccurrencesAvailable = skillsAvailable.reduce((acc, skill) => {
      const currentOccurrence = acc.get(skill.skillName) ?? 0;
      return acc.set(skill.skillName, currentOccurrence + 1);
    }, new Map<string, number>());

    // TODO can this be simplified?
    const isCustomSkill = (skill: ItemSkill | CreateItemSkill) =>
      skill.skillCategory === newSkillCategory.skillCategory &&
      (newSkillCategory.isCustomSkillCategory || skill.isCustomSkill);

    const SkillRecord = RecordIm<SkillInAutocomplete>({
      skillName: "",
      isCustomSkill: false,
    });
    const mapSkillToImmutableRecord = (skill: ItemSkill | CreateItemSkill) =>
      new SkillRecord({
        skillName: skill.skillName,
        isCustomSkill: skill.isCustomSkill,
      });
    let allSkillsCurrentlyAvailableSorted = [
      ...SetIm([
        ...skillsAvailable.filter(isCustomSkill).map(mapSkillToImmutableRecord),
        ...skillsSelected.filter(isCustomSkill).map(mapSkillToImmutableRecord),
      ]),
    ];

    const isIEEESkill = !!SKILL_CATALOGUE[newSkillCategory.skillCategory];
    if (isIEEESkill) {
      allSkillsCurrentlyAvailableSorted = [
        ...SetIm([
          ...allSkillsCurrentlyAvailableSorted,
          ...SKILL_CATALOGUE[newSkillCategory.skillCategory].map(
            (skill) =>
              new SkillRecord({
                skillName: skill.skillName,
                isCustomSkill: false,
              })
          ),
        ]),
      ];
    }

    allSkillsCurrentlyAvailableSorted.sort((a, b) => {
      const aOccSelected = skillAlreadySelected.get(a.skillName);
      const bOccSelected = skillAlreadySelected.get(b.skillName);
      // place selected skills to the bottom
      if (aOccSelected === undefined && bOccSelected) return -1;
      else if (aOccSelected && bOccSelected === undefined) return 1;
      else if (aOccSelected && bOccSelected)
        return a.skillName.localeCompare(b.skillName);

      // if not selected and available in the course, place to the top
      const aOccAvailable = skillOccurrencesAvailable.get(a.skillName);
      const bOccAvailable = skillOccurrencesAvailable.get(b.skillName);
      if (!aOccAvailable && bOccAvailable) return -1;
      else if (aOccAvailable && !bOccAvailable) return 1;
      else if (aOccAvailable && bOccAvailable)
        return aOccAvailable !== bOccAvailable
          ? bOccAvailable - aOccAvailable
          : a.skillName.localeCompare(b.skillName);
      else return a.skillName.localeCompare(b.skillName);
    });

    return allSkillsCurrentlyAvailableSorted;
  }, [SKILL_CATALOGUE, skillsAvailable, newSkillCategory, skillsSelected]);

  return (
    <Stack className="flex flex-row gap-x-2 mb-8">
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
          // TODO this doesn't work, key is duplicated sometimes
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
                {option.isCustomSkillCategory && (
                  <Chip
                    label="Custom"
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              {/* add ruler after use categories */}
              {index === allSkillCategoriesUsed - 1 && (
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

          setItem((prev) => {
            // TODO is this necessary?
            if (!newValue) return prev;

            const newSkills = [...prev.associatedSkills];
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
            return { ...prev, associatedSkills: newSkills };
          });
        }}
        isOptionEqualToValue={(option, value) =>
          option.skillName === value.skillName
        }
        options={currentSkillsAvailableSorted}
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
              option.skillName.toLowerCase() === params.inputValue.toLowerCase()
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
              {option.isCustomSkill && (
                <Chip
                  label="Custom"
                  variant="outlined"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          );
        }}
      />
    </Stack>
  );
};

export default ItemFormSectionAutocompletes;
