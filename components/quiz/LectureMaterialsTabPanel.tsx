import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, FormSection } from "../Form";
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { GenerateQuizModalMediaQuery$data } from "@/__generated__/GenerateQuizModalMediaQuery.graphql";

export function LectureMaterialsTabPanel({
  mediaRecords,
  materialIds,
  onChange,
}: {
  mediaRecords: GenerateQuizModalMediaQuery$data["mediaRecordsForCourses"][0];
  materialIds: string[];
  onChange: (materialIds: string[]) => void;
}) {
  const [selectedMediaIds, setSelectedMediaIds] =
    useState<string[]>(materialIds);
  const selectableMedia = useMemo(() => {
    return mediaRecords.filter((media) => !selectedMediaIds.includes(media.id));
  }, [mediaRecords, selectedMediaIds]);

  const noMediaToPick = useMemo(() => {
    mediaRecords.filter((item) => !item.id || !item.name || !item.type);
    return mediaRecords.length === 0;
  }, [mediaRecords]);

  const addMaterial = useCallback(
    () => setSelectedMediaIds((oldValue) => [...oldValue, ""]),
    [setSelectedMediaIds]
  );

  const updateMaterialAt = useCallback(
    (index: number, materialID: string) => {
      setSelectedMediaIds((oldValue) =>
        oldValue.map((item, i) => (index === i ? materialID : item))
      );
    },
    [setSelectedMediaIds]
  );

  const deleteMaterialAt = useCallback(
    (index: number) => {
      setSelectedMediaIds((oldValue) => oldValue.filter((_, i) => i !== index));
    },
    [setSelectedMediaIds]
  );

  useEffect(() => {
    onChange(selectedMediaIds);
  });

  return (
    <Form>
      <FormSection title="Material" showDivider={false}>
        <div className="flex w-full justify-end col-span-full">
          <Button
            onClick={addMaterial}
            startIcon={<Add />}
            disabled={selectedMediaIds.length === mediaRecords.length}
          >
            Add Material
          </Button>
        </div>
        {noMediaToPick ? (
          selectedMediaIds.map((media, i) => (
            <div className="flex justify-between items-center w-full" key={i}>
              <Select
                className="min-w-[16rem] "
                labelId="relationshipLabel"
                value={media ?? ""}
                onChange={({ target: { value } }) => updateMaterialAt(i, value)}
                inputProps={{ id: "relationshipLabel" }}
                required
              >
                {selectableMedia.map((media, i) => (
                  <MenuItem value={media.id} key={i}>
                    <ListItemText>{media.name}</ListItemText>
                  </MenuItem>
                ))}
              </Select>
              {i !== 0 && (
                <IconButton color="error" onClick={() => deleteMaterialAt(i)}>
                  <Delete />
                </IconButton>
              )}
            </div>
          ))
        ) : (
          <Alert severity="warning" className="w-96">
            <AlertTitle>No Media Available</AlertTitle>
            Please upload Media like Lecture Recordings or Slides in this Course
            before generating questions based on these
          </Alert>
        )}
      </FormSection>
    </Form>
  );
}
