import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import FullscreenEditorDialog from "@/components/hylimo/FullscreenEditorDialog";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import Button from "@mui/material/Button";
import { useState } from "react";

export default function ExerciseInfoTab({
  exercise,
  onUpdateTutorSolution,
  isUpdating,
}: any) {
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const initialDiagramCode = exercise.tutorSolution?.diagramCode || "";
  const [localTutorCode, setLocalTutorCode] = useState(initialDiagramCode);

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
                      <strong>Read-Only:</strong> To edit the tutor solution, select the 'Edit Exercise' button.
        </Alert>
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Task Description
        </Typography>
        <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1 }}>
          <ContentViewer htmlContent={exercise.description} />
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
              onClick={e => { e.stopPropagation(); setFullscreen(true); }}
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
              <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
               Currently, Sprotty may not render correctly. Please select the full-screen option to resolve this issue.
            </Alert>
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
          Requirements
        </Typography>
        <List disablePadding>
          <ListItem divider sx={{ px: 0 }}>
            <ListItemText
              primary="Max Points"
              secondary={`${exercise.totalPoints} Achievement Points`}
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemText
              primary="Passing Threshold"
              secondary={`${(exercise.requiredPercentage || 0.5) * 100}%`}
            />
          </ListItem>
        </List>
      </Paper>
    </Stack>
  );
}
