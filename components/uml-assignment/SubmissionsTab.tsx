import {
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import StudentRow from "./StudentRow";

export default function SubmissionsTab({ exercise, userInfos = {} }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const submissions = useMemo(
    () => exercise?.studentSubmissions || [],
    [exercise?.studentSubmissions]
  );

  // Calculate stats
  const stats = useMemo(() => {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let inProgress = 0;
    let enqueued = 0;
    let processing = 0;
    let gradedCount = 0;
    let pointsSum = 0;

    submissions.forEach((sub: any) => {
      const solutions = sub.solutions || [];
      const submittedSolutions = solutions.filter((s: any) => s.submittedAt);
      const hasDraft = solutions.some((s: any) => !s.submittedAt);

      if (hasDraft) {
        inProgress++;
      } else if (submittedSolutions.length === 0) {
        return;
      }

      const latestSol = submittedSolutions[0];
      total++;

      if (latestSol?.evaluationStatus === "ENQUEUED") {
        enqueued++;
      } else if (latestSol?.evaluationStatus === "PROCESSING") {
        processing++;
      } else if (
        latestSol?.feedback?.points !== null &&
        latestSol?.feedback?.points !== undefined
      ) {
        gradedCount++;
        pointsSum += latestSol.feedback.points;
        const passThreshold = exercise.requiredPercentage || 0.5;
        const isPassed =
          latestSol.feedback.points / (exercise.totalPoints || 1) >=
          passThreshold;
        if (isPassed) {
          passed++;
        } else {
          failed++;
        }
      }
    });

    const averagePoints = gradedCount > 0 ? pointsSum / gradedCount : null;

    return {
      total,
      passed,
      failed,
      inProgress,
      enqueued,
      processing,
      averagePoints,
    };
  }, [submissions, exercise.requiredPercentage, exercise.totalPoints]);

  // Filter submissions based on search
  const filteredSubmissions = useMemo(() => {
    if (!searchTerm.trim()) return submissions;
    const lower = searchTerm.toLowerCase();
    return submissions.filter((sub: any) => {
      const userInfo = userInfos[sub.studentId];
      const nickname = userInfo?.nickname || "";
      const firstName = userInfo?.firstName || "";
      const lastName = userInfo?.lastName || "";
      const userName = userInfo?.userName || "";
      const studentId = sub.studentId;

      return (
        nickname.toLowerCase().includes(lower) ||
        firstName.toLowerCase().includes(lower) ||
        lastName.toLowerCase().includes(lower) ||
        userName.toLowerCase().includes(lower) ||
        studentId.toLowerCase().includes(lower)
      );
    });
  }, [submissions, searchTerm, userInfos]);

  return (
    <Stack spacing={3}>
      {/* Stats */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Submission Statistics
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          flexWrap="wrap"
        >
          <Chip label={`Total: ${stats.total}`} variant="outlined" />
          <Chip
            label={`Passed: ${stats.passed}`}
            color="success"
            variant="filled"
          />
          <Chip
            label={`Failed: ${stats.failed}`}
            color="error"
            variant="filled"
          />
          <Chip
            label={`In Progress: ${stats.inProgress}`}
            color="info"
            variant="filled"
          />
          <Chip
            label={
              stats.averagePoints !== null
                ? `Avg Points: ${stats.averagePoints.toFixed(1)} / ${exercise.totalPoints || 0}`
                : "Avg Points: -"
            }
            color="primary"
            variant="outlined"
          />
          {stats.enqueued > 0 && (
            <Chip
              label={`Enqueued: ${stats.enqueued}`}
              color="warning"
              variant="filled"
            />
          )}
          {stats.processing > 0 && (
            <Chip
              label={`Processing: ${stats.processing}`}
              color="warning"
              variant="filled"
            />
          )}
        </Stack>
      </Paper>

      {/* Search Box */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search by name, nickname, or student ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ borderRadius: 1 }}
      />

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        variant="outlined"
        sx={{ borderRadius: 3 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell width={50} align="center" />
              <TableCell align="center">
                <strong>Student</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Status</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Last Submission</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Attempts</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Latest Score</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.map((sub: any) => (
              <StudentRow
                key={sub.studentId}
                sub={sub}
                exercise={exercise}
                userInfo={userInfos[sub.studentId]}
              />
            ))}
            {filteredSubmissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    {searchTerm
                      ? "No students found matching your search."
                      : "No activity recorded yet."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
