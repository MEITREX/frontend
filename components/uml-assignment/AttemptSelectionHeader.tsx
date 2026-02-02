import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface AttemptSelectionHeaderProps {
  currentIdx: number;
  totalAttempts: number;
  attemptDate: string;
  isSubmitted: boolean;
  isLoading: { saving: boolean; submitting: boolean; creating: boolean };
  onNavigate: (dir: "prev" | "next") => void;
  onAction: (type: "save" | "submit") => void;
  onCreate: (fromPrevious: boolean) => void;
}

const formatDate = (dateStr: string, isSubmitted: boolean) => {
  const date = new Date(dateStr);
  const now = new Date();
  const label = isSubmitted ? "Submitted at: " : "Last saved at: ";
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStrDe = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${label}${isToday ? timeStr : `${dateStrDe}, ${timeStr}`}`;
};

export default function AttemptSelectionHeader({
  currentIdx,
  totalAttempts,
  attemptDate,
  isSubmitted,
  isLoading,
  onNavigate,
  onAction,
  onCreate,
}: AttemptSelectionHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isAnyLoading = Object.values(isLoading).some(Boolean);

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <IconButton onClick={() => onNavigate("prev")} disabled={isAnyLoading}>
        <ArrowBackIosNewIcon />
      </IconButton>

      <Box textAlign="center" minWidth={150}>
        <Typography variant="subtitle1" color="text.secondary">
          Attempt {currentIdx + 1} / {totalAttempts}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {formatDate(attemptDate, isSubmitted)}
        </Typography>
      </Box>

      <IconButton onClick={() => onNavigate("next")} disabled={isAnyLoading}>
        <ArrowForwardIosIcon />
      </IconButton>

      <Box display="flex" alignItems="center" gap={1}>
        {currentIdx === totalAttempts - 1 && isSubmitted && (
          <>
            <Button
              variant="outlined"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              startIcon={
                isLoading.creating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AddIcon />
                )
              }
              endIcon={<KeyboardArrowDownIcon />}
              disabled={isAnyLoading}
            >
              {isLoading.creating ? "Creating..." : "New Attempt"}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem
                onClick={() => {
                  onCreate(false);
                  setAnchorEl(null);
                }}
              >
                Start from scratch
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onCreate(true);
                  setAnchorEl(null);
                }}
              >
                Copy from previous
              </MenuItem>
            </Menu>
          </>
        )}

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => onAction("save")}
          startIcon={
            isLoading.saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          disabled={isSubmitted || isAnyLoading}
        >
          {isLoading.saving ? "Saving..." : "Save"}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => onAction("submit")}
          endIcon={
            isLoading.submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendIcon />
            )
          }
          disabled={isSubmitted || isAnyLoading}
        >
          {isLoading.submitting ? "Submitting..." : "Submit"}
        </Button>
      </Box>
    </Stack>
  );
}
