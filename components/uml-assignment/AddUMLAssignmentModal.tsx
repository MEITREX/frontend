"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "react-relay";

import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { ContentType } from "@/__generated__/AddCodeAssignmentModalMutation.graphql";
import { UmlApiCreateAssessmentMutation } from "@/__generated__/UmlApiCreateAssessmentMutation.graphql";
import type { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { AssessmentMetadataFormSection } from "@/components/AssessmentMetadataFormSection";
import type { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { ContentMetadataFormSection } from "@/components/ContentMetadataFormSection";
import {
  umlApiCreateAssessmentMutation,
  umlApiUpdateUmlAssignmentMutation,
} from "@/components/hylimo/api/UmlApi";
import FullscreenEditorDialog from "@/components/hylimo/FullscreenEditorDialog";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import TextEditor from "../forum/richTextEditor/TextEditor";
import { getSemanticModel } from "../hylimo/semanticModelGenerator";

const DEFAULT_UML_CODE = `classDiagram {
    class("HelloWorld") {
        public {
            hello : string
        }
    }
}`;

interface AddUMLAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  chapterId?: string;
  assessmentId?: string;
  initialData?: {
    description: string;
    gradingRules: string;
    diagramCode: string;
    totalPoints: number;
    requiredPercentage: number;
    showSolution: boolean;
    metadata: ContentMetadataPayload;
    assessmentMetadata: AssessmentMetadataPayload;
  };
}

type UmlInputErrors = {
  description?: string;
  totalPoints?: string;
  requiredPercentage?: string;
  diagramCode?: string;
};

export function AddUMLAssignmentModal({
  open,
  chapterId,
  assessmentId,
  onClose,
  onUpdated,
  initialData,
}: AddUMLAssignmentModalProps) {
  const params = useParams();
  const courseId = params.courseId as string;
  const isEditMode = !!assessmentId;
  const defaultMetadata = useMemo<ContentMetadataPayload>(
    () => ({
      name: "",
      rewardPoints: 50,
      suggestedDate: new Date().toISOString(),
      tagNames: [] as readonly string[],
    }),
    []
  );
  const defaultAssessmentMetadata = useMemo<AssessmentMetadataPayload>(
    () => ({
      skillPoints: 50,
      skillTypes: [],
      initialLearningInterval: 1,
    }),
    []
  );

  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [gradingRules, setGradingRules] = useState(
    initialData?.gradingRules || ""
  );
  const [diagramCode, setDiagramCode] = useState(
    initialData?.diagramCode || DEFAULT_UML_CODE
  );
  const [totalPoints, setTotalPoints] = useState<number>(
    initialData?.totalPoints ?? 100
  );
  const [requiredPercentage, setRequiredPercentage] = useState<number>(
    initialData?.requiredPercentage ?? 0.5
  );
  const [showSolution, setShowSolution] = useState<boolean>(
    initialData?.showSolution ?? true
  );

  const [metadata, setMetadata] = useState<ContentMetadataPayload>(
    initialData?.metadata || defaultMetadata
  );

  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload>(
      initialData?.assessmentMetadata || defaultAssessmentMetadata
    );
  const [errors, setErrors] = useState<UmlInputErrors>({});

  const [createUmlAssessment] = useMutation<UmlApiCreateAssessmentMutation>(
    umlApiCreateAssessmentMutation
  );
  const [updateUmlAssignment] = useMutation(umlApiUpdateUmlAssignmentMutation);

  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (isEditMode && initialData) {
      setDescription(initialData.description || "");
      setGradingRules(initialData.gradingRules || "");
      setDiagramCode(initialData.diagramCode || DEFAULT_UML_CODE);
      setTotalPoints(initialData.totalPoints ?? 100);
      setRequiredPercentage(initialData.requiredPercentage ?? 0.5);
      setShowSolution(initialData.showSolution ?? true);
      setMetadata(initialData.metadata || defaultMetadata);
      setAssessmentMetadata(
        initialData.assessmentMetadata || defaultAssessmentMetadata
      );
    }

    if (!isEditMode) {
      setDescription("");
      setGradingRules("");
      setDiagramCode(DEFAULT_UML_CODE);
      setTotalPoints(100);
      setRequiredPercentage(0.5);
      setShowSolution(true);
      setMetadata(defaultMetadata);
      setAssessmentMetadata(defaultAssessmentMetadata);
    }

    setErrors({});
  }, [
    open,
    isEditMode,
    initialData,
    defaultMetadata,
    defaultAssessmentMetadata,
  ]);

  function stripHtml(input: string) {
    return input.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  }

  function validateUmlExerciseInput(): UmlInputErrors {
    const nextErrors: UmlInputErrors = {};

    if (!description || stripHtml(description).length === 0) {
      nextErrors.description = "Description is required.";
    }

    if (!diagramCode || diagramCode.trim().length === 0) {
      nextErrors.diagramCode = "Tutor solution diagram is required.";
    }

    if (!Number.isInteger(totalPoints) || totalPoints < 0) {
      nextErrors.totalPoints = "Total points must be an integer greater than or equal to 0.";
    }

    if (
      Number.isNaN(requiredPercentage) ||
      requiredPercentage < 0 ||
      requiredPercentage > 1
    ) {
      nextErrors.requiredPercentage =
        "Passing threshold must be between 0% and 100%.";
    }

    return nextErrors;
  }

  async function handleSubmit() {
    const validationErrors = validateUmlExerciseInput();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const semanticModelResult = await getSemanticModel(diagramCode);
    const semanticModelJson = JSON.stringify(semanticModelResult);

    if (isEditMode) {
      updateUmlAssignment({
        variables: {
          contentId: assessmentId!,
          assessment: {
            metadata: {
              ...metadata,
              chapterId: chapterId!,
            },
            assessmentMetadata: { ...assessmentMetadata },
          },
          assessmentId: assessmentId!,
          umlExercise: {
            description,
            gradingRules,
            totalPoints,
            requiredPercentage,
            showSolution,
            tutorSolution: {
              diagramCode,
              semanticModel: semanticModelJson,
            },
          },
        },
        onCompleted: () => {
          onUpdated?.();
          onClose();
        },
        onError: (err) => console.error("Error Updating UML Assessment:", err),
      });
    } else {
      createUmlAssessment({
        variables: {
          assessmentInput: {
            metadata: {
              ...metadata,
              type: "UML_EXERCISE" as ContentType,
              chapterId: chapterId!,
            },
            assessmentMetadata: { ...assessmentMetadata },
          },
          createUmlExerciseInput: {
            courseId,
            description,
            gradingRules,
            requiredPercentage,
            showSolution,
            totalPoints,
            tutorSolution: {
              diagramCode,
              semanticModel: semanticModelJson,
            },
          },
        },
        updater: (store, response) => {
          if (!chapterId) return;
          const chapterRecord = store.get(chapterId);
          const newRecord = store.get(response?.createUMLAssessment?.id);
          if (chapterRecord && newRecord) {
            const contentRecords =
              chapterRecord.getLinkedRecords("contents") ?? [];
            chapterRecord.setLinkedRecords(
              [...contentRecords, newRecord],
              "contents"
            );
          }
        },
        onCompleted: () => onClose(),
        onError: (err) => console.error("Error Creating UML Assignment:", err),
      });
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { minHeight: "90vh" } }}
      >
        <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
          <Container maxWidth={false} disableGutters>
            <Stack spacing={4}>
              {/* Header */}
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {isEditMode
                    ? "Edit UML Assignment"
                    : "Create New UML Assignment"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEditMode
                    ? "Update existing exercise details and tutor solution."
                    : "Define a new exercise description and the reference diagram."}
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>

              {/* Metadata */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" mb={2}>
                  1. General Metadata
                </Typography>
                <Stack spacing={4}>
                  <ContentMetadataFormSection
                    metadata={metadata}
                    onChange={(nextMetadata) => {
                      if (nextMetadata != null) {
                        setMetadata(nextMetadata);
                      }
                    }}
                    suggestedTags={[]}
                  />
                  <AssessmentMetadataFormSection
                    metadata={assessmentMetadata}
                    onChange={(nextAssessmentMetadata) => {
                      if (nextAssessmentMetadata != null) {
                        setAssessmentMetadata(nextAssessmentMetadata);
                      }
                    }}
                  />
                </Stack>
              </Box>

              {/* Editor and Rest */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" mb={2}>
                  2. Exercise Content
                </Typography>
                <Stack spacing={3}>
                  {Object.keys(errors).length > 0 && (
                    <Typography variant="body2" color="error.main">
                      Please fix the highlighted fields before saving.
                    </Typography>
                  )}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600" mb={1}>
                      Task Description
                    </Typography>
                    <TextEditor
                      initialContent={description}
                      onContentChange={(html) => setDescription(html)}
                    />
                    {errors.description && (
                      <Typography variant="caption" color="error.main">
                        {errors.description}
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    label="Grading Rules"
                    value={gradingRules}
                    onChange={(e) => setGradingRules(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    placeholder="Define grading constraints, penalties, and expectations"
                  />

                  <Typography variant="subtitle1" fontWeight="600">
                    Submission Settings
                  </Typography>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                      label="Total Points"
                      type="number"
                      value={totalPoints}
                      onChange={(e) => setTotalPoints(Number(e.target.value || 0))}
                      inputProps={{ min: 0, step: 1 }}
                      error={Boolean(errors.totalPoints)}
                      helperText={errors.totalPoints}
                      fullWidth
                    />
                    <TextField
                      label="Passing Threshold (%)"
                      type="number"
                      value={Math.round((requiredPercentage || 0) * 100)}
                      onChange={(e) => {
                        const nextPercentage = Number(e.target.value || 0);
                        const clamped = Math.max(0, Math.min(100, nextPercentage));
                        setRequiredPercentage(clamped / 100);
                      }}
                      inputProps={{ min: 0, max: 100, step: 1 }}
                      error={Boolean(errors.requiredPercentage)}
                      helperText={
                        errors.requiredPercentage ||
                        "0% means no threshold, 100% means full correctness required"
                      }
                      fullWidth
                    />
                  </Stack>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showSolution}
                        onChange={(e) => setShowSolution(e.target.checked)}
                      />
                    }
                    label="Allow only one submission per student"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
                    If enabled, students can submit only once. If disabled, they can create and submit additional attempts.
                  </Typography>

                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="bold"
                        flex={1}
                      >
                        HYLIMO EDITOR (TUTOR SOLUTION)
                      </Typography>
                      <Button
                        onClick={() => setFullscreen(true)}
                        variant="outlined"
                        size="small"
                        sx={{ ml: 2 }}
                        disabled={fullscreen}
                      >
                        Fullscreen
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        height: "50vh",
                        border: "1px solid",
                        borderColor: errors.diagramCode ? "error.main" : "divider",
                        borderRadius: 1,
                        overflow: "hidden",
                        mb: 2,
                        bgcolor: "#fafafa",
                      }}
                    >
                      {!fullscreen && (
                        <MainHylimoEditor
                          key={assessmentId || "modal"}
                          initialValue={diagramCode}
                          onChange={(val) => setDiagramCode(val)}
                        />
                      )}
                    </Box>
                    {errors.diagramCode && (
                      <Typography variant="caption" color="error.main">
                        {errors.diagramCode}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Container>
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            color="primary"
            sx={{ px: 4 }}
          >
            {isEditMode ? "Update Exercise" : "Create Exercise"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Fullscreen Editor */}
      <FullscreenEditorDialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title="HyLiMo Editor"
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        infoContent={
          <>
            <TextField
              label="Title"
              value={metadata.name}
              onChange={(e) =>
                setMetadata({ ...metadata, name: e.target.value })
              }
              fullWidth
            />
            <TextEditor
              initialContent={description}
              onContentChange={(html) => setDescription(html)}
            />
            <TextField
              label="Grading Rules"
              value={gradingRules}
              onChange={(e) => setGradingRules(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Total Points"
                type="number"
                value={totalPoints}
                onChange={(e) => setTotalPoints(Number(e.target.value || 0))}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
              />
              <TextField
                label="Passing Threshold (%)"
                type="number"
                value={Math.round((requiredPercentage || 0) * 100)}
                onChange={(e) => {
                  const nextPercentage = Number(e.target.value || 0);
                  const clamped = Math.max(0, Math.min(100, nextPercentage));
                  setRequiredPercentage(clamped / 100);
                }}
                inputProps={{ min: 0, max: 100, step: 1 }}
                fullWidth
              />
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showSolution}
                  onChange={(e) => setShowSolution(e.target.checked)}
                />
              }
              label="Allow only one submission per student"
            />
          </>
        }
      >
        {fullscreen && (
          <MainHylimoEditor
            key={assessmentId || "fullscreen"}
            initialValue={diagramCode}
            onChange={(val) => setDiagramCode(val)}
          />
        )}
      </FullscreenEditorDialog>
    </>
  );
}
