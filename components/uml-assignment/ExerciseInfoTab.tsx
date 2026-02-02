import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

export default function ExerciseInfoTab({
  exercise,
  onUpdateTutorSolution,
  isUpdating,
}: any) {
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [localTutorCode, setLocalTutorCode] = useState(exercise.tutorSolution);

  return (
    <Stack spacing={3}>
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
          <IconButton
            sx={{
              transform: editorExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.2s",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
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
              <MainHylimoEditor
                initialValue={localTutorCode}
                onChange={(val) => setLocalTutorCode(val)}
              />
            </Box>
            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => onUpdateTutorSolution(localTutorCode)}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Update Tutor Solution"}
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Paper>

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
