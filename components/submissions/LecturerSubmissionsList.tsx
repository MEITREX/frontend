// components/submissions/LecturerSubmissionsList.tsx
"use client";

import { LecturerSubmissionsListGroupQuery } from "@/__generated__/LecturerSubmissionsListGroupQuery.graphql";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { graphql, useLazyLoadQuery } from "react-relay";

type SubmissionInfo = { assessmentId: string; name: string };
type Props = {
  courseId: string;
  submissions: SubmissionInfo[];
};

// Einzelne Submission-Gruppe lädt ihre Details selbst
function SubmissionGroup({ assessmentId, name }: SubmissionInfo) {
  const data = useLazyLoadQuery<LecturerSubmissionsListGroupQuery>(
    graphql`
      query LecturerSubmissionsListGroupQuery($assessmentId: UUID!) {
        submissionExerciseForLecturer(assessmentId: $assessmentId) {
          tasks {
            itemId
            name
            number
            maxScore
          }
          solutions {
            id
            userId
            submissionDate
            userName
            firstName
            lastName
            files {
              id
              name
              downloadUrl
            }
            result {
              status
              results {
                itemId
                score
              }
            }
          }
        }
      }
    `,
    { assessmentId }
  );
  const exercise = data.submissionExerciseForLecturer;

  // einfache Ableitung von Tabellenzeilen:
  // pro Solution (Student: userId) zeigen wir alle abgegebenen Files
  const rows = useMemo(() => {
    return (exercise?.solutions ?? []).map((sol) => ({
      key: sol.id ?? `${assessmentId}-${sol.userId}`,
      userId: sol.userId,
      files: sol.files ?? [],
      submittedAt: sol.submissionDate,
      result: sol.result,
    }));
  }, [exercise, assessmentId]);

  const handleDownload = (file: {
    id: string;
    name: string;
    downloadUrl?: string | null;
  }) => {
    window.open(file.downloadUrl ?? "#", "_blank");
  };

  const handleView = (file: {
    id: string;
    name: string;
    downloadUrl?: string | null;
  }) => {
    window.open(file.downloadUrl ?? "#", "_blank");
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography fontWeight={700}>{name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {rows.length} Abgaben · {exercise?.tasks?.length ?? 0} Tasks
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student (userId)</TableCell>
                <TableCell>Files</TableCell>
                <TableCell align="center">Download</TableCell>
                <TableCell align="center">View</TableCell>
                <TableCell align="center">
                  Bewertung (falls vorhanden)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.key} hover>
                  <TableCell>{r.userId}</TableCell>
                  <TableCell>
                    {(r.files ?? []).map((f) => f.name).join(", ")}
                  </TableCell>
                  <TableCell align="center">
                    {(r.files ?? []).map((f) => (
                      <Button
                        key={f.id}
                        variant="outlined"
                        size="small"
                        onClick={() => handleDownload(f)}
                      >
                        {f.name}
                      </Button>
                    ))}
                  </TableCell>
                  <TableCell align="center">
                    {(r.files ?? []).map((f) => (
                      <Button
                        key={f.id}
                        variant="outlined"
                        size="small"
                        onClick={() => handleView(f)}
                      >
                        {f.name}
                      </Button>
                    ))}
                  </TableCell>
                  <TableCell align="center">
                    {r.result?.status ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary">
                      Keine Abgaben.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
}

export default function LecturerSubmissionsList({
  courseId,
  submissions,
}: Props) {
  // einfache Filter wie zuvor
  const [selectedId, setSelectedId] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    const l = search.trim().toLowerCase();
    const base =
      selectedId === "ALL"
        ? submissions
        : submissions.filter((s) => s.assessmentId === selectedId);
    if (!l) return base;
    return base.filter((s) => s.name.toLowerCase().includes(l));
  }, [submissions, selectedId, search]);

  if (!submissions.length) {
    return (
      <Typography color="text.secondary">
        Keine Submission-Contents in diesem Kurs.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {/* Filterleiste */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="submission-select-label">Submission</InputLabel>
          <Select
            labelId="submission-select-label"
            label="Submission"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <MenuItem value="ALL">Alle</MenuItem>
            {submissions.map((s) => (
              <MenuItem key={s.assessmentId} value={s.assessmentId}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Suche Submission-Name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </Stack>

      {/* Gruppen */}
      {filtered.map((s) => (
        <SubmissionGroup
          key={s.assessmentId}
          assessmentId={s.assessmentId}
          name={s.name}
        />
      ))}
    </Box>
  );
}
