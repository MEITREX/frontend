"use client";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { Fragment, useState } from "react";

interface StudentRowProps {
  sub: any;
  exercise: any;
}

export default function StudentRow({ sub, exercise }: StudentRowProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const solutions = sub.solutions || [];
  const submittedSolutions = solutions.filter((s: any) => s.submittedAt);
  const latestSol = submittedSolutions[submittedSolutions.length - 1];
  const hasDraft = solutions.some((s: any) => !s.submittedAt);

  const total = exercise.totalPoints || 0;
  const passThreshold = exercise.requiredPercentage || 0.5;

  /**
   * Internal helper to render the score chip with consistent alignment logic
   */
  const renderScoreChip = (
    points: number | null | undefined,
    isDraft: boolean
  ) => {
    if (isDraft || points === null || points === undefined) {
      return (
        <Chip label="-" size="small" variant="outlined" sx={{ width: 45 }} />
      );
    }
    const isPassed = points / total >= passThreshold;
    return (
      <Chip
        label={`${points} / ${total}`}
        size="small"
        color={isPassed ? "success" : "error"}
        variant="filled"
        sx={{ fontWeight: "bold", minWidth: 65 }}
      />
    );
  };

  return (
    <Fragment>
      <TableRow
        hover
        onClick={() => setOpen(!open)}
        sx={{ cursor: "pointer", "& > *": { borderBottom: "unset" } }}
      >
        <TableCell align="center">
          <IconButton size="small">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell align="center">
          <Typography variant="body2" fontWeight="bold">
            {sub.studentId.split("-")[0]}...
          </Typography>
          {hasDraft && (
            <Chip
              label="Draft in progress"
              size="small"
              variant="outlined"
              color="info"
              sx={{ mt: 0.5, height: 20, fontSize: "0.65rem" }}
            />
          )}
        </TableCell>

        <TableCell align="center">
          {latestSol?.submittedAt
            ? new Date(latestSol.submittedAt).toLocaleDateString("de-DE")
            : "No Submission"}
        </TableCell>

        <TableCell align="center">{submittedSolutions.length}</TableCell>

        <TableCell align="center">
          {renderScoreChip(latestSol?.feedback?.points, false)}
        </TableCell>

        <TableCell align="right">
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            variant="text"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Inspect
          </Button>
        </TableCell>
      </TableRow>

      {/* --- Collapsible History --- */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Attempt History
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">
                      <strong>Date</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Score</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solutions.map((sol: any, idx: number) => {
                    const isDraft = !sol.submittedAt;
                    return (
                      <TableRow key={sol.id || idx}>
                        <TableCell align="center">
                          {isDraft
                            ? "Active Draft"
                            : new Date(sol.submittedAt).toLocaleString("de-DE")}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={isDraft ? "Draft" : "Submitted"}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {renderScoreChip(sol.feedback?.points, isDraft)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}
