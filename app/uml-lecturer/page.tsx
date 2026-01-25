"use client";

import * as React from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import InfoIcon from "@mui/icons-material/Info";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import { ContentMetadataFormSection, ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { AssessmentMetadataFormSection, AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";

export default function CreateUMLAssignment() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fullscreen, setFullscreen] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);

  const [metadata, setMetadata] = React.useState<ContentMetadataPayload>({
    name: "",
    rewardPoints: 0,
    suggestedDate: new Date().toISOString(),
    tagNames: [] as readonly string[],
  });

  const [assessmentMetadata, setAssessmentMetadata] = React.useState<AssessmentMetadataPayload>({
    skillPoints: 0,
    skillTypes: [],
    initialLearningInterval: 1,
  })

  const Editor = (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MainHylimoEditor />
    </Box>
  );

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 3 }}>
              Create new UML assignment
            </Typography>

            <Stack spacing={3}>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                variant="outlined"
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={4}
                required
                variant="outlined"
              />

              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                    HYLIMO EDITOR
                  </Typography>
                  <IconButton onClick={() => setFullscreen(true)} size="small">
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box
                  sx={{
                    height: "50vh",
                    minHeight: 400,
                    border: "1px solid",
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: "hidden",
                    bgcolor: "#f9f9f9"
                  }}
                >
                  {Editor}
                </Box>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack spacing={4}>
              <Typography variant="h6">
                Metadata
              </Typography>
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

          <Box display="flex" justifyContent="flex-end" sx={{ pt: 2 }}>
            <Button
              variant="contained"
              size="large"
            >
              Save
            </Button>
          </Box>
        </Stack>
      </Container>

      {/* Fullscreen Editor */}
      <Dialog fullScreen open={fullscreen} onClose={() => setFullscreen(false)}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setFullscreen(false)}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              HyLiMo Editor
            </Typography>
            <IconButton color="inherit" onClick={() => setShowInfo((v) => !v)}>
              <InfoIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
          {/* Info-Overlay absolut über dem Editor */}
          <Slide direction="down" in={showInfo} mountOnEnter unmountOnExit>
            <Paper
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                p: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack spacing={2}>
                {/* Editable fields im Overlay */}
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Stack>
            </Paper>
          </Slide>

          {/* Editor bleibt unter dem Overlay */}
          <Box sx={{ height: "100%", width: "100%" }}>{Editor}</Box>
        </Box>
      </Dialog>
    </>
  );
}
