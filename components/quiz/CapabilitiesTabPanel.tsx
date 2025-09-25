import {
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Form, FormSection } from "../Form";
import { Add, Delete } from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import { SkillType } from "@/__generated__/QuizModalEditMutation.graphql";
import { CapabilityInput } from "../GenerateQuizModal";

export type EducationalObjective = Exclude<SkillType, "CREATE" | "EVALUATE">;

const skillTypeLabel: Record<EducationalObjective, string> = {
  ANALYZE: "Analyze",
  APPLY: "Apply",
  REMEMBER: "Remember",
  UNDERSTAND: "Understand",
  "%future added value": "Unknown",
};

export function CapabilitiesTabPanel({
  onChange,
  capabilities,
}: {
  onChange: (capabilities: CapabilityInput) => void;
  capabilities: CapabilityInput;
}) {
  const [skillTypes, setSkillTypes] = useState<EducationalObjective[]>(
    capabilities.objectives
  );
  const [relationship, setRelationship] = useState<string>(
    capabilities.relationship
  );
  const [keywords, setKeywords] = useState<string[]>(capabilities.keywords);

  const updateKeywordAt = useCallback(
    (index: number, keywordText: string) => {
      setKeywords((oldValue) =>
        oldValue.map((item, i) => (index === i ? keywordText : item))
      );
    },
    [setKeywords]
  );

  const deleteQuestionAnswerAt = useCallback(
    (index: number) => {
      setKeywords((oldValue) => oldValue.filter((_, i) => i !== index));
    },
    [setKeywords]
  );

  const addEmptyKeyword = useCallback(
    () => setKeywords((oldValue) => [...oldValue, ""]),
    [setKeywords]
  );

  useEffect(() => {
    onChange({
      objectives: skillTypes,
      keywords: keywords,
      relationship: relationship,
    });
  }, [skillTypes, keywords, relationship, onChange]);

  return (
    <Form>
      <FormSection title="Educational Objective" showDivider={false}>
        <FormControl variant="outlined">
          <InputLabel htmlFor="assessmentSkillTypeLabel">
            Objectives *
          </InputLabel>

          <Select
            className="min-w-[16rem] "
            label="Objectives"
            labelId="assessmentSkillTypeLabel"
            value={skillTypes ?? []}
            onChange={({ target: { value } }) =>
              setSkillTypes(
                (typeof value === "string"
                  ? value.split(",")
                  : value) as EducationalObjective[]
              )
            }
            renderValue={(selected) =>
              selected.map((x) => skillTypeLabel[x]).join(", ")
            }
            inputProps={{ id: "assessmentSkillTypeInput" }}
            required
            multiple
          >
            {(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYZE"] as const).map(
              (val, i) => (
                <MenuItem value={val} key={i}>
                  <Checkbox checked={(skillTypes ?? []).indexOf(val) > -1} />
                  <ListItemText>{skillTypeLabel[val]}</ListItemText>
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </FormSection>

      <FormSection title="Keywords">
        <div className="flex w-full justify-end col-span-full">
          <Button onClick={addEmptyKeyword} startIcon={<Add />}>
            Add Keyword
          </Button>
        </div>
        {keywords.map((keyword, i) => (
          <div className="flex justify-between items-center w-full" key={i}>
            <TextField
              value={keyword}
              className="w-full"
              label={`Keyword ${i + 1}*`}
              variant="outlined"
              placeholder="Add Keyword"
              inputProps={{ maxLength: 25 }}
              onChange={(e) => updateKeywordAt(i, e.target.value)}
            />
            {i !== 0 && (
              <IconButton
                color="error"
                onClick={() => deleteQuestionAnswerAt(i)}
              >
                <Delete />
              </IconButton>
            )}
          </div>
        ))}
      </FormSection>

      <FormSection title="Relationship">
        <FormControl variant="outlined">
          <InputLabel htmlFor="relationshipLabel">Relationship *</InputLabel>
          <Select
            className="min-w-[16rem] "
            label="Relationship"
            labelId="relationshipLabel"
            value={relationship ?? ""}
            onChange={({ target: { value } }) => setRelationship(value)}
            inputProps={{ id: "relationshipLabel" }}
            required
          >
            {(["SIMILARITY", "DIFFERENCES", "ORDER", "COMPLEX"] as const).map(
              (val, i) => (
                <MenuItem value={val} key={i}>
                  <ListItemText>
                    {val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()}
                  </ListItemText>
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
      </FormSection>
    </Form>
  );
}
