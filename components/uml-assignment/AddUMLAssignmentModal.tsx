"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation } from "react-relay";

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import { ContentType } from "@/__generated__/AddCodeAssignmentModalMutation.graphql";
import { UmlApiCreateAssessmentMutation } from "@/__generated__/UmlApiCreateAssessmentMutation.graphql";
import type { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { AssessmentMetadataFormSection } from "@/components/AssessmentMetadataFormSection";
import type { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { ContentMetadataFormSection } from "@/components/ContentMetadataFormSection";
import { umlApiCreateAssessmentMutation } from "@/components/hylimo/api/UmlApi";
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
  chapterId?: string;
  assessmentId?: string;
  initialData?: {
    description: string;
    diagramCode: string;
    totalPoints: number;
    requiredPercentage: number;
    metadata: ContentMetadataPayload;
    assessmentMetadata: AssessmentMetadataPayload;
  };
}

export function AddUMLAssignmentModal({
  open,
  chapterId,
  assessmentId,
  onClose,
  initialData,
}: AddUMLAssignmentModalProps) {
  console.log("Data ", initialData);
  const params = useParams();
  const courseId = params.courseId as string;
  const isEditMode = !!assessmentId;

  const [description, setDescription] = useState(initialData?.description || "");
  const [diagramCode, setDiagramCode] = useState(initialData?.diagramCode || DEFAULT_UML_CODE);
  const [totalPoints, setTotalPoints] = useState<number>(initialData?.totalPoints ?? 100);
  const [requiredPercentage, setRequiredPercentage] = useState<number>(initialData?.requiredPercentage ?? 0.5);

  const [metadata, setMetadata] = useState<ContentMetadataPayload>(initialData?.metadata || {
    name: "",
    rewardPoints: 50,
    suggestedDate: new Date().toISOString(),
    tagNames: [] as readonly string[],
  });

  const [assessmentMetadata, setAssessmentMetadata] = useState<AssessmentMetadataPayload>(initialData?.assessmentMetadata || {
    skillPoints: 50,
    skillTypes: [],
    initialLearningInterval: 1,
  });

  const [createUmlAssessment] = useMutation<UmlApiCreateAssessmentMutation>(
    umlApiCreateAssessmentMutation
  );

  async function handleSubmit() {
    const semanticModelResult = await getSemanticModel(diagramCode);
    const semanticModelJson = JSON.stringify(semanticModelResult);

    if (isEditMode) {
      console.log("MOCK UPDATE");
      console.log("Data:", {
        description,
        totalPoints,
        requiredPercentage,
        diagramCode,
        semanticModelJson
      });

      onClose();
    } else {
      createUmlAssessment({
        variables: {
          assessmentInput: {
            metadata: {
              ...metadata,
              type: "UML_EXERCISE" as ContentType,
              chapterId: chapterId!
            },
            assessmentMetadata: { ...assessmentMetadata },
          },
          createUmlExerciseInput: {
            courseId,
            description,
            requiredPercentage,
            showSolution: true,
            totalPoints,
            tutorSolution: {
              diagramCode,
              semanticModel: semanticModelJson
            },
          },
        },
        updater: (store, response) => {
          if (!chapterId) return;
          const chapterRecord = store.get(chapterId);
          const newRecord = store.get(response?.createUMLAssessment?.id);
          if (chapterRecord && newRecord) {
            const contentRecords = chapterRecord.getLinkedRecords("contents") ?? [];
            chapterRecord.setLinkedRecords([...contentRecords, newRecord], "contents");
          }
        },
        onCompleted: () => onClose(),
        onError: (err) => console.error("Error Creating UML Assignment:", err),
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { minHeight: '90vh' } }}
    >
      <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
        <Container maxWidth={false} disableGutters>
          <Stack spacing={4}>
            {/* Header */}
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {isEditMode ? "Edit UML Assignment" : "Create New UML Assignment"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode
                  ? "Update existing exercise details and tutor solution."
                  : "Define a new exercise description and the reference diagram."}
              </Typography>
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Metadata */}
            <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" mb={2}>1. General Metadata</Typography>
              <Stack spacing={4}>
                <ContentMetadataFormSection
                  metadata={metadata}
                  onChange={setMetadata}
                  suggestedTags={[]}
                />
                <AssessmentMetadataFormSection
                  metadata={assessmentMetadata}
                  onChange={setAssessmentMetadata}
                />
              </Stack>
            </Box>

            {/* Editor and Rest */}
            <Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" mb={2}>2. Exercise Content</Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" mb={1}>Task Description</Typography>
                  <TextEditor
                    initialContent={description}
                    onContentChange={(html) => setDescription(html)}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={1}>
                    HYLIMO EDITOR (TUTOR SOLUTION)
                  </Typography>
                  <Box sx={{
                    height: "50vh",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    overflow: "hidden",
                    mb: 2,
                    bgcolor: "#fafafa"
                  }}>
                    <MainHylimoEditor
                      key={assessmentId || ""}
                      initialValue={diagramCode}
                      onChange={(val) => setDiagramCode(val)}
                    />
                  </Box>

                  <Stack direction="row" spacing={3}>
                    <TextField
                      label="Max Points"
                      type="number"
                      variant="outlined"
                      value={totalPoints}
                      onChange={(e) => setTotalPoints(Number(e.target.value))}
                      sx={{ width: 200 }}
                    />
                    <TextField
                      label="Required Percentage"
                      type="number"
                      variant="outlined"
                      value={Math.round(requiredPercentage * 100)}
                      onChange={(e) => setRequiredPercentage(Number(e.target.value) / 100)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      sx={{ width: 220 }}
                      helperText="Min. score to pass"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
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
  );
}