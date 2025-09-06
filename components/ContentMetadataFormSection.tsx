import {
  Autocomplete,
  Chip,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { FormSection } from "./Form";

export type ContentMetadataPayload = {
  name: string;
  suggestedDate: string;
  rewardPoints: number;
  tagNames: readonly string[];
};

export function ContentMetadataFormSection({
  onChange,
  metadata,
  suggestedTags,
  disableName = false,
}: {
  onChange: (side: ContentMetadataPayload | null) => void;
  metadata?: ContentMetadataPayload | null;
  suggestedTags: string[];
  disableName?: boolean;
}) {
  const [name, setName] = useState(metadata?.name ?? "");
  const [suggestedDate, setSuggestedDate] = useState(
    metadata ? dayjs(metadata.suggestedDate) : null
  );
  const [tags, setTags] = useState<string[]>([...(metadata?.tagNames ?? [])]);

  const [rewardPoints, setRewardPoints] = useState(metadata?.rewardPoints ?? 0);

  const valid =
    name.trim() != "" &&
    suggestedDate != null &&
    suggestedDate.isValid() &&
    rewardPoints >= 0;

  useEffect(() => {
    onChange(
      valid
        ? {
            name,
            suggestedDate: suggestedDate.toISOString(),
            rewardPoints,
            tagNames: tags,
          }
        : null
    );
  }, [name, suggestedDate, tags, rewardPoints, valid, onChange]);

  const suggestedTagsF = suggestedTags.filter((x) => !tags.includes(x));

  return (
    <FormSection title="Content details">
      <TextField
        className="w-96"
        label="Name"
        variant="outlined"
        value={name}
        error={!!metadata && name.trim() == ""}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={disableName}
      />
      <DatePicker
        label="Suggested start date"
        value={suggestedDate}
        onChange={(newValue: Dayjs | null) => setSuggestedDate(newValue)}
        renderInput={(params) => (
    <TextField
      {...params}
      required
      error={
        (metadata != null && suggestedDate == null) ||
        (suggestedDate != null && !suggestedDate.isValid())
      }
    />
  )}
      />

      <Typography variant="caption" sx={{ marginTop: 1 }}>
        Reward Points
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
        value={rewardPoints}
        onChange={(e, a) => setRewardPoints(a as number)}
      />

      <Autocomplete
        multiple
        options={[]}
        defaultValue={[]}
        freeSolo
        value={tags}
        className="w-96"
        onChange={(_, newValue: string[]) => {
          setTags(newValue);
        }}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip key={key} variant="outlined" label={option} {...tagProps} />
            );
          })
        }
        renderInput={(params) => <TextField {...params} label="Tags" />}
      />

      {suggestedTagsF.length > 0 && (
        <>
          <div className="text-[10px] -mb-1 text-gray-600">Suggested Tags</div>
          <div className="flex gap-2 flex-wrap">
            {suggestedTagsF.slice(0, 10).map((tag) => (
              <Chip
                onClick={() => setTags([...tags, tag])}
                key={tag}
                label={tag}
              ></Chip>
            ))}
          </div>
        </>
      )}
    </FormSection>
  );
}
