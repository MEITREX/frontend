"use client"; // Required for hooks like useParams and useState

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { ChangeEvent, FC, MouseEvent, useMemo, useRef, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

// --- MUI Icons ---
import { studentCreateSolutionFileMutation } from "@/__generated__/studentCreateSolutionFileMutation.graphql";
import { studentCreateSolutionMutation } from "@/__generated__/studentCreateSolutionMutation.graphql";
import { studentSubmissionExerciseByUserQuery } from "@/__generated__/studentSubmissionExerciseByUserQuery.graphql";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

// I've kept the name the same to avoid breaking changes.
const GetSubmissionQuery = graphql`
  query studentSubmissionExerciseByUserQuery($assessmentId: UUID!) {
    submissionExerciseByUser(assessmentId: $assessmentId) {
      assessmentId
      endDate
      files {
        name
        downloadUrl
      }
      tasks {
        name
        maxScore
        number
      }
      solutions {
        id
        submissionDate
        files {
          name
          downloadUrl
        }
        result {
          results {
            score
            number
          }
          status
        }
      }
    }
  }
`;

const CreateSolutionFileMutation = graphql`
  mutation studentCreateSolutionFileMutation(
    $assessmentId: UUID!
    $name: String!
    $solutionId: UUID!
  ) {
    createSolutionFile(
      assessmentId: $assessmentId
      name: $name
      solutionId: $solutionId
    ) {
      id
      name
      uploadUrl
      downloadUrl
    }
  }
`;

const CreateSolutionMutation = graphql`
  mutation studentCreateSolutionMutation(
    $courseId: UUID!
    $submissionExerciseId: UUID!
  ) {
    uploadSolution(
      solution: {
        courseId: $courseId
        submissionExerciseId: $submissionExerciseId
      }
    ) {
      id
    }
  }
`;

const FileListItem: FC<{ name: string; downloadUrl: string }> = ({
  name,
  downloadUrl,
}) => {
  const handleDownload = (e: MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  return (
    <Chip
      icon={<InsertDriveFileIcon />}
      label={name}
      onClick={() => window.open(downloadUrl, "_blank")}
      onDelete={handleDownload}
      deleteIcon={<DownloadIcon />}
      variant="outlined"
    />
  );
};

// Main Component
export default function StudentSubmissionView() {
  const { courseId, submissionId } = useParams();
  const assessmentId = String(submissionId);

  // State to force a refetch of the query after a mutation
  const [fetchKey, setFetchKey] = useState(0);

  const data = useLazyLoadQuery<studentSubmissionExerciseByUserQuery>(
    GetSubmissionQuery,
    { assessmentId },
    { fetchKey, fetchPolicy: "network-only" }
  );

  const submissionData = data.submissionExerciseByUser;

  // State for the upload dialog
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const [commitCreateFile, isCreateFileInFlight] =
    useMutation<studentCreateSolutionFileMutation>(CreateSolutionFileMutation);
  const [commitCreateSolution, isCreateSolutionInFlight] =
    useMutation<studentCreateSolutionMutation>(CreateSolutionMutation);

  const latestSolution =
    submissionData.solutions && submissionData.solutions.length > 0
      ? submissionData.solutions[submissionData.solutions.length - 1]
      : null;

  const {
    totalMaxScore,
    achievedScore,
    taskMaxScoreMap,
    isPastDeadline,
    formattedEndDate,
  } = useMemo(() => {
    const maxScoreMap = new Map<number, number>();
    submissionData.tasks.forEach((task) =>
      maxScoreMap.set(task.number, task.maxScore)
    );

    const total = submissionData.tasks.reduce(
      (sum: number, task) => sum + task.maxScore,
      0
    );

    const achieved =
      latestSolution?.result?.results.reduce(
        (sum: number, res) => sum + res.score,
        0
      ) ?? 0;

    const endDate = submissionData.endDate
      ? new Date(submissionData.endDate)
      : null;
    const pastDeadline = endDate ? endDate < new Date() : false;

    return {
      totalMaxScore: total,
      achievedScore: achieved,
      taskMaxScoreMap: maxScoreMap,
      isPastDeadline: pastDeadline,
      formattedEndDate: endDate?.toLocaleString(),
    };
  }, [submissionData.tasks, submissionData.endDate, latestSolution]);

  const handleAddSolution = () => {
    commitCreateSolution({
      variables: {
        courseId: courseId,
        submissionExerciseId: assessmentId,
      },
      onCompleted: () => {
        setFetchKey((prev) => prev + 1);
      },
      onError: (err) => {
        console.error("Error creating solution:", err);
      },
    });
  };

  const handleDroppedFile = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Invalid file type. Only PDF files are accepted.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File is too large. The maximum size is 25 MB.");
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleDroppedFile(file);
  };

  const handleCloseDialog = () => {
    if (!selectedFile || !latestSolution) return;
    setUploadOpen(false);
    setSelectedFile(null);
    setUploadError(null);
  };

  async function doUpload(file: File, uploadUrl: string) {
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

  const onSubmitUpload = async () => {
    if (!selectedFile || !latestSolution) return;

    setUploading(true);
    setUploadError(null);

    commitCreateFile({
      variables: {
        assessmentId: assessmentId,
        solutionId: latestSolution.id!,
        name: selectedFile.name,
      },
      onCompleted: (response) => {
        const file = response.createSolutionFile
        if (!file?.uploadUrl || !selectedFile) {
          setUploadError("No Upload URL given.");
          return;
        }
        setUploading(true);
        doUpload(selectedFile, file.uploadUrl)
          .then(() => {
            setUploading(false);
            handleCloseDialog();
            setFetchKey((k) => k + 1);
          })
          .catch((err) => {
            setUploading(false);
            setUploadError(err?.message ?? "Upload failed.");
          });
        setUploading(false);
        setFetchKey((prev) => prev + 1);

      },
      onError: (err) => {
        setUploading(false);
        setUploadError("Could not create file entry for upload.");
        console.error(err);
      },
    });
  };

  const status = latestSolution?.result?.status ?? "pending";
  const statusColorMap = {
    pending: "warning",
    passed: "success",
    failed: "error",
  } as const;

  const statusColor =
    statusColorMap[status as keyof typeof statusColorMap] ?? "default";

  return (
    <Stack spacing={3}>
      {/* SECTION 1: Provided Files */}
      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          Provided Files
        </Typography>
        {submissionData.files.length > 0 ? (
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {submissionData.files
              .filter((file) => Boolean(file.downloadUrl))
              .map((file, i) => (
                <FileListItem
                  key={i + 1}
                  name={file.name}
                  downloadUrl={file.downloadUrl!}
                />
              ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ pt: 1 }}>
            No files were provided for this submission.
          </Typography>
        )}
      </Paper>

      {/* SECTION 2: Your Submission */}
      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: 2 }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            Your Submission
          </Typography>
          {formattedEndDate && (
            <Chip
              label={`Deadline: ${formattedEndDate}`}
              color={isPastDeadline ? "error" : "default"}
              variant="outlined"
              className="font-semibold"
            />
          )}
        </Stack>
        <Divider sx={{ my: 2 }} />

        {!latestSolution ? (
          <Box>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              You have not started a submission.
            </Typography>
            <Button
              variant="contained"
              onClick={handleAddSolution}
              disabled={isPastDeadline || isCreateSolutionInFlight}
            >
              {isCreateSolutionInFlight ? "Creating..." : "Add Solution"}
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">Last Changed on:</Typography>
              <Typography color="text.secondary">
                {latestSolution.submissionDate
                  ? new Date(latestSolution.submissionDate).toLocaleString()
                  : "Nothing submitted yet"}
              </Typography>
            </Stack>

            <Divider />

            {/*TODO: Change these List Items to be deletable instead of downloadable */}
            <Typography variant="subtitle1">Submitted Files:</Typography>
            {latestSolution.files.length > 0 ? (
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {latestSolution.files
                  .filter((file) => file.downloadUrl)
                  .map((file, i) => (
                    <FileListItem
                      key={i + 1}
                      name={file.name}
                      downloadUrl={file.downloadUrl!}
                    />
                  ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No files uploaded yet.
              </Typography>
            )}

            <Button
              variant="contained"
              onClick={() => setUploadOpen(true)}
              disabled={isPastDeadline}
            >
              Upload File
            </Button>
          </Stack>
        )}
        {isPastDeadline && (
          <Alert severity={latestSolution?.files.length ? "warning" : "error"} sx={{ mt: 2 }}>
            The deadline for this submission has passed. You can no longer make
            changes.
          </Alert>
        )}
      </Paper>

      {/* SECTION 3: Evaluation (only shown if a solution exists)*/}
      {isPastDeadline && (
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, boxShadow: 2 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" gutterBottom>
              Evaluation:
            </Typography>
            <Chip label={status.toLocaleUpperCase()} color={statusColor} />
          </Stack>
          {status !== "pending" ? (
            <Stack spacing={2}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="baseline"
                flexWrap="wrap"
              >
                <Typography variant="h4">
                  {achievedScore} / {totalMaxScore} Points
                </Typography>
              </Stack>

              <Box>
                {submissionData.tasks.length >= 3 || showDetails ? (
                  <>
                    <Typography variant="h5" gutterBottom>
                      Detailed Feedback
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack spacing={1}>
                        {latestSolution!.result.results.map((result, i) => {
                          const task = submissionData.tasks.find(
                            (t) => t.number === result.number - 1
                          );
                          return !task ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                              Something went wrong with the Evaluation of the
                              submission. Please contact your tutor!
                            </Alert>
                          ) : (
                            <Typography
                              key={i}
                              variant="h6"
                              sx={{ fontWeight: "normal" }}
                            >
                              {task.name}: <strong>{result.score}</strong>/
                              {task.maxScore} Points
                            </Typography>
                          );
                        })}
                      </Stack>
                    </Paper>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setShowDetails(true)}
                  >
                    Show Detailed Feedback
                  </Button>
                )}
              </Box>
            </Stack>
          ) : (
            // STATE 3B: Not graded yet
            <Typography color="text.secondary" sx={{ pt: 1 }}>
              Your submission has not been graded yet.
            </Typography>
          )}
        </Paper>
      )}

      {/* Upload file Dialog */}
      {isUploadOpen ? (
        <Dialog
          open={isUploadOpen}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Upload Submission File</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderStyle: "dashed",
                  borderRadius: 2,
                  textAlign: "center",
                  cursor:
                    uploading || isCreateFileInFlight
                      ? "not-allowed"
                      : "pointer",
                  opacity: uploading || isCreateFileInFlight ? 0.7 : 1,
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (uploading || isCreateFileInFlight) return;
                  const f = e.dataTransfer.files?.[0] ?? null;
                  handleDroppedFile(f);
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <CloudUploadIcon fontSize="large" color="primary" />
                  <Typography variant="h6">
                    Drag file here or click to select
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only PDF files, max. 25 MB
                  </Typography>
                </Stack>
              </Paper>

              <input
                ref={fileInputRef}
                style={{ display: "none" }}
                type="file"
                accept=".pdf,application/pdf"
                onChange={onFileChange}
                disabled={isCreateFileInFlight || uploading}
              />

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
                    disabled={isCreateFileInFlight || uploading}
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
              onClick={handleCloseDialog}
              disabled={isCreateFileInFlight || uploading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onSubmitUpload}
              disabled={!selectedFile || isCreateFileInFlight || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </Stack>
  );
}
