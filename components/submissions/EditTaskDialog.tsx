"use client";
import { EditTaskDialogLecturerEditTaskMutation } from "@/__generated__/EditTaskDialogLecturerEditTaskMutation.graphql";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import type { lecturerSubmissionExerciseForLecturerQuery as Q } from "@/__generated__/lecturerSubmissionExerciseForLecturerQuery.graphql";
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

type Task = NonNullable<
  Q["response"]["submissionExerciseForLecturer"]
>["tasks"][number];

type Props = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  setIsAddOpen: any;
  onAdded: () => void;
  taskProp: Task;
};

const LecturerUpdateTaskMutation = graphql`
  mutation EditTaskDialogLecturerEditTaskMutation(
    $assessmentId: UUID!
    $item: ItemInput!
    $submissionInput: InputTask!
  ) {
    mutateSubmission(assessmentId: $assessmentId) {
      updateTask(
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

export default function AddTaskDialog({
  open,
  onClose,
  loading,
  setIsAddOpen,
  onAdded,
  taskProp,
}: Props) {
  const { submissionId, courseId } = useParams();
  const [taskName, setTaskName] = React.useState(taskProp.name);
  const [maxScore, setMaxScore] = React.useState<number>(taskProp.maxScore);
  const [number, setNumber] = React.useState<number>(taskProp.number);
  const [commitAddTask, isAddInFlight] =
    useMutation<EditTaskDialogLecturerEditTaskMutation>(
      LecturerUpdateTaskMutation
    );
  const [item, setItem] = useState<CreateItem>(() => ({
    associatedSkills: taskProp.item.associatedSkills.map(
      ({ skillCategory, skillName, isCustomSkill }) => ({
        skillCategory,
        skillName,
        isCustomSkill,
      })
    ),
    associatedBloomLevels: [...taskProp.item.associatedBloomLevels],
  }));

  const [queryReference, loadQuery] =
    useQueryLoader<lecturerAllSkillsQuery>(AllSkillQuery);

  React.useEffect(() => {
    if (!queryReference) {
      loadQuery({ courseId });
    }
  }, [courseId, loadQuery, queryReference]);

  useEffect(() => {
    if (!taskProp?.item) return;
    setItem({
      associatedSkills: taskProp.item.associatedSkills.map(
        ({ skillCategory, skillName, isCustomSkill }) => ({
          skillCategory,
          skillName,
          isCustomSkill,
        })
      ),
      associatedBloomLevels: [...taskProp.item.associatedBloomLevels],
    });
    setTaskName(taskProp.name);
    setMaxScore(taskProp.maxScore);
  }, [taskProp]);

  const onSubmit = useCallback(() => {
    type Vars = EditTaskDialogLecturerEditTaskMutation["variables"];
    type SkillInputVar = Vars["item"]["associatedSkills"][number];
    type SkillState = CreateItem["associatedSkills"][number];

    const toSkillInput = (s: SkillState): SkillInputVar => ({
      isCustomSkill: !!s.isCustomSkill,
      skillCategory: s.skillCategory,
      skillName: s.skillName,
    });

    const vars: Vars = {
      assessmentId: String(submissionId),
      item: {
        id: taskProp.item.id,
        associatedBloomLevels: [...item.associatedBloomLevels],
        associatedSkills: item.associatedSkills.map(toSkillInput),
      },
      submissionInput: {
        itemId: taskProp.itemId,
        name: taskName,
        number: number,
        maxScore: maxScore,
      },
    };

    commitAddTask({
      variables: vars,
      updater: (store) => {
        // Payload of mutation
        const mutateSubmission = store.getRootField("mutateSubmission");
        const updateTask = mutateSubmission?.getLinkedRecord("updateTask");
        if (!updateTask) return;

        // task list from payload
        const newTasks = updateTask.getLinkedRecords("tasks") ?? [];

        // Get existing query results using same arguments
        const root = store.getRoot();
        const current = root.getLinkedRecord("submissionExerciseForLecturer", {
          assessmentId: String(submissionId),
        });
        if (!current) return;

        // Replace tasks in record
        current.setLinkedRecords(newTasks, "tasks");
      },
      onCompleted: () => {
        setIsAddOpen(false);
        onAdded?.();
      },
      onError: (e) => console.log(e),
    });
  }, [
    commitAddTask,
    submissionId,
    item,
    taskName,
    number,
    maxScore,
    setIsAddOpen,
    onAdded,
    taskProp.item.id,
    taskProp.itemId,
  ]);

  return (
    <Dialog open={open} onClose={onClose} keepMounted fullWidth maxWidth="md">
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <ItemFormSection
          operation="edit"
          item={item}
          setItem={setItem}
          allSkillsQueryRef={queryReference}
        />
        <Stack spacing={2} sx={{ mt: 1 }}>
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
            helperText="Please be aware: Task number must be unique inside submission"
            FormHelperTextProps={{
              sx: { color: "orange" },
            }}
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
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
