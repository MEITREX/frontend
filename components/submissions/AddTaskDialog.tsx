// components/submissions/AddTaskDialog.tsx
"use client";
import { AddTaskDialogLecturerAddTaskMutation } from "@/__generated__/AddTaskDialogLecturerAddTaskMutation.graphql";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import * as React from "react";
import { useCallback } from "react";
import { graphql, useMutation } from "react-relay";

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  submissionId: string;
  setIsAddOpen: any;
  onAdded: () => void;
};

const LecturerAddTaskMutation = graphql`
  mutation AddTaskDialogLecturerAddTaskMutation(
    $assessmentId: UUID!
    $item: CreateItemInput!
    $submissionInput: InputTaskWithoutItem!
  ) {
    mutateSubmission(assessmentId: $assessmentId) {
      addTask(
        assessmentId: $assessmentId
        item: $item
        submissionInput: $submissionInput
      ) {
        assessmentId
        tasks {
          itemId
          maxScore
          name
        }
      }
      assessmentId
    }
  }
`;

export default function AddTaskDialog({
  open,
  onClose,
  loading,
  submissionId,
  setIsAddOpen,
  onAdded,
}: Props) {
  const [taskName, setTaskName] = React.useState("");
  const [maxScore, setMaxScore] = React.useState<number>(10);
  const [commitAddTask, isAddInFlight] =
    useMutation<AddTaskDialogLecturerAddTaskMutation>(LecturerAddTaskMutation);

  const onSubmit = useCallback(() => {
    const itemInput = {
      // NUTZE itemName!
      associatedSkills: [
        {
          isCustomSkill: true,
          skillCategory: "KNOWLEDGE",
          skillName: "KNOWLEDGE",
        },
      ],
      associatedBloomLevels: ["REMEMBER"] as const,
    };

    const submissionInput = {
      name: taskName,
      number: 1,
      maxScore: maxScore,
    };

    commitAddTask({
      variables: {
        assessmentId: String(submissionId),
        item: itemInput,
        submissionInput,
      },
      updater: (store) => {
        // Payload der Mutation holen
        const mutateSubmission = store.getRootField("mutateSubmission");
        const addTask = mutateSubmission?.getLinkedRecord("addTask");
        if (!addTask) return;

        // die neue Task-Liste aus dem Payload
        const newTasks = addTask.getLinkedRecords("tasks") ?? [];

        // Das bestehende Query-Resultat finden:
        // Wichtig: exakt die gleichen Argumente wie in der Query!
        const root = store.getRoot();
        const current = root.getLinkedRecord("submissionExerciseForLecturer", {
          assessmentId: String(submissionId),
        });
        if (!current) return;

        // Tasks im bestehenden Record ersetzen (oder alternativ anhängen)
        current.setLinkedRecords(newTasks, "tasks");
      },
      onCompleted: () => {
        setIsAddOpen(false); // Add-Dialog schließen
        onAdded?.(); // falls du noch etwas lokales tun willst (ohne Refetch!)
      },
      onError: (e) => console.log(e),
    });
  }, [
    commitAddTask,
    submissionId,
    taskName, // neu
    maxScore, // neu
    setIsAddOpen,
    onAdded,
  ]);

  return (
    <Dialog open={open} onClose={onClose} keepMounted fullWidth maxWidth="sm">
      <DialogTitle>Neue Aufgabe hinzufügen</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Beispiel-Felder: mappe sie auf dein CreateItemInput / InputTask */}

          <TextField
            label="Task-Name (InputTask.name)"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Max Score (InputTask.maxScore)"
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button
          onClick={onSubmit}
          disabled={loading || !taskName}
          variant="contained"
        >
          Hinzufügen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
