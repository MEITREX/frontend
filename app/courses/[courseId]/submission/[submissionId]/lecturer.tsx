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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

export default function LecturerSubmission() {
  const { submissionId, courseId } = useParams();
  const [error, setError] = useState<ES2022Error | null>(null);
  const errorContext = useMemo(() => ({ error, setError }), [error, setError]);
  const [fetchKey, setFetchKey] = useState(0); // neu
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
      {
        assessmentId: submissionId,
      },
      {
        fetchKey,
        fetchPolicy: "network-only",
      }
    );

  const content = contentsByIds[0];

  console.log(content, "CONTENT");
  console.log(
    submissionExerciseForLecturer,
    "SSSSSSSSSUUUUUUUUUUUUUUUUBBBBBBBBBB"
  );

  const extendedContent = {
    ...content,
    endDate: submissionExerciseForLecturer.endDate,
  };

  const [commitDeleteTask, isDeleteInFlight] =
    useMutation<lecturerRemoveTaskMutation>(LectruerDeleteTaskMutation);

  function deleteTask(itemId: string) {
    const assessmentId = String(submissionId);

    if (!assessmentId || !itemId) return;
    if (
      !confirm("Do you really want to delete this task? This can't be undone.")
    )
      return;

    commitDeleteTask({
      variables: { assessmentId, itemId },

      // Server-Response in den Store mergen
      updater: (store) => {
        const payload = store.getRootField("mutateSubmission");
        const removed = payload?.getLinkedRecord("removeTask");
        if (!removed) return;

        const newTasks = removed.getLinkedRecords("tasks") ?? [];
        const current = store
          .getRoot()
          .getLinkedRecord("submissionExerciseForLecturer", {
            assessmentId,
          });
        if (!current) return;

        current.setLinkedRecords(newTasks, "tasks");
      },

      onCompleted: () => {
        // falls der Updater nicht greift (z.B. andere Store-Pfade), hart refetchen:
        setFetchKey((k) => k + 1);
      },

      onError: (e: any) => {
        console.error("DeleteTask error:", e);
        alert("Deleting the task failed. Please try again.");
        // optional: bei Fehler den Optimistic-Change rückgängig machen -> via Refetch:
        setFetchKey((k) => k + 1);
      },
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) return setSelectedFile(null);

    // simple guards
    if (f.type !== "application/pdf") {
      setUploadError("Bitte eine PDF-Datei wählen.");
      return setSelectedFile(null);
    }
    // optional: 25MB Limit
    if (f.size > 25 * 1024 * 1024) {
      setUploadError("Datei ist größer als 25 MB.");
      return setSelectedFile(null);
    }
    setSelectedFile(f);
  }

  async function doUpload(assessmentId: string, file: File, uploadUrl: string) {
    // Viele Presigned-URLs erwarten Content-Type gesetzt
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

  if (!(content.metadata.type === "SUBMISSION")) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content not of type submission."
      />
    );
  }
  console.log(isAddOpen);

  return (
    <>
      <SubmissionsHeader
        openEditSubmissionModal={() => setEditSetModalOpen(true)}
        content={extendedContent}
      />

      {submissionExerciseForLecturer?.tasks?.length ? (
        submissionExerciseForLecturer.tasks.map((taskItem) => (
          <div key={taskItem.itemId} className="mb-3">
            <Typography variant="h6">{taskItem.name}</Typography>
            <Typography variant="body2">
              Max Score: {taskItem.maxScore}
            </Typography>
            <Typography>Number: {taskItem.number}</Typography>

            <Typography>
              <strong>BLOOM LEVELS</strong>
            </Typography>
            {/* Beispiel: ein paar Details aus item */}
            {taskItem.item?.associatedBloomLevels.length ? (
              <ul>
                {taskItem.item.associatedBloomLevels.map((s) => (
                  <li key={s}>
                    <Typography variant="caption">{s}</Typography>
                  </li>
                ))}
              </ul>
            ) : null}

            <Typography>
              <strong>SKILLS LEVELS</strong>
            </Typography>
            {/* Beispiel: ein paar Details aus item */}
            {taskItem.item?.associatedSkills.length ? (
              <ul>
                {taskItem.item.associatedSkills.map((s) => (
                  <li key={s.id}>
                    <Typography variant="caption">{s.skillName}</Typography>
                    <Typography>
                      {s.skillCategory}, {s.isCustomSkill}, SKILL LEVELS:{" "}
                      {s.skillLevels?.analyze?.value},{" "}
                      {s.skillLevels?.apply?.value},{" "}
                      {s.skillLevels?.understand?.value},{" "}
                      {s.skillLevels?.remember?.value}{" "}
                      {s.skillLevels?.create?.value},
                    </Typography>
                  </li>
                ))}
              </ul>
            ) : null}
            <Button
              variant="outlined"
              onClick={() => {
                setIsEditTaskOpen(true);
                setSelectedTask(taskItem);
              }}
            >
              Edit Task
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                deleteTask(taskItem.itemId);
              }}
            >
              Delete Task
            </Button>
          </div>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No tasks found.
        </Typography>
      )}

      <Button variant="outlined" onClick={() => setIsAddOpen(true)}>
        Add task
      </Button>

      {submissionExerciseForLecturer.files.length > 0 && (<Typography>{submissionExerciseForLecturer.files[0].name}</Typography>)}

      <Button variant="outlined" onClick={() => setUploadOpen(true)}>
        Upload file
      </Button>

      <SubmissionExerciseModal
        onClose={() => setEditSetModalOpen(false)}
        isOpen={isEditSetModalOpen}
        _existingSubmission={extendedContent}
        chapterId={content.metadata.chapterId}
        tasks={submissionExerciseForLecturer.tasks}
      />

      {isAddOpen ? (
        <AddTaskDialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          setIsAddOpen={setIsAddOpen}
          onAdded={() => setFetchKey((k) => k + 1)}
        />
      ) : null}

      {isEditTaskOpen && selectedTask ? (
        <EditTaskDialog
          open={isEditTaskOpen}
          onClose={() => setIsEditTaskOpen(false)}
          setIsAddOpen={setIsEditTaskOpen}
          onAdded={() => setFetchKey((k) => k + 1)}
          taskProp={selectedTask}
        />
      ) : null}

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
          <div className="flex flex-col gap-3">
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
          </div>
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
    </>
  );
}
