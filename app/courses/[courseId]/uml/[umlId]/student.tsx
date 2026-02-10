"use client";

import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";
import { useCourseData } from "@/components/courses/context/CourseDataContext";
import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import {
  umlApiCreateUmlSolutionMutation,
  umlApiEvaluateLatestSolutionMutation,
  umlApiGetStudentSolutionsQuery,
  umlApiSubmitStudentSolutionMutation,
} from "@/components/hylimo/api/UmlApi";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import { getSemanticModel } from "@/components/hylimo/semanticModelGenerator";
import AssignmentResult from "@/components/uml-assignment/AssignmentResult";
import AttemptSelectionHeader from "@/components/uml-assignment/AttemptSelectionHeader";
import {
  Alert,
  Box,
  Container,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";

const defaultValue = `classDiagram {
  class("HelloWorld") {
    public {
      hello : string
    }
  }
}`;

export default function StudentUMLAssignment() {
  const courseData = useCourseData() as StudentCourseLayoutCourseIdQuery$data;
  const userId = courseData.currentUserInfo.id;
  const { umlId } = useParams();

  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [isSubmittingMode, setIsSubmittingMode] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [diagramCode, setDiagramCode] = useState<string>(defaultValue);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  const [saveSolution, isSaving] = useMutation(
    umlApiSubmitStudentSolutionMutation
  );
  const [evaluate, isEvaluating] = useMutation(
    umlApiEvaluateLatestSolutionMutation
  );
  const [createSolution, isCreating] = useMutation(
    umlApiCreateUmlSolutionMutation
  );

  const data = useLazyLoadQuery<any>(
    umlApiGetStudentSolutionsQuery,
    { assessmentId: umlId, studentId: userId },
    { fetchPolicy: "network-only" }
  );

  const exercise = data?.getUmlExerciseByAssessmentId;

  useEffect(() => {
    if (!exercise?.solutionsByStudent) return;

    let mapped = exercise.solutionsByStudent.map((sol: any, idx: number) => ({
      id: idx + 1,
      uuid: sol.id,
      date: sol.submittedAt || new Date().toISOString(),
      submitted: !!sol.submittedAt,
      score: sol.feedback?.points,
      feedback: sol.feedback?.comment,
      diagram: sol.diagram ?? defaultValue,
    }));

    if (mapped.length === 0) {
      mapped = [
        {
          id: 1,
          uuid: null,
          date: new Date().toISOString(),
          submitted: false,
          score: undefined,
          feedback: undefined,
          diagram: defaultValue,
        },
      ];
    }

    setAttempts(mapped);

    if (!hasLoadedInitially && mapped.length > 0) {
      const targetIdx = mapped.findIndex((a: any) => !a.submitted);
      const finalIdx = targetIdx === -1 ? mapped.length - 1 : targetIdx;

      setCurrentAttempt(finalIdx);
      setDiagramCode(mapped[finalIdx]?.diagram ?? defaultValue);
      setHasLoadedInitially(true);
    }
  }, [exercise, hasLoadedInitially]);

  useEffect(() => {}, []);

  const attempt = attempts[currentAttempt] || {
    submitted: false,
    date: new Date().toISOString(),
  };

  const updateAttemptInState = (
    uuid: string,
    diagram: string,
    submitted: boolean,
    feedback?: string,
    score?: number
  ) => {
    setAttempts((prev) =>
      prev.map((a, i) =>
        i === currentAttempt
          ? { ...a, uuid, diagram, submitted, feedback, score }
          : a
      )
    );
  };

  const onHandleAction = (
    type: "save" | "submit",
    codeToSave = diagramCode
  ) => {
    const isSubmit = type === "submit";

    if (!isSubmit && codeToSave === attempts[currentAttempt]?.diagram) {
      return;
    }

    setIsSubmittingMode(isSubmit);

    const performSave = async (idToSave: string) => {
      const semanticModelResult = await getSemanticModel(codeToSave);
      const semanticModelJson = JSON.stringify(semanticModelResult);
      console.log(semanticModelJson);
      saveSolution({
        variables: {
          assessmentId: umlId,
          diagram: codeToSave,
          solutionId: idToSave,
          studentId: userId,
          submit: isSubmit,
        },
        onCompleted: (res: any) => {
          const saved = res.mutateUmlExercise?.saveStudentSolution;


          if (isSubmit) {

            evaluate({
              variables: {
                assessmentId: umlId,
                studentId: userId,
                semanticModel: semanticModelJson,
              },
              onCompleted: (evalRes: any) => {
                const result =
                  evalRes.mutateUmlExercise?.evaluateLatestSolution;
                updateAttemptInState(
                  saved.id,
                  saved.diagram,
                  true,
                  result.feedback?.comment,
                  result.feedback?.points
                );
                setSnackbar({ open: true, message: "Submitted successfully!" });
              },
            });
          } else {
            updateAttemptInState(saved.id, saved.diagram, false);
            setSnackbar({ open: true, message: "Saved successfully!" });
          }
        },
      });
    };

    if (!attempt.uuid) {
      createSolution({
        variables: {
          assessmentId: umlId,
          studentId: userId,
          createFromPrevious: false,
        },
        onCompleted: (res: any) => {
          const newSol = res.mutateUmlExercise.createUmlSolution;
          performSave(newSol.id);
        },
      });
    } else {
      performSave(attempt.uuid);
    }
  };

  const onHandleNavigation = (dir: "prev" | "next") => {
    if (diagramCode !== attempt.diagram && !attempt.submitted) {
      onHandleAction("save", diagramCode);
    }

    const nextIdx =
      dir === "prev"
        ? currentAttempt > 0
          ? currentAttempt - 1
          : attempts.length - 1
        : currentAttempt < attempts.length - 1
        ? currentAttempt + 1
        : 0;

    setCurrentAttempt(nextIdx);
    setDiagramCode(attempts[nextIdx].diagram);
  };

  const onHandleCreate = (fromPrevious: boolean) => {
    createSolution({
      variables: {
        assessmentId: umlId,
        studentId: userId,
        createFromPrevious: fromPrevious,
      },
      onCompleted: (res: any) => {
        const newSol = res.mutateUmlExercise.createUmlSolution;
        const newA = {
          id: attempts.length + 1,
          uuid: newSol.id,
          date: new Date().toISOString(),
          submitted: false,
          diagram: newSol.diagram ?? defaultValue,
        };

        setAttempts([...attempts, newA]);
        setCurrentAttempt(attempts.length);
        setDiagramCode(newA.diagram);
        setSnackbar({ open: true, message: "New attempt created!" });
      },
    });
  };

  if (!exercise)
    return (
      <Box p={4} textAlign="center">
        Loading Exercise...
      </Box>
    );

  return (
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        UML Assignment
      </Typography>

      <Box bgcolor="#e3f2fd" p={2} borderRadius={2} mb={3}>
        <ContentViewer htmlContent={exercise.description} />
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={3}>
          {/* Attempt Selector & Action Buttons */}
          <AttemptSelectionHeader
            currentIdx={currentAttempt}
            totalAttempts={attempts.length}
            attemptDate={attempt.date}
            isSubmitted={attempt.submitted}
            isLoading={{
              saving: isSaving && !isSubmittingMode,
              submitting: (isSaving && isSubmittingMode) || isEvaluating,
              creating: isCreating,
            }}
            onNavigate={onHandleNavigation}
            onAction={onHandleAction}
            onCreate={onHandleCreate}
          />

          {/* Collapsible Results Section */}
          {attempt.submitted && (
            <AssignmentResult
              feedback={attempt.feedback ?? ""}
              score={attempt.score ?? 0}
              totalPoints={exercise.totalPoints}
              requiredPercentage={exercise.requiredPercentage}
            />
          )}

          {attempt.submitted && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                width: "100%",
                borderRadius: 2,
                borderWidth: "1px",
                backgroundColor: "info.lighter",
                "& .MuiAlert-message": {
                  fontWeight: 500,
                },
              }}
            >
              <strong>Read-Only:</strong> This attempt has already been
              submitted and can no longer be edited.
            </Alert>
          )}

          {/* Editor Area */}
          <Box
            sx={{
              height: "60vh",
              minHeight: 500,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <MainHylimoEditor
              key={`${currentAttempt}-${attempt.uuid}`}
              initialValue={diagramCode}
              onChange={setDiagramCode}
              readOnly={attempt?.submitted}
            />
          </Box>
        </Stack>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={snackbar.message}
      />
    </Container>
  );
}
