import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import FullscreenEditorDialog from "@/components/hylimo/FullscreenEditorDialog";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Alert,
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

export default function ExerciseInfoTab({
  exercise,
  onUpdateTutorSolution,
  isUpdating,
}: any) {
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [autoFullscreenHackActive, setAutoFullscreenHackActive] =
    useState(false);
  const [autoFullscreenHackDone, setAutoFullscreenHackDone] = useState(false);
  const initialDiagramCode = exercise.tutorSolution?.diagramCode || "";
  const [localTutorCode, setLocalTutorCode] = useState(initialDiagramCode);

  useEffect(() => {
    if (!editorExpanded || autoFullscreenHackDone) {
      return;
    }

    setAutoFullscreenHackActive(true);
    setFullscreen(true);

    const closeTimer = window.setTimeout(() => {
      setFullscreen(false);
      setAutoFullscreenHackActive(false);
      setAutoFullscreenHackDone(true);
    }, 160);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [editorExpanded, autoFullscreenHackDone]);

  return (
    <Stack spacing={3}>
      <Alert
        severity="info"
        variant="outlined"
        sx={{
          width: "100%",
          borderRadius: 2,
          borderWidth: "1px",
          backgroundColor: "info.lighter",
          "& .MuiAlert-message": {
            fontWeight: 500,
          },
        }}
      >
        <strong>Read-Only:</strong> To edit the tutor solution, select the
        &apos;Edit Exercise&apos; button.
      </Alert>
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Task Description
        </Typography>
        <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1 }}>
          <ContentViewer htmlContent={exercise.description} />
        </Box>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Grading Rules
        </Typography>
        <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1 }}>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {exercise.gradingRules || "No grading rules defined."}
          </Typography>
        </Box>
      </Paper>

      {/* Tutor Solution Editor Section */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ borderRadius: 2, overflow: "hidden" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, cursor: "pointer", bgcolor: "grey.50" }}
          onClick={() => setEditorExpanded(!editorExpanded)}
        >
          <Typography variant="h6" fontWeight="bold">
            Tutor Solution (HyLiMo)
          </Typography>
          <Box>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreen(true);
              }}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            >
              Fullscreen
            </Button>
            <IconButton
              sx={{
                transform: editorExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "0.2s",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Stack>
        <Collapse in={editorExpanded}>
          <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Box
              sx={{
                height: "50vh",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
                mb: 2,
              }}
            >
              {!fullscreen && (
                <MainHylimoEditor
                  key={exercise.id || "readonly-hylimo"}
                  readOnly={true}
                  initialValue={localTutorCode}
                  onChange={(val) => setLocalTutorCode(val)}
                />
              )}
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Fullscreen Editor */}
      <FullscreenEditorDialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title="HyLiMo Editor (Tutor Solution)"
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        invisible={autoFullscreenHackActive && fullscreen}
        infoContent={
          <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1 }}>
            <ContentViewer htmlContent={exercise.description} />
          </Box>
        }
      >
        {fullscreen && (
          <MainHylimoEditor
            key={exercise.id || "readonly-hylimo-fullscreen"}
            readOnly={true}
            initialValue={localTutorCode}
            onChange={(val) => setLocalTutorCode(val)}
          />
        )}
      </FullscreenEditorDialog>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Exercise Overview
        </Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Total Points
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {exercise.totalPoints}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Passing Threshold
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {Math.round((exercise.requiredPercentage || 0) * 100)}%
              </Typography>
            </Paper>
          </Stack>

          <Divider />

          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              Attempt Policy:
            </Typography>
            <Chip
              size="small"
              color={exercise.showSolution ? "warning" : "success"}
              label={
                exercise.showSolution
                  ? "One Submission Per Student"
                  : "Multiple Submissions Allowed"
              }
            />
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
