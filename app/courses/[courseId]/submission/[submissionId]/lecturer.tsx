"use client";

import { lecturerCreateExerciseFileMutation } from "@/__generated__/lecturerCreateExerciseFileMutation.graphql";
import { lecturerEditSubmissionQuery } from "@/__generated__/lecturerEditSubmissionQuery.graphql";
import { lecturerRemoveTaskMutation } from "@/__generated__/lecturerRemoveTaskMutation.graphql";
import type { lecturerSubmissionExerciseForLecturerQuery as Q } from "@/__generated__/lecturerSubmissionExerciseForLecturerQuery.graphql";
import { lecturerSubmissionExerciseForLecturerQuery } from "@/__generated__/lecturerSubmissionExerciseForLecturerQuery.graphql";
import { ES2022Error } from "@/components/ErrorContext";
import { PageError } from "@/components/PageError";
import { SubmissionExerciseModal } from "@/components/SubmissionExerciseModal";
import AddTaskDialog from "@/components/submissions/AddTaskDialog";
import EditTaskDialog from "@/components/submissions/EditTaskDialog";
import SubmissionsHeader from "@/components/submissions/SubmissionsHeader";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SchoolIcon from "@mui/icons-material/School";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

const RootQuery = graphql`
  query lecturerEditSubmissionQuery($id: UUID!, $courseId: UUID!) {
    ...MediaRecordSelector

    contentsByIds(ids: [$id]) {
      id
      metadata {
        name
        chapterId
        type
        suggestedDate
        rewardPoints
        tagNames
      }
      ... on SubmissionAssessment {
        items {
          id
        }
        assessmentMetadata {
          skillPoints
          skillTypes
          initialLearningInterval
        }
      }
    }
  }
`;

const GetSubmission = graphql`
  query lecturerSubmissionExerciseForLecturerQuery($assessmentId: UUID!) {
    submissionExerciseForLecturer(assessmentId: $assessmentId) {
      assessmentId
      courseId
      endDate
      files {
        downloadUrl
        id
        name
        uploadUrl
      }
      solutions {
        files {
          downloadUrl
          id
          name
          uploadUrl
        }
        id
        result {
          id
          results {
            number
            score
            itemId
          }
          status
        }
        submissionDate
        userId
      }
      tasks {
        item {
          associatedBloomLevels
          associatedSkills {
            id
            isCustomSkill
            skillCategory
            skillLevels {
              analyze {
                value
              }
              apply {
                value
              }
              create {
                value
              }
              evaluate {
                value
              }
              remember {
                value
              }
              understand {
                value
              }
            }
            skillName
          }
          id
        }
        itemId
        maxScore
        name
        number
      }
    }
  }
`;

const LectruerDeleteTaskMutation = graphql`
  mutation lecturerRemoveTaskMutation($assessmentId: UUID!, $itemId: UUID!) {
    mutateSubmission(assessmentId: $assessmentId) {
      removeTask(itemId: $itemId) {
        assessmentId
        tasks {
          itemId
          name
          number
          maxScore
        }
      }
    }
  }
`;

const CreateExerciseFileMutation = graphql`
  mutation lecturerCreateExerciseFileMutation(
    $assessmentId: UUID!
    $name: String!
  ) {
    createExerciseFile(assessmentId: $assessmentId, name: $name) {
      id
      name
      uploadUrl
      downloadUrl
    }
  }
`;

type Task = NonNullable<
  Q["response"]["submissionExerciseForLecturer"]
>["tasks"][number];

function SkillLevelsChips({
  levels,
}: {
  levels: NonNullable<
    NonNullable<Task["item"]>["associatedSkills"][number]["skillLevels"]
  >;
}) {
  const compact = [
    { k: "R", v: levels.remember?.value },
    { k: "U", v: levels.understand?.value },
    { k: "A", v: levels.apply?.value },
    { k: "An", v: levels.analyze?.value },
    { k: "E", v: levels.evaluate?.value },
    { k: "C", v: levels.create?.value },
  ];
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {compact.map(({ k, v }) => (
        <Chip
          key={k}
          size="small"
          label={`${k}:${v ?? 0}`}
          variant="outlined"
        />
      ))}
    </Stack>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  const bloom = task.item?.associatedBloomLevels ?? [];
  const skills = task.item?.associatedSkills ?? [];

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">
              {task.number}. {task.name}
            </Typography>
            <Chip size="small" label={`Max: ${task.maxScore}`} />
          </Stack>
        }
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Aufgabe bearbeiten">
              <IconButton onClick={() => onEdit(task)} aria-label="edit-task">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Aufgabe löschen">
              <IconButton
                onClick={() => onDelete(task.itemId)}
                aria-label="delete-task"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <CardContent>
        <Stack spacing={2}>
          {/* Bloom Levels */}
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <PsychologyIcon fontSize="small" />
              <Typography variant="subtitle2">Bloom Levels</Typography>
            </Stack>
            {bloom.length ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {bloom.map((b) => (
                  <Chip key={b} label={b} size="small" variant="outlined" />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keine Bloom Levels hinterlegt.
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Skills */}
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <SchoolIcon fontSize="small" />
              <Typography variant="subtitle2">Skills</Typography>
            </Stack>
            {skills.length ? (
              <Stack spacing={1.5}>
                {skills.map((s) => (
                  <Paper
                    key={s.id}
                    variant="outlined"
                    sx={{ p: 1.25, borderRadius: 2 }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1.5}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip size="small" label={s.skillName} />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={s.skillCategory}
                        />
                        {s.isCustomSkill ? (
                          <Chip
                            size="small"
                            variant="outlined"
                            label="Custom"
                          />
                        ) : null}
                      </Stack>
                      {s.skillLevels ? (
                        <SkillLevelsChips levels={s.skillLevels} />
                      ) : null}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keine Skills hinterlegt.
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(task)}
        >
          Bearbeiten
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(task.itemId)}
        >
          Löschen
        </Button>
      </CardActions>
    </Card>
  );
}

export default function LecturerSubmission() {
  const { submissionId, courseId } = useParams();
  const [error, setError] = useState<ES2022Error | null>(null);
  const errorContext = useMemo(() => ({ error, setError }), [error, setError]);
  const [fetchKey, setFetchKey] = useState(0);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [commitCreateFile, isCreateInFlight] =
    useMutation<lecturerCreateExerciseFileMutation>(CreateExerciseFileMutation);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isEditSetModalOpen, setEditSetModalOpen] = useState(false);

  const { contentsByIds, ...mediaSelectorQuery } =
    useLazyLoadQuery<lecturerEditSubmissionQuery>(RootQuery, {
      id: submissionId,
      courseId,
    });

  const { submissionExerciseForLecturer } =
    useLazyLoadQuery<lecturerSubmissionExerciseForLecturerQuery>(
      GetSubmission,
      { assessmentId: submissionId },
      { fetchKey, fetchPolicy: "network-only" }
    );

  const content = contentsByIds[0];

  const extendedContent = {
    ...content,
    endDate: submissionExerciseForLecturer.endDate,
  } as const;

  const [commitDeleteTask] = useMutation<lecturerRemoveTaskMutation>(
    LectruerDeleteTaskMutation
  );

  // Function for deleting tasks
  function deleteTask(itemId: string) {
    const assessmentId = String(submissionId);

    if (!assessmentId || !itemId) return;
    if (
      !confirm("Do you really want to delete this task? This can't be undone.")
    )
      return;

    commitDeleteTask({
      variables: { assessmentId, itemId },
      updater: (store) => {
        const payload = store.getRootField("mutateSubmission");
        const removed = payload?.getLinkedRecord("removeTask");
        if (!removed) return;

        const newTasks = removed.getLinkedRecords("tasks") ?? [];
        const current = store
          .getRoot()
          .getLinkedRecord("submissionExerciseForLecturer", { assessmentId });
        if (!current) return;

        current.setLinkedRecords(newTasks, "tasks");
      },
      onCompleted: () => setFetchKey((k) => k + 1),
      onError: (e: any) => {
        console.error("DeleteTask error:", e);
        alert("Deleting the task failed. Please try again.");
        setFetchKey((k) => k + 1);
      },
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return setSelectedFile(null);

    if (f.type !== "application/pdf") {
      setUploadError("Bitte eine PDF-Datei wählen.");
      return setSelectedFile(null);
    }
    if (f.size > 25 * 1024 * 1024) {
      setUploadError("Datei ist größer als 25 MB.");
      return setSelectedFile(null);
    }
    setSelectedFile(f);
  }

  // Upload file to upload endpoint
  async function doUpload(assessmentId: string, file: File, uploadUrl: string) {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/pdf" },
      body: file,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${txt}`);
    }
  }

  // File Upload function
  function onSubmitUpload() {
    setUploadError(null);
    const assessmentId = String(submissionId);
    if (!selectedFile) {
      setUploadError("Bitte zuerst eine PDF-Datei auswählen.");
      return;
    }

    commitCreateFile({
      variables: { assessmentId, name: selectedFile!.name },
      onCompleted: (payload) => {
        const file = payload?.createExerciseFile;
        if (!file?.uploadUrl || !selectedFile) {
          setUploadError("Upload-URL oder Datei fehlt.");
          return;
        }
        setUploading(true);
        doUpload(String(submissionId), selectedFile, file.uploadUrl)
          .then(() => {
            setUploading(false);
            setUploadOpen(false);
            setSelectedFile(null);
            setFetchKey((k) => k + 1);
          })
          .catch((err) => {
            setUploading(false);
            setUploadError(err?.message ?? "Upload fehlgeschlagen.");
          });
      },
      onError: (e) => {
        console.error(e);
        setUploadError("Erstellen des Datei-Eintrags fehlgeschlagen.");
      },
    });
  }

  // sort tasks alphabetically / numerically by name
  const sortedTasks = [...(submissionExerciseForLecturer?.tasks ?? [])].sort(
    (a, b) => {
      const extractNum = (str: string) => {
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : Infinity;
      };
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      const numA = extractNum(nameA);
      const numB = extractNum(nameB);
      if (numA !== Infinity || numB !== Infinity) {
        return numA - numB;
      }
      return nameA.localeCompare(nameB);
    }
  );

  if (!(content.metadata.type === "SUBMISSION")) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content not of type submission."
      />
    );
  }

  return (
    <>
      <SubmissionsHeader
        openEditSubmissionModal={() => setEditSetModalOpen(true)}
        content={extendedContent}
      />

      {/* Actions Row for buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 2, mt: 2 }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddOpen(true)}
        >
          Task hinzufügen
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => setUploadOpen(true)}
        >
          Datei hochladen
        </Button>
      </Stack>

      {/* Files display */}
      {submissionExerciseForLecturer.files.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Dateien
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {submissionExerciseForLecturer.files.map((f) => (
              <Chip
                key={f.id}
                icon={<InsertDriveFileIcon />}
                label={f.name}
                component="a"
                href={f.downloadUrl ?? "#"}
                clickable
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      ) : null}

      {/* Tasks Grid */}
      {sortedTasks.length ? (
        <Grid container spacing={2}>
          {sortedTasks.map((taskItem) => (
            <Grid item xs={12} key={taskItem.itemId}>
              <TaskCard
                task={taskItem}
                onEdit={(t) => {
                  setIsEditTaskOpen(true);
                  setSelectedTask(t);
                }}
                onDelete={(id) => deleteTask(id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No tasks found.
        </Typography>
      )}

      <SubmissionExerciseModal
        onClose={() => setEditSetModalOpen(false)}
        isOpen={isEditSetModalOpen}
        _existingSubmission={extendedContent}
        chapterId={content.metadata.chapterId}
        tasks={submissionExerciseForLecturer.tasks}
      />

      {/* Dialog for adding Tasks */}
      {isAddOpen ? (
        <AddTaskDialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          setIsAddOpen={setIsAddOpen}
          onAdded={() => setFetchKey((k) => k + 1)}
        />
      ) : null}

      {/* Edit singular Tasks */}
      {isEditTaskOpen && selectedTask ? (
        <EditTaskDialog
          open={isEditTaskOpen}
          onClose={() => setIsEditTaskOpen(false)}
          setIsAddOpen={setIsEditTaskOpen}
          onAdded={() => setFetchKey((k) => k + 1)}
          taskProp={selectedTask}
        />
      ) : null}

      {/* Upload file Dialog */}
      {isUploadOpen ? (
        <Dialog
          open={isUploadOpen}
          onClose={() => {
            if (!uploading && !isCreateInFlight) {
              setUploadOpen(false);
              setSelectedFile(null);
              setUploadError(null);
            }
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>PDF hochladen</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={onFileChange}
                disabled={isCreateInFlight || uploading}
              />
              {selectedFile ? (
                <Typography variant="body2">
                  Datei: <strong>{selectedFile.name}</strong> (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              ) : null}
              {uploadError ? (
                <Typography variant="body2" color="error">
                  {uploadError}
                </Typography>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setUploadOpen(false);
                setSelectedFile(null);
                setUploadError(null);
              }}
              disabled={isCreateInFlight || uploading}
            >
              Abbrechen
            </Button>
            <Button
              variant="contained"
              onClick={onSubmitUpload}
              disabled={!selectedFile || isCreateInFlight || uploading}
            >
              {uploading ? "Lade hoch..." : "Hochladen"}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </>
  );
}
