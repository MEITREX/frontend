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
import FullscreenEditorDialog from "@/components/hylimo/FullscreenEditorDialog";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import { getSemanticModel } from "@/components/hylimo/semanticModelGenerator";
import AssignmentResult from "@/components/uml-assignment/AssignmentResult";
import AttemptSelectionHeader from "@/components/uml-assignment/AttemptSelectionHeader";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchQuery,
  useLazyLoadQuery,
  useMutation,
  useRelayEnvironment,
} from "react-relay";

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
  const relayEnvironment = useRelayEnvironment();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [isSubmittingMode, setIsSubmittingMode] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [diagramCode, setDiagramCode] = useState<string>(defaultValue);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isTutorSolutionVisible, setIsTutorSolutionVisible] = useState(false);
  const [autoFullscreenHackActive, setAutoFullscreenHackActive] =
    useState(true);

  const [saveSolution, isSaving] = useMutation(
    umlApiSubmitStudentSolutionMutation
  );
  const [requeueEvaluation, isRequeueing] = useMutation(
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
  const assessmentMetadata = data?.findContentsByIds?.[0]?.assessmentMetadata;
  const retryIntervalDays = assessmentMetadata?.initialLearningInterval;
  const isRepeatable =
    assessmentMetadata?.initialLearningInterval != null ? true : false;

  useEffect(() => {
    if (!exercise?.solutionsByStudent) return;

    let mapped = exercise.solutionsByStudent.map((sol: any, idx: number) => ({
      id: idx + 1,
      uuid: sol.id,
      date: sol.submittedAt || new Date().toISOString(),
      submitted: !!sol.submittedAt,
      evaluationStatus: sol.evaluationStatus,
      score: sol.feedback?.points,
      feedback: sol.feedback?.comment,
      diagram: sol.diagram?.diagramCode ?? defaultValue,
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

  const refreshSolutions = async () => {
    await fetchQuery(relayEnvironment, umlApiGetStudentSolutionsQuery, {
      assessmentId: umlId,
      studentId: userId,
    }).toPromise();
  };

  const pendingEvaluationExists = attempts.some((attemptItem: any) =>
    ["ENQUEUED", "PROCESSING"].includes(attemptItem.evaluationStatus)
  );

  useEffect(() => {
    if (!pendingEvaluationExists) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        await refreshSolutions();
      } catch (error) {
        console.error("Failed to refresh UML solution status", error);
      }
    };

    void poll();
    const interval = window.setInterval(poll, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pendingEvaluationExists, relayEnvironment, umlId, userId]);

  useEffect(() => {}, []);

  useEffect(() => {
    if (
      !exercise ||
      hasLoadedInitially === false ||
      !autoFullscreenHackActive
    ) {
      return;
    }

    setFullscreen(true);

    const closeTimer = window.setTimeout(() => {
      setFullscreen(false);
      setAutoFullscreenHackActive(false);
    }, 160);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [exercise, hasLoadedInitially, autoFullscreenHackActive]);

  const attempt = attempts[currentAttempt] || {
    submitted: false,
    date: new Date().toISOString(),
  };
  const hasSubmittedBefore = attempts.some((a: any) => a.submitted);
  const latestSubmittedTimestamp = attempts
    .filter((a: any) => a.submitted)
    .map((a: any) => new Date(a.date).getTime())
    .filter((ts: number) => !Number.isNaN(ts))
    .reduce((max: number, ts: number) => Math.max(max, ts), 0);
  const nextAttemptAvailableAt =
    isRepeatable && latestSubmittedTimestamp > 0 && retryIntervalDays != null
      ? new Date(
          latestSubmittedTimestamp + retryIntervalDays * 24 * 60 * 60 * 1000
        )
      : null;
  const remainingUntilNextAttemptMs =
    nextAttemptAvailableAt != null
      ? nextAttemptAvailableAt.getTime() - Date.now()
      : 0;
  const canCreateNewAttemptNow =
    isRepeatable &&
    (!hasSubmittedBefore ||
      nextAttemptAvailableAt == null ||
      remainingUntilNextAttemptMs <= 0);
  const nextAttemptHint =
    isRepeatable && hasSubmittedBefore && remainingUntilNextAttemptMs > 0
      ? `You can create your next attempt in ${Math.ceil(
          remainingUntilNextAttemptMs / (24 * 60 * 60 * 1000)
        )} day(s), starting ${nextAttemptAvailableAt?.toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}.`
      : null;
  const isSingleSubmissionOnly = !isRepeatable;
  const tutorSolutionCode = exercise?.tutorSolution?.diagramCode ?? "";
  const canShowTutorSolution =
    isSingleSubmissionOnly &&
    hasSubmittedBefore &&
    Boolean(exercise?.showSolution) &&
    Boolean(tutorSolutionCode);
  const currentEvaluationStatus = attempt.evaluationStatus;
  const isCurrentAttemptGeneratingFeedback = [
    "ENQUEUED",
    "PROCESSING",
  ].includes(currentEvaluationStatus);
  const isCurrentAttemptFailed = currentEvaluationStatus === "FAILED";
  const isCurrentAttemptDone = currentEvaluationStatus === "DONE";

  const requeueFailedEvaluation = () => {
    if (!attempt.uuid || !isCurrentAttemptFailed) {
      return;
    }

    requeueEvaluation({
      variables: {
        assessmentId: umlId,
        studentId: userId,
      },
      onCompleted: (res: any) => {
        const requeued = res.mutateUmlExercise?.evaluateLatestSolution;

        if (requeued?.id) {
          updateAttemptInState(
            currentAttempt,
            requeued.id,
            attempt.diagram,
            true,
            requeued.evaluationStatus ?? "ENQUEUED",
            attempt.feedback,
            attempt.score
          );
        }

        setSnackbar({
          open: true,
          severity: "success",
          message:
            "Feedback generation has been queued again. You can leave this page and you will be notified once it is ready.",
        });
      },
      onError: (error: unknown) => {
        console.error("Failed to requeue UML feedback generation", error);
        setSnackbar({
          open: true,
          severity: "error",
          message:
            "Could not requeue the feedback generation. Please try again.",
        });
      },
    });
  };

  const updateAttemptInState = (
    attemptIndex: number,
    uuid: string,
    diagram: string,
    submitted: boolean,
    evaluationStatus?: string,
    feedback?: string,
    score?: number
  ) => {
    setAttempts((prev: any[]) =>
      prev.map((a: any, i: number) =>
        i === attemptIndex
          ? {
              ...a,
              uuid,
              diagram,
              submitted,
              evaluationStatus,
              feedback,
              score,
            }
          : a
      )
    );
  };

  const onHandleAction = (
    type: "save" | "submit",
    codeToSave = diagramCode,
    targetAttemptIndex = currentAttempt
  ) => {
    const isSubmit = type === "submit";

    if (!isSubmit && codeToSave === attempts[currentAttempt]?.diagram) {
      return;
    }

    const hasSubmittedBefore = attempts.some((a: any) => a.submitted);
    if (!attempt.uuid && hasSubmittedBefore && !isRepeatable) {
      setSnackbar({
        open: true,
        severity: "error",
        message:
          "This UML exercise is not repeatable. You cannot create another solution after submission.",
      });
      return;
    }

    if (!attempt.uuid && hasSubmittedBefore && nextAttemptHint) {
      setSnackbar({
        open: true,
        severity: "info",
        message: nextAttemptHint,
      });
      return;
    }

    setIsSubmittingMode(isSubmit);

    if (isSubmit) {
      setSnackbar({
        open: true,
        severity: "info",
        message:
          "Submitting... feedback is generated in the background and you will be notified when it is ready.",
      });
    }

    const performSave = async (idToSave: string) => {
      let semanticModelJson: string | null = null;
      if (isSubmit) {
        const semanticModelResult = await getSemanticModel(codeToSave);
        semanticModelJson = JSON.stringify(semanticModelResult);
      }

      saveSolution({
        variables: {
          assessmentId: umlId,
          diagram: {
            diagramCode: codeToSave,
            semanticModel: semanticModelJson,
          },
          solutionId: idToSave,
          studentId: userId,
          submit: isSubmit,
        },
        onCompleted: (res: any) => {
          const saved = res.mutateUmlExercise?.saveStudentSolution;

          if (isSubmit) {
            updateAttemptInState(
              targetAttemptIndex,
              saved.id,
              saved.diagram.diagramCode,
              true,
              saved.evaluationStatus ?? "ENQUEUED",
              saved.feedback?.comment,
              saved.feedback?.points
            );
            setIsSubmittingMode(false);
            setSnackbar({
              open: true,
              severity: "success",
              message:
                "Submission received. Feedback is now being generated in the background. You can leave this page and you will receive a notification when it is ready.",
            });
          } else {
            updateAttemptInState(
              targetAttemptIndex,
              saved.id,
              saved.diagram.diagramCode,
              false,
              saved.evaluationStatus
            );
            setIsSubmittingMode(false);
            setSnackbar({
              open: true,
              severity: "success",
              message: "Saved successfully!",
            });
          }
        },
        onError: () => {
          setIsSubmittingMode(false);
          setSnackbar({
            open: true,
            severity: "error",
            message: isSubmit
              ? "Submission failed. Please try again."
              : "Saving failed. Please try again.",
          });
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
        onError: (err: any) => {
          setIsSubmittingMode(false);
          const errorMsg = err?.message || "";
          const isNonRepeatableError =
            errorMsg.includes("not repeatable") ||
            errorMsg.includes("cannot create");
          setSnackbar({
            open: true,
            severity: "error",
            message: isNonRepeatableError
              ? "This UML exercise is not repeatable. You cannot create another solution after submission."
              : "Could not create a submission attempt.",
          });
        },
      });
    } else {
      performSave(attempt.uuid);
    }
  };

  const onHandleNavigation = (dir: "prev" | "next") => {
    if (diagramCode !== attempt.diagram && !attempt.submitted) {
      onHandleAction("save", diagramCode, currentAttempt);
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
    const hasSubmittedBefore = attempts.some((a: any) => a.submitted);
    if (hasSubmittedBefore && !isRepeatable) {
      setSnackbar({
        open: true,
        severity: "error",
        message:
          "This UML exercise is not repeatable. You cannot create another solution after submission.",
      });
      return;
    }

    if (hasSubmittedBefore && nextAttemptHint) {
      setSnackbar({
        open: true,
        severity: "info",
        message: nextAttemptHint,
      });
      return;
    }

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
          diagram: newSol.diagram?.diagramCode ?? defaultValue,
        };

        setAttempts([...attempts, newA]);
        setCurrentAttempt(attempts.length);
        setDiagramCode(newA.diagram);
        setSnackbar({
          open: true,
          severity: "success",
          message: "New attempt created!",
        });
      },
      onError: (err: any) => {
        const errorMsg = err?.message || "";
        const isNonRepeatableError =
          errorMsg.includes("not repeatable") ||
          errorMsg.includes("cannot create");
        setSnackbar({
          open: true,
          severity: "error",
          message: isNonRepeatableError
            ? "This UML exercise is not repeatable. You cannot create another solution after submission."
            : "Could not create a new attempt.",
        });
      },
    });
  };

  console.log("Rendering student UML assignment", {
    exercise,
    attempts,
    assessmentMetadata,
  });

  if (!exercise || assessmentMetadata === undefined)
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        UML Assignment
      </Typography>

      <Box bgcolor="#e3f2fd" p={2} borderRadius={2} mb={3}>
        <ContentViewer htmlContent={exercise.description} />
      </Box>

      {isSingleSubmissionOnly && (
        <Box mb={2}>
          <Tooltip title="This UML exercise allows exactly one submission attempt.">
            <Chip
              color="warning"
              variant="outlined"
              label="One submission only"
            />
          </Tooltip>
        </Box>
      )}

      {!isRepeatable && hasSubmittedBefore && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ borderRadius: 2, mb: 3 }}
        >
          <strong>Non-repeatable:</strong> This exercise can only be submitted
          once. You have already submitted your solution.
        </Alert>
      )}

      {nextAttemptHint && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{ borderRadius: 2, mb: 3 }}
        >
          <strong>Next attempt:</strong> {nextAttemptHint}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={3}>
          <AttemptSelectionHeader
            currentIdx={currentAttempt}
            totalAttempts={attempts.length}
            attemptDate={attempt.date}
            isSubmitted={attempt.submitted}
            canCreateNewAttempt={canCreateNewAttemptNow}
            newAttemptHint={nextAttemptHint ?? undefined}
            readOnlyHint={
              attempt.submitted
                ? "Read-only: This attempt has already been submitted."
                : undefined
            }
            onNavigate={onHandleNavigation}
            onAction={onHandleAction}
            onCreate={onHandleCreate}
            isLoading={{
              saving: isSaving && !isSubmittingMode,
              submitting: isSaving && isSubmittingMode,
              creating: isCreating,
            }}
          />

          {attempt.submitted && isCurrentAttemptGeneratingFeedback && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Feedback queued
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your submission is being evaluated in the background. You can
                  leave this page and come back later, or wait here until the
                  status changes.
                </Typography>
                <LinearProgress />
              </Stack>
            </Paper>
          )}

          {attempt.submitted && isCurrentAttemptFailed && (
            <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Feedback generation failed
                </Typography>
                <Typography variant="body2">
                  This submission could not be evaluated automatically. You can
                  requeue the feedback generation and leave this page; you will
                  receive a notification once it finishes.
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={requeueFailedEvaluation}
                    disabled={isRequeueing}
                  >
                    {isRequeueing ? "Requeuing..." : "Requeue feedback"}
                  </Button>
                </Box>
              </Stack>
            </Alert>
          )}

          {attempt.submitted && isCurrentAttemptDone && (
            <AssignmentResult
              feedback={attempt.feedback ?? ""}
              score={attempt.score ?? 0}
              totalPoints={exercise.totalPoints}
              requiredPercentage={exercise.requiredPercentage}
            />
          )}

          {canShowTutorSolution && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Tutor Solution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Since this exercise allows one submission and solutions are
                  visible after submission, you can review the tutor solution
                  below.
                </Typography>
                <Box>
                  <Button
                    variant={isTutorSolutionVisible ? "outlined" : "contained"}
                    onClick={() =>
                      setIsTutorSolutionVisible((prevVisible) => !prevVisible)
                    }
                  >
                    {isTutorSolutionVisible ? "Hide solution" : "Show solution"}
                  </Button>
                </Box>
                {isTutorSolutionVisible && (
                  <Box
                    sx={{
                      height: "40vh",
                      minHeight: 360,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <MainHylimoEditor
                      initialValue={tutorSolutionCode}
                      onChange={() => {}}
                      readOnly
                      key="student-tutor-solution-editor"
                    />
                  </Box>
                )}
              </Stack>
            </Paper>
          )}

          {/* The pending feedback card above covers queued submissions. */}

          <Box display="flex" alignItems="center">
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight="bold"
              mr={1}
            >
              HYLIMO EDITOR
            </Typography>
            {attempt.submitted && (
              <Chip
                size="small"
                color="warning"
                variant="outlined"
                label="Read-only mode"
                sx={{ mr: 1 }}
              />
            )}
            <Box flex={1} />
            <Button
              onClick={() => setFullscreen(true)}
              variant="outlined"
              size="small"
            >
              Fullscreen
            </Button>
          </Box>

          <Box
            sx={{
              height: "60vh",
              minHeight: 500,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {!fullscreen && (
              <MainHylimoEditor
                initialValue={diagramCode}
                onChange={setDiagramCode}
                readOnly={attempt?.submitted}
                key="student-regular-editor"
              />
            )}
          </Box>
        </Stack>
      </Paper>

      <FullscreenEditorDialog
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title="HyLiMo Editor"
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        invisible={autoFullscreenHackActive && fullscreen}
        sourceCode={diagramCode}
        fileName="diagram"
        infoContent={
          <Box bgcolor="#e3f2fd" p={2}>
            <ContentViewer htmlContent={exercise.description} />
          </Box>
        }
      >
        {fullscreen && (
          <MainHylimoEditor
            initialValue={diagramCode}
            onChange={setDiagramCode}
            readOnly={attempt?.submitted}
            key="student-fullscreen-editor"
          />
        )}
      </FullscreenEditorDialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
