"use client";

import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import PeopleIcon from "@mui/icons-material/People";
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useLazyLoadQuery, useMutation } from "react-relay";

import {
  umlApiGetLecturerExerciseOverviewQuery,
  umlApiUpdateTutorSolutionMutation,
} from "@/components/hylimo/api/UmlApi";
import { AddUMLAssignmentModal } from "@/components/uml-assignment/AddUMLAssignmentModal";
import ExerciseInfoTab from "@/components/uml-assignment/ExerciseInfoTab";
import SubmissionsTab from "@/components/uml-assignment/SubmissionsTab";
import { useState } from "react";

export default function LecturerUmlAssignment() {
  const { umlId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const data = useLazyLoadQuery<any>(
    umlApiGetLecturerExerciseOverviewQuery,
    { assessmentId: umlId },
    { fetchPolicy: "network-only" }
  );

  const [updateTutorSolution, isUpdating] = useMutation(
    umlApiUpdateTutorSolutionMutation
  );

  const exercise = data?.getUmlExerciseByAssessmentId;

  const handleUpdateTutorSolution = (newCode: string) => {
    updateTutorSolution({
      variables: { assessmentId: umlId, tutorSolution: newCode },
      onCompleted: () =>
        setSnackbar({
          open: true,
          message: "Tutor solution updated successfully!",
        }),
      onError: () =>
        setSnackbar({
          open: true,
          message: "Failed to update tutor solution.",
        }),
    });
  };

  if (!exercise)
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      {/* Top Action Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          color="primary"
        >
          <Tab icon={<InfoIcon />} iconPosition="start" label="Exercise Info" />
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Submissions" />
        </Tabs>

        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => setIsEditModalOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Edit Exercise
        </Button>
      </Stack>

      {/* Tab Content */}
      <Box mt={2}>
        {tabIndex === 0 ? (
          <ExerciseInfoTab
            exercise={exercise}
            onUpdateTutorSolution={handleUpdateTutorSolution}
            isUpdating={isUpdating}
          />
        ) : (
          <SubmissionsTab exercise={exercise} />
        )}
      </Box>

      {/* TODO:
        1. Take intial value to change it
        2. Change component name to EditUMLAssignmentModal
        3. Use mutation to update existing exercise instead of creating a new one
        4. Add other props in the dialog, such as totalPoints, requiredPercentage, etc.
        5. Place metadata at the top
        6. (optional) Creating tutorSolution optional in the Dialog?
      */}
      <AddUMLAssignmentModal
        open={isEditModalOpen}
        chapterId={exercise.metadata?.chapterId}
        onClose={() => setIsEditModalOpen(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
