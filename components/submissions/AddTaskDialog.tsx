// components/submissions/AddTaskDialog.tsx
"use client";
import { BloomLevel } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";
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
import { v4 as uuid } from "uuid";


type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  submissionId: string
  setIsAddOpen: any
};

const LecturerAddTaskMutation = graphql`
  mutation AddTaskDialogLecturerAddTaskMutation(
    $assessmentId: UUID!
    $item: CreateItemInput!
    $submissionInput: InputTask!
  ) {
    mutateSubmission(assessmentId: $assessmentId) {
      addTask(
        assessmentId: $assessmentId
        item: $item
        submissionInput: $submissionInput
      ) {
        tasks {
          itemId
          name
          maxScore
          item {
            id
            associatedBloomLevels
            associatedSkills {
              id
              isCustomSkill
              skillCategory
              skillName
              skillLevels {
                remember {
                  value
                }
                understand {
                  value
                }
                apply {
                  value
                }
                analyze {
                  value
                }
                evaluate {
                  value
                }
                create {
                  value
                }
              }
            }
          }
        }
        modifiedTask {
          itemId

          name
          maxScore
          item {
            id
            associatedBloomLevels
            associatedSkills {
              id
              isCustomSkill
              skillCategory
              skillName
              skillLevels {
                remember {
                  value
                }
                understand {
                  value
                }
                apply {
                  value
                }
                analyze {
                  value
                }
                evaluate {
                  value
                }
                create {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function AddTaskDialog({
  open,
  onClose,
  loading,
  submissionId,
  setIsAddOpen
}: Props) {
  const [itemName, setItemName] = React.useState("");
  const [taskName, setTaskName] = React.useState("");
  const [maxScore, setMaxScore] = React.useState<number>(10);
    const [commitAddTask, isAddInFlight] =
      useMutation<AddTaskDialogLecturerAddTaskMutation>(LecturerAddTaskMutation);

  const onSubmit = useCallback(() => {
    const itemInput = {
      associatedSkills: [
        {
          isCustomSkill: true,
          skillCategory: "KNOWLEDGE", // z.B. dein Enum; nutze einen existierenden Wert
          skillName: "KNOWLEDGE",
        },
      ],
      associatedBloomLevels: [
        "REMEMBER",
      ] as const satisfies ReadonlyArray<BloomLevel>,
      // z.B. weitere Pflichtfelder: type, associatedSkills, etc.
    };
    const submissionInput = {
      name: taskName,
      number: 1,
      itemId: uuid(), // denselben Wert in item.id UND submissionInput.itemId verwenden

      maxScore,
      // ggf. weitere Felder, z.B. itemId, description ...
    };

    commitAddTask({
      variables: {
        assessmentId: String(submissionId), // kommt aus useParams()
        item: itemInput,
        submissionInput,
      },
      // (Empfohlen) updater: falls Response nur den neuen Task liefert, hier in die Liste pushen
      updater: (store) => {
        // Beispiel: hole die aktuelle SubmissionExercise und erweitere tasks
        // Passe IDs/Keys an deine Relay-IDs an
        const rootField = store
          .getRootField("mutateSubmission")
          ?.getLinkedRecord("addTask");
        const returnedExercise =
          rootField?.getLinkedRecord("submissionExercise");
        if (!returnedExercise) return;
        const newTasks = returnedExercise.getLinkedRecords("tasks") ?? [];
        // Optional: an deine vorhandene Record der Query mergen
        const queryRoot = store.getRoot();
        // Wenn du die Query record ID kennst, kannst du gezielt setzen.
      },
      onCompleted: () => {
        setIsAddOpen(false);
        // Falls du kein updater nutzt, kannst du hier einen Refetch deiner Query triggern.
        // z.B. window.location.reload() als schnelle Lösung (nicht “clean”),
        // oder bessere: separate useQueryLoader / refetchable Fragment einführen.
      },
      onError: (e) => {
        console.log(e);
      },
    });
  }, []);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Neue Aufgabe hinzufügen</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Beispiel-Felder: mappe sie auf dein CreateItemInput / InputTask */}
          <TextField
            label="Item-Name (CreateItemInput.name)"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            required
          />
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
          disabled={loading || !itemName || !taskName}
          variant="contained"
        >
          Hinzufügen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
