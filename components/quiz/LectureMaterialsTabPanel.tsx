import { Add, Delete } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Form, FormSection } from "../Form";
import { MediaRecord } from "../GenerateQuizModal";
export function LectureMaterialsTabPanel({
  mediaRecords,
  materialIds,
  onChange,
}: {
  mediaRecords: MediaRecord[];
  materialIds: string[];
  onChange: (materialIds: string[]) => void;
}) {
  const [selectedMediaIds, setSelectedMediaIds] =
    useState<string[]>(materialIds);

  const noMediaToPick = useMemo(() => {
    const test = mediaRecords.filter((item) => {
      return !!item.id && !!item.name;
    });
    return test.length === 0;
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
        {!noMediaToPick ? (
          selectedMediaIds.map((media, i) => (
            <div className="flex justify-between items-center" key={i}>
              <Select
                className="min-w-[16rem] "
                labelId="relationshipLabel"
                value={media}
                onChange={({ target: { value } }) => updateMaterialAt(i, value)}
                inputProps={{ id: "relationshipLabel" }}
                required
              >
                {mediaRecords.map((mediaOption) => (
                  <MenuItem
                    value={mediaOption.id}
                    key={mediaOption.id}
                    disabled={
                      selectedMediaIds.includes(mediaOption.id) &&
                      selectedMediaIds[i] !== mediaOption.id
                    }
                  >
                    {mediaOption.name}
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
