"use client";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";

type StudentRow = {
  rowId: string;           // unique per row
  studentId: number;
  studentName: string;
  taskId: number;
  taskName: string;
  graded: boolean;
};

type Submission = {
  id: number;
  name: string;
  rows: StudentRow[];      // jedes bearbeitetes Task-Item eines Studenten = 1 Tabellenzeile
};

// Dummy Data
const submissions: Submission[] = [
  {
    id: 101,
    name: "Submission 1: Arrays & Loops",
    rows: [
      { rowId: "101-1-A", studentId: 1, studentName: "Alice Example", taskId: 1, taskName: "Task A", graded: false },
      { rowId: "101-2-A", studentId: 2, studentName: "Bob Student",   taskId: 1, taskName: "Task A", graded: true  },
      { rowId: "101-1-B", studentId: 1, studentName: "Alice Example", taskId: 2, taskName: "Task B", graded: false },
      { rowId: "101-3-A", studentId: 3, studentName: "Charlie Test",  taskId: 1, taskName: "Task A", graded: false },
    ],
  },
  {
    id: 102,
    name: "Submission 2: Functions",
    rows: [
      { rowId: "102-1-A", studentId: 1, studentName: "Alice Example", taskId: 1, taskName: "Task A", graded: false },
      { rowId: "102-2-B", studentId: 2, studentName: "Bob Student",   taskId: 2, taskName: "Task B", graded: false },
    ],
  },
];

export default function LecturerSubmissions() {
  const [gradedState, setGradedState] = useState<Record<string, boolean>>(
    Object.fromEntries(
      submissions.flatMap((s) => s.rows.map((r) => [r.rowId, r.graded]))
    )
  );

  const handleDownload = (row: StudentRow) => {
    console.log("Download", { submissionTask: row.taskName, student: row.studentName, rowId: row.rowId });
    // TODO: Download auslösen
  };

  const handleView = (row: StudentRow) => {
    console.log("View", { submissionTask: row.taskName, student: row.studentName, rowId: row.rowId });
    // TODO: Media View öffnen
  };

  const handleScore = (row: StudentRow) => {
    console.log("Score", { submissionTask: row.taskName, student: row.studentName, rowId: row.rowId });
    // TODO: Bewertungs-Dialog öffnen
  };

  const toggleGraded = (rowId: string) => {
    setGradedState((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {submissions.map((sub) => (
        <Accordion key={sub.id} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography fontWeight={700}>{sub.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                (ID: {sub.id})
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <TableContainer component={Paper} elevation={1}>
              <Table size="small" aria-label={`rows for submission ${sub.id}`}>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell align="center">Download</TableCell>
                    <TableCell align="center">View</TableCell>
                    <TableCell align="center">Score</TableCell>
                    <TableCell align="center">Graded</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sub.rows.map((row) => (
                    <TableRow key={row.rowId} hover>
                      <TableCell>{row.taskName}</TableCell>
                      <TableCell>{row.studentName}</TableCell>

                      <TableCell align="center">
                        <Button variant="outlined" size="small" onClick={() => handleDownload(row)}>
                          Download
                        </Button>
                      </TableCell>

                      <TableCell align="center">
                        <Button variant="outlined" size="small" onClick={() => handleView(row)}>
                          View
                        </Button>
                      </TableCell>

                      <TableCell align="center">
                        <Button variant="outlined" size="small" onClick={() => handleScore(row)}>
                          Score
                        </Button>
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                          <Checkbox
                            checked={!!gradedState[row.rowId]}
                            onChange={() => toggleGraded(row.rowId)}
                          />
                          <Typography variant="body2">Graded</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
