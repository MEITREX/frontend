"use client";

import { ContentType } from "@/__generated__/AddCodeAssignmentModalMutation.graphql";
import { UmlApiCreateAssessmentMutation } from "@/__generated__/UmlApiCreateAssessmentMutation.graphql";
import { AssessmentMetadataFormSection, AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { ContentMetadataFormSection, ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { umlApiCreateAssessmentMutation } from "@/components/hylimo/api/UmlApi";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
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
import { useParams } from "next/navigation";
import * as React from "react";
import { useMutation } from "react-relay";
import TextEditor from "../forum/richTextEditor/TextEditor";
import { getSemanticModel } from "../hylimo/semanticModelGenerator";

const defaultValue = `classDiagram {
    class("HelloWorld") {
        public {
            hello : string
        }
    }
}`;

export function AddUMLAssignmentModal({
  open,
  chapterId,
  onClose,
}: {
  open: boolean;
  chapterId: string;
  onClose: () => void;
}) {
  const params = useParams();
  const courseId = params.courseId as string;

  const [description, setDescription] = React.useState("");
  const [diagramCode, setDiagramCode] = React.useState(defaultValue);

  // Bleibt intern dezimal (z.B. 0.5)
  const [totalPoints, setTotalPoints] = React.useState<number>(100);
  const [requiredPercentage, setRequiredPercentage] = React.useState<number>(0.5);

  const [metadata, setMetadata] = React.useState<ContentMetadataPayload>({
    name: "",
    rewardPoints: 50,
    suggestedDate: new Date().toISOString(),
    tagNames: [] as readonly string[],
  });

  const [assessmentMetadata, setAssessmentMetadata] =
    React.useState<AssessmentMetadataPayload>({
      skillPoints: 50,
      skillTypes: [],
      initialLearningInterval: 1,
    });

  const [createUmlAssessment] = useMutation<UmlApiCreateAssessmentMutation>(
    umlApiCreateAssessmentMutation
  );

  async function handleSubmit() {
    if (!metadata || !assessmentMetadata) return;
    const semanticModelResult = await getSemanticModel(diagramCode);
    const semanticModelJson = JSON.stringify(semanticModelResult);

    createUmlAssessment({
      variables: {
        assessmentInput: {
          metadata: {
            ...metadata,
            type: "UML_EXERCISE" as ContentType,
            chapterId: chapterId,
          },
          assessmentMetadata: { ...assessmentMetadata },
        },
        createUmlExerciseInput: {
          courseId: courseId,
          description: description,
          requiredPercentage: requiredPercentage, // Wird als 0.5 gesendet
          showSolution: true,
          totalPoints: totalPoints,
          tutorSolution: {
            diagramCode: diagramCode,
            semanticModel: semanticModelJson,
          },
        },
      },
      onCompleted: () => onClose(),
      onError: (err) => console.error(err),
    });
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
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Create New UML Assignment
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Box>

            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" mb={1}>
                    Task Description
                  </Typography>
                  <TextEditor onContentChange={(html) => setDescription(html)} />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" mb={1}>
                    HYLIMO EDITOR
                  </Typography>

                  <Box
                    sx={{
                      height: "55vh",
                      minHeight: 450,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      overflow: "hidden",
                      bgcolor: "#f9f9f9",
                      mb: 2
                    }}
                  >
                    <MainHylimoEditor
                      initialValue={defaultValue}
                      onChange={(value) => setDiagramCode(value)}
                    />
                  </Box>

                  <Stack direction="row" spacing={3} alignItems="flex-start">
                    <TextField
                      label="Max Points"
                      type="number"
                      variant="outlined"
                      value={totalPoints}
                      onChange={(e) => setTotalPoints(Math.max(0, Number(e.target.value)))}
                      helperText="Total achievable points"
                      sx={{ width: 220 }}
                    />
                    <TextField
                      label="Required Percentage"
                      type="number"
                      variant="outlined"
                      // Anzeige in Prozent (z.B. 50)
                      value={Math.round(requiredPercentage * 100)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        // Speichern als Dezimal (z.B. 0.5)
                        const decimal = isNaN(val) ? 0 : val / 100;
                        setRequiredPercentage(Math.min(1, Math.max(0, decimal)));
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{ min: 0, max: 100 }}
                      helperText="Min. percentage to pass"
                      sx={{ width: 220 }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" mb={2}>Metadata & Assessment Settings</Typography>
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
          </Stack>
        </Container>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" size="large" sx={{ px: 4 }}>
          Save Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
}