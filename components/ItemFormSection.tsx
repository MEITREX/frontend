import {
  BloomLevel,
  SkillInput,
} from "@/__generated__/AddFlashcardSetModalMutation.graphql";
import { ItemFormSectionCourseSkillsQuery } from "@/__generated__/ItemFormSectionCourseSkillsQuery.graphql";
import { Add } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { FormSection } from "./Form";

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

export function ItemFormSection({
  onChange,
  item,
  courseId,
}: {
  onChange: (item: ItemData | null, newSkillAdded?: boolean) => void;
  item: ItemData;
  courseId: string;
}) {
  const [bloomLevels, setBloomLevels] = useState<BloomLevel[]>(
    item?.associatedBloomLevels ?? []
  );
  const [skillsSelected, setSkillsSelected] = useState<Set<Skill>>(new Set());
  const [itemId] = useState(item?.id);

  const currentItemBloomAndSkillPresent =
    bloomLevels.length > 0 && skillsSelected.size > 0;

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

  const [newSkillName, setNewSkillName] = useState(""); // new state variable for the new skill
  const [newSkillCategory, setNewSkillCategory] = useState("");

  const addSkillToAvailableSkills = useCallback(() => {
    if (!newSkillName) return;

    const isAlreadyAvailable = availableSkills.some(
      (skill) => skill.skillName === newSkillName
    );
    if (!isAlreadyAvailable) {
      setAvailableSkills([
        ...availableSkills,
        {
          skillName: newSkillName,
          id: "",
          skillCategory: newSkillCategory,
          isCustomSkill: true,
        },
      ]);
      setNewSkillName("");
      setNewSkillCategory("");
      setSkillNewAdded(true);
    } else {
      alert("The skill is already available!");
    }
  }, [availableSkills, newSkillName]);

  useEffect(() => {
    onChange(
      currentItemBloomAndSkillPresent
        ? {
            id: itemId,
            associatedBloomLevels: bloomLevels,
            associatedSkills: [...skillsSelected],
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

  function inSelectedSkills(option: string): boolean {
    return Array.from(skillsSelected).some(
      (skill) => skill.skillName === option
    );
  }

  function uniqueCategories(): string[] {
    const uniqueCategories = availableSkills.map(
      (skill) => skill.skillCategory
    );
    return Array.from(new Set(uniqueCategories));
  }

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

      <InputLabel htmlFor="">Associated Skills:</InputLabel>
      <Stack direction="row" spacing={1} sx={{ marginBottom: 1 }}>
        {[...skillsSelected].map((selectedSkill: Skill) => (
          <Chip
            key={selectedSkill.skillName}
            label={selectedSkill.skillName}
            onDelete={() =>
              setSkillsSelected((prev) => {
                prev.delete(selectedSkill);
                return new Set(prev);
              })
            }
          />
        ))}
      </Stack>

      <Stack direction={"row"} spacing={1}>
        <Autocomplete
          options={uniqueCategories()}
          sx={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} label="Knowledge Area" />
          )}
        />
        <Autocomplete
          options={availableSkills.map((skill) => skill.skillName)}
          sx={{ width: 300 }}
          multiple
          value={Array.from(skillsSelected).map((skill) => skill.skillName)}
          onChange={(event, newValue) => {
            setSkillsSelected(
              new Set(
                availableSkills.filter((skill) =>
                  newValue.includes(skill.skillName)
                )
              )
            );
          }}
          renderTags={() => null}
          renderInput={(params) => <TextField {...params} label="Skill" />}
          getOptionDisabled={(option) => inSelectedSkills(option)}
        />
      </Stack>

      <FormSection title="">
        <Button
          variant="contained"
          onClick={addSkillToAvailableSkills}
          startIcon={<Add />}
          sx={{ marginBottom: 1 }}
        >
          Add Skill
        </Button>
        <Stack direction={"row"} spacing={1}>
          <TextField
            label="New Knowledge Area"
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
          />
          <TextField
            label="New Skill"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
          />
        </Stack>
        <p />
      </FormSection>
    </FormSection>
  );
}
