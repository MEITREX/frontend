import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { AllSkillQuery } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import {
  Autocomplete,
  Box,
  Chip,
  createFilterOptions,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Record as RecordIm, Set as SetIm } from "immutable";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { PreloadedQuery, useFragment, usePreloadedQuery } from "react-relay";
import InfoPopover from "./InfoPopover";
import {
  CreateItem,
  CreateItemSkill,
  Item,
  itemFormSectionFragment,
  ItemSkill,
} from "./ItemFormSection";
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
type SkillAndCategoryInAutocomplete = (ItemSkill | CreateItemSkill) & {
  toBeAdded?: boolean;
};

// redundant due to typing error when using |
const filterOptionsSkillCategory =
  createFilterOptions<SkillCategoryInAutocomplete>({
    matchFrom: "start",
    trim: true,
  });
const filterOptionsSkill = createFilterOptions<SkillInAutocomplete>({
  matchFrom: "start",
  trim: true,
});
const filterOptionsSkillAndCategory =
  createFilterOptions<SkillAndCategoryInAutocomplete>({
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
  SKILL_CATEGORY_ABBREVIATION: Record<string, string>;
  stackDirection?: "row" | "column";
  required?: boolean;
}

const ItemFormSectionAutocompletes = ({
  skillsSelected,
  setItem,
  allSkillsQueryRef,
  SKILL_CATALOGUE,
  SKILL_CATEGORY_ABBREVIATION,
  stackDirection = "row",
  required,
}: Props) => {
  const { coursesByIds } = usePreloadedQuery(AllSkillQuery, allSkillsQueryRef);
  // FIXME: after waiting some time, this turns undefined?!
  const { skills: skillsAvailable } = useFragment(
    itemFormSectionFragment,
    coursesByIds[0]
  ) as { skills: ItemSkill[] | undefined };

  const [newSkillCategory, setNewSkillCategory] = useState<Omit<
    SkillCategoryInAutocomplete,
    "toBeAdded"
  > | null>(null);
  const [newSkill, setNewSkill] = useState<
    Omit<SkillInAutocomplete, "toBeAdded">[]
  >([]);

  const searchInAllCategories = !newSkillCategory?.skillCategory;
  const [newSkillAndCategory, setNewSkillAndCategory] = useState<
    Omit<SkillAndCategoryInAutocomplete, "toBeAdded">[]
  >([]);

  const isSkillAlreadySelected = useCallback(
    <T extends SkillInAutocomplete | SkillAndCategoryInAutocomplete>(
      skill: T
    ): boolean => {
      return skillsSelected.some((selectedSkill) =>
        "skillCategory" in skill
          ? selectedSkill.skillName === skill.skillName &&
            selectedSkill.skillCategory === skill.skillCategory
          : selectedSkill.skillName === skill.skillName &&
            selectedSkill.skillCategory === newSkillCategory?.skillCategory
      );
    },
    [newSkillCategory?.skillCategory, skillsSelected]
  );

  const { allSkillCategoriesSorted, allSkillCategoriesUsed } = useMemo(() => {
    // selected skills take precedence in sorting over ones available in course
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
    const occurrencesAvailable = (skillsAvailable || []).reduce(
      occurrenceReducer,
      new Map<string, number>()
    );

    // using immutable records to easily enable structural comparison
    const allCategoriesSorted = [
      ...SetIm([
        ...skillsSelected.map(
          (s) =>
            new SkillCategoryRecord({
              skillCategory: s.skillCategory,
              isCustomSkillCategory: !SKILL_CATALOGUE[s.skillCategory],
            })
        ),
        ...(skillsAvailable || []).map(
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

    // IEEE skill categories that are not used in course or selected sorted
    // alphabetically to be appended after used ones
    const skillCategoriesIEEESansAvailable = Object.keys(SKILL_CATALOGUE)
      .filter((category) => !occurrencesSelected.has(category))
      .map((category) => ({
        skillCategory: category,
        isCustomSkillCategory: false,
      }))
      .sort((a, b) => a.skillCategory.localeCompare(b.skillCategory));

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

  const currentSkillsAvailableSorted = useMemo(() => {
    // don't do filtering for second autocomplete when it's disabled
    if (!newSkillCategory?.skillCategory) return [];

    // enable easy structural comparison between objects
    const SkillRecord = RecordIm<SkillInAutocomplete>({
      skillName: "",
      isCustomSkill: false,
    });
    const mapSkillToImmutableRecord = (skill: ItemSkill | CreateItemSkill) =>
      new SkillRecord({
        skillName: skill.skillName,
        isCustomSkill: skill.isCustomSkill,
      });

    let skillsSelectable = SetIm<SkillInAutocomplete>();
    const skillsAvailableInCurrentCategoryFromCourse = (skillsAvailable || [])
      .filter((skill) => skill.skillCategory === newSkillCategory.skillCategory)
      .map(mapSkillToImmutableRecord);
    const skillsAvailableInCurrentCategory = skillsSelected
      .filter((skill) => skill.skillCategory === newSkillCategory.skillCategory)
      .map(mapSkillToImmutableRecord);

    skillsSelectable = skillsSelectable.union(
      skillsAvailableInCurrentCategoryFromCourse,
      skillsAvailableInCurrentCategory
    );

    const isCurrentCategoryIEEE =
      !!SKILL_CATALOGUE[newSkillCategory.skillCategory];
    if (isCurrentCategoryIEEE) {
      const skillsIEEE = SKILL_CATALOGUE[newSkillCategory.skillCategory];
      skillsSelectable = skillsSelectable.union(
        skillsIEEE.map(
          (skill) =>
            new SkillRecord({
              skillName: skill.skillName,
              isCustomSkill: false,
            })
        )
      );
    }

    // sort already selected skills to the bottom of the Autocomplete list
    const skillSelected = skillsSelected.reduce((acc, skill) => {
      return acc.set(skill.skillName, true);
    }, new Map<string, boolean>());
    return skillsSelectable
      .toArray()
      .sort((a, b) =>
        skillSelected.has(a.skillName)
          ? 1
          : skillSelected.has(b.skillName)
          ? -1
          : a.skillName.localeCompare(b.skillName)
      );
  }, [SKILL_CATALOGUE, newSkillCategory, skillsAvailable, skillsSelected]);

  // caching the flattened skill catalogue for performance
  const skillCatalogueFlattened = useMemo(() => {
    const SkillRecord = RecordIm<SkillAndCategoryInAutocomplete>({
      skillName: "",
      skillCategory: "",
      isCustomSkill: false,
    });

    return Object.entries(SKILL_CATALOGUE).flatMap(([category, skills]) =>
      skills.map(
        (skill) =>
          new SkillRecord({
            skillName: skill.skillName,
            skillCategory: category,
            isCustomSkill: false,
          })
      )
    );
  }, [SKILL_CATALOGUE]);

  const skillsAndCategoriesAvailableSorted = useMemo(() => {
    if (!searchInAllCategories) return [];

    // enable easy structural comparison between objects
    const SkillRecord = RecordIm<SkillAndCategoryInAutocomplete>({
      skillName: "",
      skillCategory: "",
      isCustomSkill: false,
    });
    const mapToImmutableRecord = (skill: ItemSkill | CreateItemSkill) =>
      new SkillRecord({
        skillName: skill.skillName,
        skillCategory: skill.skillCategory,
        isCustomSkill: skill.isCustomSkill,
      });

    let skillsSelectable = SetIm<SkillAndCategoryInAutocomplete>();
    skillsSelectable = skillsSelectable.union(
      (skillsAvailable || []).map(mapToImmutableRecord),
      skillsSelected.map(mapToImmutableRecord),
      skillCatalogueFlattened
    );

    const skillSelected = skillsSelected.reduce((acc, skill) => {
      return acc.set(skill.skillName, true);
    }, new Map<string, boolean>());
    return skillsSelectable.toArray().sort((a, b) => {
      const isASelected = skillSelected.has(a.skillName);
      const isBSelected = skillSelected.has(b.skillName);

      if (isASelected && !isBSelected) return 1;
      else if (!isASelected && isBSelected) return -1;
      else {
        return (
          a.skillName.localeCompare(b.skillName) ||
          a.skillCategory.localeCompare(b.skillCategory)
        );
      }
    });
  }, [
    searchInAllCategories,
    skillCatalogueFlattened,
    skillsAvailable,
    skillsSelected,
  ]);

  // used for conditionally rendering the ruler of skill categories used in the
  // course in Autocomplete
  const [isCategoryInputEmpty, setIsCategoryInputEmpty] =
    useState<boolean>(true);
  const handleInputChange = (
    event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    if (newInputValue.trim() === "") {
      setIsCategoryInputEmpty(true);
    } else {
      setIsCategoryInputEmpty(false);
    }
  };

  const popupRefSkills = useRef<HTMLButtonElement>(null);
  const popupRefKnowledgeArea = useRef<HTMLButtonElement>(null);
  const [isInfoPopupSkillsVisible, setIsInfoPopupSkillsVisible] =
    useState(false);
  const [isInfoPopupKnowledgeAreaVisible, setInfoPopupIsKnowledgeAreaVisible] =
    useState(false);

  return (
    <Stack direction={stackDirection} spacing={1}>
      <Stack direction="row" spacing={2}>
        <Autocomplete
          disabled={allSkillCategoriesSorted.length === 0}
          fullWidth
          isOptionEqualToValue={(option, value) =>
            option.skillCategory === value.skillCategory
          }
          options={allSkillCategoriesSorted}
          onInputChange={handleInputChange}
          getOptionLabel={(option) => option.skillCategory}
          onChange={(_, newValue) =>
            // if a new skill category is selected, reset the skill since one
            // skill shouldn't be present in multiple categories
            setNewSkillCategory((prev) => {
              if (newValue && newValue.skillCategory !== prev?.skillCategory)
                setNewSkill([]);
              return newValue;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={`Knowledge Area${required ? " *" : ""}`}
            />
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
              <Fragment key={`${index}-${key}`}>
                <Box {...optionProps} component="li">
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
                {/* add ruler after used categories */}
                {isCategoryInputEmpty &&
                  index === allSkillCategoriesUsed - 1 && (
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
              </Fragment>
            );
          }}
        />

        <InfoPopover>
          <Typography variant="body1">
            Knowledge Areas are based on the IEEE Standardized Competencies to
            propose groupings for skills of the Computer Science filed. <br />
            You can create custom Knowledge Areas yourself, if you find the
            standardized ones not suitable.
          </Typography>
        </InfoPopover>
      </Stack>

      <Stack direction="row" spacing={2}>
        {!searchInAllCategories ? (
          <Autocomplete
            fullWidth
            disabled={searchInAllCategories}
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
            renderInput={(params) => <TextField {...params} label="Skills" />}
            renderTags={() => null}
            getOptionDisabled={isSkillAlreadySelected<SkillInAutocomplete>}
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
        ) : (
          <Autocomplete
            fullWidth
            disabled={
              !searchInAllCategories ||
              skillsAndCategoriesAvailableSorted.length === 0
            }
            multiple
            sx={{ width: 300 }}
            value={newSkillAndCategory}
            // render stuff
            renderInput={(params) => (
              <TextField
                {...params}
                label={`All Skills${required ? " *" : ""}`}
              />
            )}
            renderTags={() => null}
            // data stuff
            options={skillsAndCategoriesAvailableSorted}
            getOptionDisabled={
              isSkillAlreadySelected<SkillAndCategoryInAutocomplete>
            }
            getOptionLabel={(option) =>
              // avoids duplication of option labels; return of this function is
              // used for comparison in `filterOptions`
              `${option.skillName} [${option.skillCategory}]`
            }
            filterOptions={(options, inputState) => {
              const filtered = filterOptionsSkillAndCategory(
                options,
                inputState
              );
              const inputValueExists = options.some(
                (option) =>
                  option.skillName.toLowerCase() ===
                  inputState.inputValue.toLowerCase()
              );

              if (inputState.inputValue !== "" && !inputValueExists) {
                return [
                  {
                    skillCategory: "Custom",
                    skillName: inputState.inputValue,
                    isCustomSkill: true,
                    toBeAdded: true,
                  },
                  ...filtered,
                ];
              } else return filtered;
            }}
            onChange={(_, newValues) => {
              if (!newValues || !Array.isArray(newValues)) return;

              setItem((prev) => {
                const notPresentInItemsSkills = newValues.find(
                  (newSkill) =>
                    !prev.associatedSkills.some(
                      (s) =>
                        s.skillName === newSkill.skillName &&
                        s.skillCategory === newSkill.skillCategory
                    )
                );
                if (!notPresentInItemsSkills) return prev;

                const newItemSkills = [...prev.associatedSkills];
                newItemSkills.push({
                  skillName: notPresentInItemsSkills.skillName,
                  skillCategory: notPresentInItemsSkills.skillCategory,
                  isCustomSkill: notPresentInItemsSkills.isCustomSkill,
                });

                return { ...prev, associatedSkills: newItemSkills };
              });
            }}
            // render data stuff
            renderOption={(props, option: SkillAndCategoryInAutocomplete) => {
              const { key, ...optionProps } =
                props as React.HTMLAttributes<HTMLLIElement> & {
                  key: string;
                } & Record<string, unknown>;

              return (
                <Box
                  key={key ?? option.skillName}
                  {...optionProps}
                  component="li"
                >
                  {option.toBeAdded && "Add: "}
                  {option.skillName}
                  <Chip
                    label={
                      SKILL_CATEGORY_ABBREVIATION[option.skillCategory!] ||
                      option.skillCategory
                    }
                    title={!option.isCustomSkill ? option.skillCategory : ""}
                    variant="outlined"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              );
            }}
          />
        )}

        <InfoPopover>
          {!searchInAllCategories ? (
            <Typography variant="body1">
              Search through the Skills of the selected Knowledge Area.
            </Typography>
          ) : (
            <Typography variant="body1">
              Search through the Skills grouped in any Knowledge Areas present
              in this course. If you add a new skill here, it will be added to
              the default Knowledge Area called &quot;<i>Custom</i>&quot;.
              <br /> For more control, use the dropdown on the left to create a
              new Knowledge Area and then add a Skill.
            </Typography>
          )}
        </InfoPopover>
      </Stack>
    </Stack>
  );
};

export default ItemFormSectionAutocompletes;
