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
import { useMemo, useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";

import {
  umlApiFindUserInfosQuery,
  umlApiGetLecturerExerciseOverviewQuery,
  umlApiUpdateTutorSolutionMutation,
} from "@/components/hylimo/api/UmlApi";
import { getSemanticModel } from "@/components/hylimo/semanticModelGenerator";
import { AddUMLAssignmentModal } from "@/components/uml-assignment/AddUMLAssignmentModal";
import ExerciseInfoTab from "@/components/uml-assignment/ExerciseInfoTab";
import SubmissionsTab from "@/components/uml-assignment/SubmissionsTab";

export default function LecturerUmlAssignment() {
  const { umlId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const data = useLazyLoadQuery<any>(
    umlApiGetLecturerExerciseOverviewQuery,
    { assessmentId: umlId },
    { fetchPolicy: "network-only", fetchKey: refreshKey }
  );

  const studentIds = useMemo(() => {
    const ids =
      data?.getUmlExerciseByAssessmentId?.studentSubmissions?.map(
        (sub: any) => sub.studentId
      ) || [];

    // Defensive: filter out empty values and duplicates before querying user infos.
    return Array.from(
      new Set(ids.filter((id: any) => typeof id === "string" && id.length > 0))
    );
  }, [data?.getUmlExerciseByAssessmentId?.studentSubmissions]);

  // Fetch user infos for all students
  const userInfosData = useLazyLoadQuery<any>(
    umlApiFindUserInfosQuery,
    { ids: studentIds },
    { fetchPolicy: "network-only" }
  );

  const userInfos = useMemo(() => {
    const userMap: Record<string, any> = {};
    if (userInfosData?.findUserInfos) {
      userInfosData.findUserInfos.forEach((user: any) => {
        // Backend may return null entries when referenced users no longer exist.
        if (user?.id) {
          userMap[user.id] = user;
        }
      });
    }
    return userMap;
  }, [userInfosData?.findUserInfos]);

  const [updateTutorSolution, isUpdating] = useMutation(
    umlApiUpdateTutorSolutionMutation
  );

  const exercise = data?.getUmlExerciseByAssessmentId;
  const content = data?.findContentsByIds?.[0];

  const handleUpdateTutorSolution = async (newCode: string) => {
    let semanticModelJson: string | null = null;
    const semanticModelResult = await getSemanticModel(newCode);
    semanticModelJson = JSON.stringify(semanticModelResult);
    updateTutorSolution({
      variables: {
        assessmentId: umlId,
        tutorSolution: {
          diagramCode: newCode,
          semanticModel: semanticModelJson,
        },
      },
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

  if (!exercise || !content)
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
        {tabIndex === 0 && !isEditModalOpen ? (
          <ExerciseInfoTab
            exercise={exercise}
            onUpdateTutorSolution={handleUpdateTutorSolution}
            isUpdating={isUpdating}
          />
        ) : tabIndex === 1 ? (
          <SubmissionsTab exercise={exercise} userInfos={userInfos} />
        ) : null}
      </Box>
      {isEditModalOpen && exercise && content && (
        <AddUMLAssignmentModal
          key={umlId + "-" + String(isEditModalOpen)}
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={() => setRefreshKey((prev) => prev + 1)}
          assessmentId={umlId as string}
          chapterId={content.metadata?.chapterId}
          initialData={{
            description: exercise.description,
            gradingRules: exercise.gradingRules || "",
            diagramCode: exercise.tutorSolution?.diagramCode,
            totalPoints: exercise.totalPoints,
            requiredPercentage: exercise.requiredPercentage,
            showSolution: exercise.showSolution ?? true,
            metadata: {
              name: content.metadata?.name || "",
              rewardPoints: content.metadata?.rewardPoints || 0,
              suggestedDate: content.metadata?.suggestedDate,
              tagNames: content.metadata?.tagNames || [],
            },
            assessmentMetadata: {
              skillPoints: content.assessmentMetadata?.skillPoints || 0,
              skillTypes: content.assessmentMetadata?.skillTypes || [],
              initialLearningInterval:
                content.assessmentMetadata?.initialLearningInterval ?? null,
            },
          }}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
