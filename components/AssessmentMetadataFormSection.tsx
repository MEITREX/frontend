import { SkillType } from "@/__generated__/AddFlashcardSetModalMutation.graphql";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { FormSection } from "./Form";
import { AssessmentDetailsSkillSectionProps } from "./AssessmentDetailsSkillSection";
import { BloomLevel } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
import AssessmentDetailsSkillSection from "./AssessmentDetailsSkillSection";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { useQueryLoader } from "react-relay";
import { AllSkillQuery } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";

export type AssessmentMetadataPayload = {
  skillTypes: readonly SkillType[];
  skillPoints: number;
  initialLearningInterval?: number | null;
};

const skillTypeLabel: Record<SkillType, string> = {
  EVALUATE: "Evaluate",
  CREATE: "Create",
  ANALYZE: "Analyze",
  APPLY: "Apply",
  REMEMBER: "Remember",
  UNDERSTAND: "Understand",
  "%future added value": "Unknown",
};

export function AssessmentMetadataFormSection({
  onChange,
  metadata,
  isRepeatable = true,
  assessmentDetailsSkillSectionProps,
}: {
  onChange: (side: AssessmentMetadataPayload | null) => void;
  metadata?: AssessmentMetadataPayload | null;
  isRepeatable?: boolean;
  assessmentDetailsSkillSectionProps?: AssessmentDetailsSkillSectionProps;
}) {
  const [intervalLearning, setIntervalLearning] = useState(
    metadata?.initialLearningInterval != null
  );
  const [interval, setInterval] = useState(metadata?.initialLearningInterval);
  const [skillTypes, setSkillTypes] = useState(metadata?.skillTypes);
  const [skillPoints, setSkillPoints] = useState(
    Number(metadata?.skillPoints) || 50
  );

  const valid =
    skillTypes?.length &&
    (!intervalLearning || (interval != null && interval > 0));

  useEffect(() => {
    onChange(
      valid
        ? {
            skillTypes: skillTypes ?? [],
            skillPoints,
            initialLearningInterval: intervalLearning ? interval : undefined,
          }
        : null
    );
  }, [skillTypes, skillPoints, intervalLearning, valid, interval, onChange]);

  return (
    <FormSection title="Assessment details">
      <FormControl variant="outlined">
        <InputLabel htmlFor="assessmentSkillTypeInput">Skill Type</InputLabel>

        <Select
          className="min-w-[16rem] "
          label="Skill Type"
          labelId="assessmentSkillTypeLabel"
          value={skillTypes ?? []}
          onChange={({ target: { value } }) => {
            const parsed = (
              typeof value === "string" ? value.split(",") : value
            ) as SkillType[];

            setSkillTypes(parsed);
            assessmentDetailsSkillSectionProps?.setItem((prev) => ({
              ...prev,
              associatedBloomLevels: parsed as BloomLevel[],
            }));
          }}
          renderValue={(selected) =>
            selected.map((x) => skillTypeLabel[x]).join(", ")
          }
          inputProps={{ id: "assessmentSkillTypeInput" }}
          required
          multiple
        >
          {(
            [
              "REMEMBER",
              "UNDERSTAND",
              "APPLY",
              "ANALYZE",
              "CREATE",
              "EVALUATE",
            ] as const
          ).map((val, i) => (
            <MenuItem value={val} key={i}>
              <Checkbox checked={(skillTypes ?? []).indexOf(val) > -1} />

              <ListItemText>{skillTypeLabel[val]}</ListItemText>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="caption" sx={{ marginTop: 1 }}>
        Skill Points
      </Typography>

      <Slider
        sx={{ marginX: 1 }}
        step={5}
        marks={[
          { value: 10, label: "Low" },
          { value: 50, label: "Medium" },
          { value: 90, label: "High" },
        ]}
        min={0}
        max={100}
        valueLabelDisplay="auto"
        value={skillPoints}
        onChange={(e, a) => setSkillPoints(a as number)}
      />
      {isRepeatable && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={intervalLearning}
                onChange={() => setIntervalLearning(!intervalLearning)}
              />
            }
            label="Should this content be repeated?"
          />
        </FormGroup>
      )}
      {intervalLearning && (
        <TextField
          className="w-96"
          type="number"
          variant="outlined"
          value={interval}
          defaultValue={"Learning Interval"}
          label="Interval in days"
          error={(interval ?? 0) < 0}
          helperText={
            (interval ?? 0) < 0 ? "Please enter a positive value" : undefined
          }
          onChange={(e) => setInterval(parseInt(e.target.value))}
          required
        />
      )}

      {assessmentDetailsSkillSectionProps && (
        <AssessmentDetailsSkillSection
          {...assessmentDetailsSkillSectionProps}
        />
      )}
    </FormSection>
  );
}
