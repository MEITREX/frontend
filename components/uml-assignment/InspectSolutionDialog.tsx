"use client";

import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface InspectSolutionDialogProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  solution: any;
  exercise: any;
  userInfo?: any;
}

export default function InspectSolutionDialog({
  open,
  onClose,
  studentId,
  solution,
  exercise,
  userInfo,
}: InspectSolutionDialogProps) {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyStudentId = () => {
    navigator.clipboard.writeText(studentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const isDraft = !solution?.submittedAt;
  const feedback = solution?.feedback;
  const diagramCode = solution?.diagram?.diagramCode || "";
  const studentName = userInfo?.nickname || userInfo?.firstName || "Student";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight="bold">
            {studentName}
          </Typography>
          <Tooltip title={copiedId ? "Copied!" : "Copy student ID"}>
            <IconButton size="small" onClick={handleCopyStudentId}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Submission Info */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Chip
                  label={isDraft ? "Draft" : "Submitted"}
                  size="small"
                  variant="outlined"
                  color={isDraft ? "info" : "success"}
                />
              </Stack>

              {solution?.evaluationStatus && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Evaluation:
                  </Typography>
                  <Chip
                    label={solution.evaluationStatus}
                    size="small"
                    variant="filled"
                    color={
                      solution.evaluationStatus === "ENQUEUED"
                        ? "warning"
                        : solution.evaluationStatus === "PROCESSING"
                        ? "warning"
                        : "success"
                    }
                  />
                </Stack>
              )}

              {!isDraft && solution?.submittedAt && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Submitted:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(solution.submittedAt).toLocaleString("de-DE")}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Diagram Code */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              UML Diagram Code
            </Typography>
            <Box
              sx={{
                height: "50vh",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <MainHylimoEditor
                key={`inspect-${solution?.id}`}
                readOnly={true}
                initialValue={diagramCode}
                onChange={() => {}}
              />
            </Box>
          </Box>

          {/* Feedback Section */}
          {feedback && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Feedback
                </Typography>
                <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Stack spacing={2}>
                    {feedback.points !== null && feedback.points !== undefined && (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Points:
                        </Typography>
                        <Chip
                          label={`${feedback.points} / ${exercise.totalPoints}`}
                          size="small"
                          color={
                            feedback.points / exercise.totalPoints >=
                            (exercise.requiredPercentage || 0.5)
                              ? "success"
                              : "error"
                          }
                          variant="filled"
                          sx={{ fontWeight: "bold", minWidth: 80 }}
                        />
                      </Stack>
                    )}

                    {feedback.comment && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Comment:
                        </Typography>
                        <Box sx={{ bgcolor: "action.hover", p: 1.5, borderRadius: 1 }}>
                          <ContentViewer htmlContent={feedback.comment} />
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Box>
            </>
          )}

          {!feedback && !isDraft && (
            <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: "warning.lighter" }}>
              <Typography variant="body2" color="text.secondary">
                No feedback provided yet.
              </Typography>
            </Paper>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
