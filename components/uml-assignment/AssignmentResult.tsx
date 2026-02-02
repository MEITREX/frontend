"use client";

import AssessmentIcon from "@mui/icons-material/Assessment";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  alpha,
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";

type Input = {
  feedback: string;
  score: number;
  totalPoints: number;
  requiredPercentage: number;
};

export default function AssignmentResult({
  feedback,
  score,
  totalPoints,
  requiredPercentage,
}: Input) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const percentage = totalPoints > 0 ? score / totalPoints : 0;
  const isPassed = percentage >= requiredPercentage;

  return (
    <Box sx={{ width: "100%", py: 1 }}>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: 3,
          backgroundColor: isPassed
            ? alpha(theme.palette.success.main, 0.04)
            : alpha(theme.palette.error.main, 0.04),
          borderColor: isPassed ? "success.light" : "error.light",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 3,
            py: 1.5,
            cursor: "pointer",
            "&:hover": { bgcolor: alpha(theme.palette.action.active, 0.02) },
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <AssessmentIcon color={isPassed ? "success" : "error"} />
            <Box>
              <Typography variant="subtitle1" fontWeight="700">
                Result: {score} / {totalPoints} ({(percentage * 100).toFixed(0)}
                %)
              </Typography>
            </Box>
            <Chip
              icon={isPassed ? <CheckCircleIcon /> : <CancelIcon />}
              label={isPassed ? "Passed" : "Failed"}
              color={isPassed ? "success" : "error"}
              size="small"
              variant="filled"
              sx={{ fontWeight: "bold", height: 28 }}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              variant="button"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              {expanded ? "Hide Details" : "Show Detailed Feedback"}
            </Typography>
            <IconButton
              size="small"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "0.2s",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Collapse in={expanded} timeout="auto">
          <Box sx={{ px: 3, pb: 3, pt: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: isPassed
                  ? alpha(theme.palette.success.main, 0.2)
                  : alpha(theme.palette.error.main, 0.2),
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
                sx={{
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: 1,
                }}
              >
                Automated Feedback
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-line", color: "text.primary" }}
              >
                {feedback || "No specific feedback provided for this attempt."}
              </Typography>
            </Paper>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}