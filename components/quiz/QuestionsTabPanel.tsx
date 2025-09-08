import { FormControl, TextField } from "@mui/material";
import { Form, FormSection } from "../Form";
import { useEffect, useState } from "react";

type GenerateQuestionsInput = {
  multipleChoiceAmount: number;
  clozeAmount: number;
  associationAmount: number;
};

export function QuestionsTabPanel({
  questionAmounts,
  onChange,
}: {
  questionAmounts: GenerateQuestionsInput;
  onChange: (amounts: GenerateQuestionsInput) => void;
}) {
  const [input, setInput] = useState<GenerateQuestionsInput>(questionAmounts);

  useEffect(() => {
    onChange(input);
  });

  return (
    <Form>
      <FormSection title="Multiple Choice Questions" showDivider={false}>
        <FormControl variant="outlined">
          <TextField
            value={input.multipleChoiceAmount}
            inputProps={{ min: 0, max: 10 }}
            onChange={({ target: { value } }) =>
              setInput({ ...input, multipleChoiceAmount: Number(value) })
            }
            type="number"
            label="Amount to Generate"
            required
            sx={{ width: "225px" }}
          />
        </FormControl>
      </FormSection>

      <FormSection title="Cloze Questions">
        <FormControl variant="outlined">
          <TextField
            value={input.clozeAmount}
            inputProps={{ min: 0, max: 10 }}
            onChange={({ target: { value } }) =>
              setInput({ ...input, clozeAmount: Number(value) })
            }
            type="number"
            label="Amount to Generate"
            required
            sx={{ width: "225px" }}
          />
        </FormControl>
      </FormSection>

      <FormSection title="Association Questions">
        <FormControl variant="outlined">
          <TextField
            value={input.associationAmount}
            inputProps={{ min: 0, max: 10 }}
            onChange={({ target: { value } }) =>
              setInput({ ...input, associationAmount: Number(value) })
            }
            type="number"
            label="Amount to Generate"
            required
            sx={{ width: "225px" }}
          />
        </FormControl>
      </FormSection>
    </Form>
  );
}
