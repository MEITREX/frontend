"use client";

import { lecturerCreateExerciseFileMutation } from "@/__generated__/lecturerCreateExerciseFileMutation.graphql";
import { lecturerDeleteExerciseFileMutation } from "@/__generated__/lecturerDeleteExerciseFileMutation.graphql";
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
import { useConfirmation } from "@/src/useConfirmation";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SchoolIcon from "@mui/icons-material/School";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
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

const DeleteExerciseFileMutation = graphql`
  mutation lecturerDeleteExerciseFileMutation(
    $assessmentId: UUID!
    $fileId: UUID!
  ) {
    deleteExerciseFile(assessmentId: $assessmentId, fileId: $fileId) {
      id
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

// Card for the individual tasks
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
            <Chip
              size="small"
              label={`Maximum number of points: ${task.maxScore}`}
            />
          </Stack>
        }
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(task.itemId)}
            >
              Delete
            </Button>
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
                No Bloom Levels given.
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
                No skills given.
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
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
  const confirm = useConfirmation();

  const [commitCreateFile, isCreateInFlight] =
    useMutation<lecturerCreateExerciseFileMutation>(CreateExerciseFileMutation);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isEditSetModalOpen, setEditSetModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  async function deleteTask(itemId: string) {
    const assessmentId = String(submissionId);

    if (!assessmentId || !itemId) return;
    if (
      !(await confirm({
        title: "Delete Task",
        message:
          "Do you really want to delete this task? This can't be undone.",
      }))
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

  const [commitDeleteFile, isDeleteFileInFlight] =
    useMutation<lecturerDeleteExerciseFileMutation>(DeleteExerciseFileMutation);

  async function deleteFile(fileId: string) {
    const assessmentId = String(submissionId);
    if (!assessmentId || !fileId) return;

    if (
      !(await confirm({
        title: "Delete File",
        message:
          "Do you really want to delete this file? This can't be undone.",
      }))
    ) {
      return;
    }

    commitDeleteFile({
      variables: { assessmentId, fileId },

      optimisticUpdater: (store) => {
        const current = store
          .getRoot()
          .getLinkedRecord("submissionExerciseForLecturer", { assessmentId });
        if (!current) return;
        const files = current.getLinkedRecords("files") ?? [];
        const next = files.filter(
          (r) => (r.getValue("id") as string) !== fileId
        );
        current.setLinkedRecords(next, "files");
      },

      updater: (store) => {
        const deleted = store.getRootField("deleteExerciseFile");
        const deletedId = (deleted?.getValue("id") as string) || fileId;
        const current = store
          .getRoot()
          .getLinkedRecord("submissionExerciseForLecturer", { assessmentId });
        if (!current) return;
        const files = current.getLinkedRecords("files") ?? [];
        const next = files.filter(
          (r) => (r.getValue("id") as string) !== deletedId
        );
        current.setLinkedRecords(next, "files");
      },

      onError: (e) => {
        console.error("Delete file failed:", e);
        alert("Deleting the file failed. Reloading the list.");
        setFetchKey((k) => k + 1);
      },
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return setSelectedFile(null);

    if (f.type !== "application/pdf") {
      setUploadError("Please choose a pdf file.");
      return setSelectedFile(null);
    }
    if (f.size > 25 * 1024 * 1024) {
      setUploadError("The file cannot be bigger than 25 MB.");
      return setSelectedFile(null);
    }
    setSelectedFile(f);
  }

  function handleDroppedFile(file: File | null) {
    setUploadError(null);
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Please choose a pdf file.");
      setSelectedFile(null);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("The file cannot be bigger than 25 MB.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
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
      setUploadError("Please chosse a pdf file first.");
      return;
    }

    commitCreateFile({
      variables: { assessmentId, name: selectedFile!.name },
      onCompleted: (payload) => {
        const file = payload?.createExerciseFile;
        if (!file?.uploadUrl || !selectedFile) {
          setUploadError("No Upload URL given.");
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
            setUploadError(err?.message ?? "Upload failed.");
          });
      },
      onError: (e) => {
        console.error(e);
        setUploadError("Error creating file entry.");
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
          Add Task
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => setUploadOpen(true)}
        >
          Upload file
        </Button>
      </Stack>

      {/* Files display */}
      {/* Files display */}
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2 }}
      >
        {submissionExerciseForLecturer.files.map((f) => (
          <Chip
            key={f.id}
            icon={<InsertDriveFileIcon />}
            label={f.name}
            clickable
            variant="outlined"
            onClick={() => window.open(f.downloadUrl ?? "#", "_blank")}
            onDelete={(e) => {
              e.stopPropagation();
              deleteFile(f.id);
            }}
            deleteIcon={
              <DeleteIcon
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              />
            }
            sx={{
              borderRadius: 2,
              "& .MuiChip-label": { fontWeight: 500 },
            }}
          />
        ))}
      </Stack>

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
          <DialogTitle>Upload pdf</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {/* Dropzone */}
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderStyle: "dashed",
                  borderRadius: 3,
                  textAlign: "center",
                  cursor:
                    uploading || isCreateInFlight ? "not-allowed" : "pointer",
                  opacity: uploading || isCreateInFlight ? 0.7 : 1,
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (uploading || isCreateInFlight) return;
                  const f = e.dataTransfer.files?.[0] ?? null;
                  handleDroppedFile(f);
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <CloudUploadIcon />
                  <Typography variant="body1">
                    Drag file here or select from the explorer
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only pdf, max. 25 MB
                  </Typography>
                </Stack>
              </Paper>

              {/* Hidden input */}
              <input
                ref={fileInputRef}
                style={{ display: "none" }}
                type="file"
                accept=".pdf,application/pdf"
                onChange={onFileChange}
                disabled={isCreateInFlight || uploading}
              />

              {/* Selected file */}
              {selectedFile ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2">
                    File: <strong>{selectedFile.name}</strong> (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<CloseIcon />}
                    onClick={() => setSelectedFile(null)}
                    disabled={isCreateInFlight || uploading}
                  >
                    Remove
                  </Button>
                </Stack>
              ) : null}

              {uploadError ? (
                <Alert severity="error" variant="outlined">
                  {uploadError}
                </Alert>
              ) : null}

              {uploading ? <LinearProgress /> : null}
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
              Cancel
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
