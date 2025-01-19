import {
  BloomLevel,
  SkillInput,
} from "@/__generated__/AddFlashcardSetModalMutation.graphql";
import { ItemFormSectionCourseSkillsQuery } from "@/__generated__/ItemFormSectionCourseSkillsQuery.graphql";
import { Add } from "@mui/icons-material";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
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
  const [skillsSelected, setSkillsSelected] = useState<Set<Skill>>(
    new Set(item?.associatedSkills)
  );
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
  const [newSkill, setNewSkill] = useState(""); // new state variable for the new skill

  const addSkillToAvailableSkills = useCallback(() => {
    if (!newSkill) return;

    const isAlreadyAvailable = availableSkills.some(
      (skill) => skill.skillName === newSkill
    );
    if (!isAlreadyAvailable) {
      setAvailableSkills([
        ...availableSkills,
        {
          skillName: newSkill,
          id: "",
          skillCategory: "test",
          isCustomSkill: null, // TODO
        },
      ]);
      setNewSkill("");
      setSkillNewAdded(true);
    } else {
      alert("The skill is already available!");
    }
  }, [availableSkills, newSkill]);

  function handleSkillChange(
    e: React.ChangeEvent<HTMLInputElement>,
    skill: Skill
  ) {
    if (e.target.checked) setSkillsSelected((prev) => new Set(prev).add(skill));
    else
      setSkillsSelected((prev) => {
        const newSet = new Set(prev);
        newSet.delete(skill);
        return newSet;
      });
  }

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
      <FormGroup>
        <InputLabel htmlFor="">Associated Skills:</InputLabel>
        {availableSkills.map((availableSkill: SkillInput) => (
          <div key={availableSkill.id}>
            <FormControlLabel
              sx={{ cursor: "default" }}
              control={
                <Checkbox
                  sx={{ cursor: "default" }}
                  disableRipple
                  checked={skillsSelected.has(availableSkill)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleSkillChange(e, availableSkill)
                  }
                  key={availableSkill.id}
                />
              }
              label={availableSkill.skillName}
            />
          </div>
        ))}
      </FormGroup>
      <FormSection title="Add New Skill">
        <Button
          variant="contained"
          onClick={addSkillToAvailableSkills}
          startIcon={<Add />}
        >
          Add Skill
        </Button>
        <TextField
          label="New Skill"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
        />
        <p />
      </FormSection>
    </FormSection>
  );
}

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
