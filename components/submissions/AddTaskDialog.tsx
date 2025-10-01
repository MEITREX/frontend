// components/submissions/AddTaskDialog.tsx
"use client";
import { AddTaskDialogLecturerAddTaskMutation } from "@/__generated__/AddTaskDialogLecturerAddTaskMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { SkillType } from "@/__generated__/SubmissionExerciseModalCreateMutation.graphql";
import { AllSkillQuery } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useParams } from "next/navigation";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { graphql, useMutation, useQueryLoader } from "react-relay";
import ItemFormSection, {
  CreateItem,
} from "../form-sections/item/ItemFormSection";

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
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
          number
        }
      }
      assessmentId
    }
  }
`;

const skillTypeLabel: Record<SkillType, string> = {
  EVALUATE: "Evaluate",
  CREATE: "Create",
  ANALYZE: "Analyze",
  APPLY: "Apply",
  REMEMBER: "Remember",
  UNDERSTAND: "Understand",
  "%future added value": "Unknown",
};

export default function AddTaskDialog({
  open,
  onClose,
  loading,
  setIsAddOpen,
  onAdded,
}: Props) {
  const { submissionId, courseId } = useParams();
  const [taskName, setTaskName] = React.useState("");
  const [maxScore, setMaxScore] = React.useState<number>(10);
  const [number, setNumber] = React.useState<number>(1);
  const [commitAddTask, isAddInFlight] =
    useMutation<AddTaskDialogLecturerAddTaskMutation>(LecturerAddTaskMutation);
  const [item, setItem] = useState<CreateItem>({
    associatedSkills: [],
    associatedBloomLevels: [],
  });

  const [queryReference, loadQuery] =
    useQueryLoader<lecturerAllSkillsQuery>(AllSkillQuery);

  useEffect(() => {
    if (!queryReference) {
      loadQuery({ courseId });
    }
  }, [courseId, loadQuery, queryReference]);

  const onSubmit = useCallback(() => {
    // 1) Typen aus der Mutation holen – das schützt dich vor falschen Shapes
    type Vars = AddTaskDialogLecturerAddTaskMutation["variables"];
    type CreateSkillVar = Vars["item"]["associatedSkills"][number];

    // 2) Mapper: Skill aus der UI/Query -> CreateSkillInput (ohne id/skillLevels)
    const toCreateSkill = (
      s: any // kommt aus ItemFormSection; kann Skill aus Query sein
    ): CreateSkillVar => ({
      skillCategory: s.skillCategory,
      skillName: s.skillName,
      // optional: nur setzen, wenn vorhanden
      ...(typeof s.isCustomSkill === "boolean"
        ? { isCustomSkill: s.isCustomSkill }
        : {}),
    });

    // 3) Validierung/Normalisierung
    const name = taskName.trim();
    const num = Math.trunc(Number.isFinite(number as any) ? Number(number) : 0);
    const max = Math.trunc(
      Number.isFinite(maxScore as any) ? Number(maxScore) : 0
    );

    if (!name) {
      alert("Bitte einen Task-Namen angeben.");
      return;
    }
    if (!item.associatedBloomLevels?.length) {
      alert("Bitte mindestens ein Bloom Level auswählen.");
      return;
    }
    if (!item.associatedSkills?.length) {
      alert("Bitte mindestens eine Skill auswählen.");
      return;
    }

    const vars: Vars = {
      assessmentId: String(submissionId),
      item: {
        associatedBloomLevels: [...item.associatedBloomLevels],
        associatedSkills: item.associatedSkills.map(toCreateSkill), // <-- skillLevels & id werden verworfen
      },
      submissionInput: {
        name,
        number: num,
        maxScore: max,
      },
    };

    commitAddTask({
      variables: vars,
      updater: (store) => {
        const mutateSubmission = store.getRootField("mutateSubmission");
        const addTask = mutateSubmission?.getLinkedRecord("addTask");
        if (!addTask) return;

        const newTasks = addTask.getLinkedRecords("tasks") ?? [];

        // exakt mit dem gleichen Argument wie in deiner Query
        const current = store
          .getRoot()
          .getLinkedRecord("submissionExerciseForLecturer", {
            assessmentId: String(submissionId),
          });
        if (!current) return;

        current.setLinkedRecords(newTasks, "tasks");
      },
      onCompleted: () => {
        setIsAddOpen(false);
        onAdded?.();
      },
      onError: (e) => {
        console.error("AddTask error:", e);
        const gqlErrors = (e as any)?.source?.errors ?? (e as any)?.errors;
        if (gqlErrors) console.error("GraphQL errors:", gqlErrors);
      },
    });
  }, [
    commitAddTask,
    submissionId,
    taskName,
    number,
    maxScore,
    item.associatedBloomLevels,
    item.associatedSkills,
    setIsAddOpen,
    onAdded,
  ]);

  return (
    <Dialog open={open} onClose={onClose} keepMounted fullWidth maxWidth="sm">
      <DialogTitle>Add new tasks</DialogTitle>
      <DialogContent>
        <ItemFormSection
          operation="edit"
          item={item}
          setItem={setItem}
          allSkillsQueryRef={queryReference}
        />
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Beispiel-Felder: mappe sie auf dein CreateItemInput / InputTask */}

          <TextField
            label="Task name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Task number"
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
            fullWidth
            required
          />

          <TextField
            label="Max Score"
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          disabled={loading || !taskName}
          variant="contained"
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
