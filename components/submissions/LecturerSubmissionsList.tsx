"use client";

import { LecturerSubmissionsListGroupQuery } from "@/__generated__/LecturerSubmissionsListGroupQuery.graphql";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

type SubmissionInfo = { assessmentId: string; name: string };
type Props = {
  courseId: string;
  submissions: SubmissionInfo[];
};

type TaskRow = {
  itemId: string;
  name: string | null;
  number: number | null;
  maxScore: number | null;
};

type ResultRow = {
  id?: string | null;
  status?: string | null;
  results?: { itemId: string; score: number }[] | null;
};

const UpdateResultMutation = graphql`
  mutation LecturerSubmissionsListUpdateResultMutation($result: InputResult!) {
    updateResult(result: $result) {
      id
      status
      results {
        itemId
        score
        number
      }
    }
  }
`;

function GradingDialog({
  open,
  onClose,
  tasks,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  tasks: TaskRow[];
  initial: ResultRow | undefined | null;
  onSave: (payload: {
    status: string | null;
    results: { itemId: string; score: number | null }[];
  }) => void;
}) {
  const initialMap = useMemo(() => {
    const m = new Map<string, number | null>();
    initial?.results?.forEach((r) => m.set(r.itemId, r.score ?? 0));
    return m;
  }, [initial]);

  const [status, setStatus] = useState<string>(initial?.status ?? "pending");
  const [scores, setScores] = useState<Record<string, string>>(() => {
    const obj: Record<string, string> = {};
    tasks.forEach((t) => {
      const val = initialMap.get(t.itemId);
      obj[t.itemId] = (val ?? 0).toString();
    });
    return obj;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit grading</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="grading-status-label">Status</InputLabel>
            <Select
              labelId="grading-status-label"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="pending">pending</MenuItem>
              <MenuItem value="passed">passed</MenuItem>
              <MenuItem value="failed">failed</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography variant="subtitle2">Scores per task</Typography>
            {tasks.map((t) => (
              <Box
                key={t.itemId}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">
                  {t.number != null ? `${t.number}. ` : ""}
                  {t.name ?? t.itemId}
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  inputProps={{ min: 0, step: 1, max: t.maxScore ?? undefined }}
                  value={scores[t.itemId] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setScores((s) => ({ ...s, [t.itemId]: v }));
                  }}
                  helperText={
                    t.maxScore != null ? `max ${t.maxScore}` : undefined
                  }
                />
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            onSave({
              status,
              results: tasks.map((t) => ({
                itemId: t.itemId,
                score:
                  scores[t.itemId] === ""
                    ? null
                    : Math.max(0, Math.floor(Number(scores[t.itemId]))),
              })),
            })
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SubmissionGroup({ assessmentId, name }: SubmissionInfo) {
  const data = useLazyLoadQuery<LecturerSubmissionsListGroupQuery>(
    graphql`
      query LecturerSubmissionsListGroupQuery($assessmentId: UUID!) {
        submissionExerciseForLecturer(assessmentId: $assessmentId) {
          courseId
          endDate
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
              id
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
  const [commitUpdateResult, isUpdating] = useMutation(UpdateResultMutation);
  const deadlineISO = exercise?.endDate ?? null; // ggf. endDate/dueDate
  const deadlineDate = deadlineISO ? new Date(deadlineISO) : null;
  const now = new Date();
  const isOpen = deadlineDate ? now <= deadlineDate : true;

  const formatDT = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const [editing, setEditing] = useState<{
    open: boolean;
    userId: string;
    solutionId: string;
    resultId: string | null | undefined;
    initial: ResultRow | null | undefined;
  } | null>(null);

  const rows = useMemo(() => {
    return (exercise?.solutions ?? []).map((sol) => {
      const displayName =
        [sol.lastName, sol.firstName].filter(Boolean).join(", ") ||
        sol.userName ||
        sol.userId;

      return {
        key: sol.id ?? `${assessmentId}-${sol.userId}`,
        solutionId: sol.id!,
        userId: sol.userId,
        displayName,
        files: sol.files ?? [],
        submittedAt: sol.submissionDate,
        result: sol.result
          ? {
              id: sol.result.id,
              status: sol.result.status ?? null,
              results: (sol.result.results ?? []).map((r) => ({
                itemId: r.itemId,
                score: r.score,
              })),
            }
          : null,
        resultId: sol.result?.id ?? null,
      };
    });
  }, [exercise, assessmentId]);

  const tasks: TaskRow[] = useMemo(
    () =>
      (exercise?.tasks ?? []).map((t) => ({
        itemId: t.itemId,
        name: t.name,
        number: t.number,
        maxScore: t.maxScore ?? null,
      })),
    [exercise]
  );

  const rowBg = (
    status: string | null | undefined,
    theme: any,
    opacity = 0.08
  ) => {
    const s = (status ?? "pending").toLowerCase();
    if (s === "passed") return alpha(theme.palette.success.main, opacity);
    if (s === "failed") return alpha(theme.palette.error.main, opacity);
    // pending / unknown
    return alpha(theme.palette.warning.main, opacity);
  };

  const isPending = (status?: string | null) =>
    (status ?? "").toLowerCase() === "pending";

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

  const openEdit = (r: (typeof rows)[number]) =>
    setEditing({
      open: true,
      userId: r.userId,
      solutionId: r.solutionId,
      resultId: r.resultId,
      initial: r.result,
    });

  const closeEdit = () => setEditing(null);

  const saveGrading = (payload: {
    status: string | null;
    results: { itemId: string; score: number | null }[];
  }) => {
    if (!editing) return;
    const resultId = editing.resultId;
    const courseId = exercise?.courseId;
    if (!resultId || !courseId) {
      closeEdit();
      return;
    }

    const variables = {
      result: {
        id: resultId,
        assessmentId,
        courseId,
        status: payload.status,
        results: payload.results
          .filter((r) => r.score != null)
          .map((r) => ({ itemId: r.itemId, score: r.score as number })),
      },
    };

    commitUpdateResult({
      variables,
      optimisticResponse: {
        updateResult: {
          id: resultId,
          status: payload.status,
          results: payload.results
            .filter((r) => r.score != null)
            .map((r) => ({
              itemId: r.itemId,
              score: r.score as number,
              number: null,
            })),
        },
      },
      onCompleted: () => closeEdit(),
      onError: () => closeEdit(),
    });
  };

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography fontWeight={700}>{name}</Typography>

            <Typography variant="body2" color="text.secondary">
              {rows.length} Submissions · {exercise?.tasks?.length ?? 0} Tasks
            </Typography>

            {deadlineISO ? (
              <Chip
                size="small"
                label={`${isOpen ? "Open until" : "Closed"} ${formatDT(
                  deadlineISO
                )}`}
                color={isOpen ? "success" : "default"}
                variant={isOpen ? "filled" : "outlined"}
              />
            ) : (
              <Chip size="small" label="No deadline" variant="outlined" />
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>View Solution</TableCell>
                  <TableCell align="center">Grading</TableCell>
                  <TableCell align="center">Edit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.key}
                    hover
                    sx={(theme) => ({
                      backgroundColor: rowBg(r.result?.status, theme, 0.08),
                      transition: "background-color 120ms ease",
                      "&:hover": {
                        backgroundColor: rowBg(r.result?.status, theme, 0.16),
                      },
                    })}
                  >
                    <TableCell
                      sx={{
                        fontWeight: isPending(r.result?.status) ? 700 : 400,
                      }}
                    >
                      {r.displayName}
                    </TableCell>
                    <TableCell>
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
                     <TableCell
                     align="center"
                      sx={{
                        fontWeight: isPending(r.result?.status) ? 700 : 400,
                      }}
                    >
                      {r.result?.status ?? "—"}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        disabled={isUpdating || !r.resultId}
                        onClick={() => openEdit(r)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        No submissions yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {editing && (
        <GradingDialog
          open={editing.open}
          onClose={closeEdit}
          tasks={tasks}
          initial={editing.initial}
          onSave={saveGrading}
        />
      )}
    </>
  );
}

export default function LecturerSubmissionsList({
  courseId,
  submissions,
}: Props) {
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
        No Submissions were created in this course yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
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
            <MenuItem value="ALL">All</MenuItem>
            {submissions.map((s) => (
              <MenuItem key={s.assessmentId} value={s.assessmentId}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Search for submission name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
      </Stack>

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
