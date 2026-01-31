"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { useLazyLoadQuery, useMutation } from "react-relay";

import { umlApiGetStudentSolutionsQuery, umlApiSubmitStudentSolutionMutation } from "@/components/hylimo/api/UmlApi";
import MainHylimoEditor from "@/components/hylimo/MainHylimoEditor";
import AssignmentResult from "@/components/uml-assignment/AssignmentResult";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";

import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";
import { UmlApiGetStudentSolutionsQuery } from "@/__generated__/UmlApiGetStudentSolutionsQuery.graphql";
import { UmlApiSubmitStudentSolutionMutation } from "@/__generated__/UmlApiSubmitStudentSolutionMutation.graphql";
import { useCourseData } from "@/components/courses/context/CourseDataContext";

import ContentViewer from "@/components/forum/richTextEditor/ContentViewer";
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  Paper,
  Slide,
  Snackbar,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

const defaultValue = `classDiagram {
    class("HelloWorld") {
        public {
            hello : string
        }
    }
}`;

interface Attempt {
  id: number;
  uuid: string;
  date: string;
  submitted: boolean;
  score?: number;
  feedback?: string;
  diagram: string;
}

export default function StudentUMLAssignment() {
  const courseData = useCourseData() as StudentCourseLayoutCourseIdQuery$data;
  const userId = courseData.currentUserInfo.id;
  const { umlId } = useParams();

  const [fullscreen, setFullscreen] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);

  const [title] = React.useState("UML Assignment");

  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");

  const [saveStudentSolution] = useMutation<UmlApiSubmitStudentSolutionMutation>(
    umlApiSubmitStudentSolutionMutation
  );

  // Fetch attempts
  const data = useLazyLoadQuery<UmlApiGetStudentSolutionsQuery>(
    umlApiGetStudentSolutionsQuery,
    { assessmentId: umlId, studentId: userId }
  );

  const exercise = data.getUmlExerciseByAssessmentId;

  // Map data to attempts
  const graphqlAttempts: Attempt[] = React.useMemo(() => {
    if (!exercise?.solutionsByStudent) return [];
    return exercise.solutionsByStudent.map((sol, index) => ({
      id: index + 1,
      uuid: sol.id ?? "",
      date: sol.submittedAt ? new Date(sol.submittedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      submitted: !!sol.submittedAt,
      score: sol.feedback?.points,
      feedback: sol.feedback?.comment,
      diagram: sol.diagram ?? defaultValue,
    }));
  }, [exercise]);

  // Initial setup of state
  const [attempts, setAttempts] = React.useState<Attempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = React.useState(0);
  const [diagramCode, setDiagramCode] = React.useState<string>(defaultValue);

  // Sync internal state when data loads
  React.useEffect(() => {
    const initial = graphqlAttempts.length ? graphqlAttempts : [{
      id: 1,
      uuid: "",
      date: new Date().toISOString().slice(0, 10),
      submitted: false,
      diagram: defaultValue,
    }];
    setAttempts(initial);

    const latestIndex = initial.findIndex(a => !a.submitted);
    const targetIdx = latestIndex === -1 ? initial.length - 1 : latestIndex;
    setCurrentAttempt(targetIdx);
    setDiagramCode(initial[targetIdx].diagram);
  }, [graphqlAttempts]);

  const attempt = attempts[currentAttempt] || { diagram: defaultValue, submitted: false };

  // Helper to persist current editor code into the attempts list before switching
  const persistCurrentProgress = () => {
    setAttempts(prev => prev.map((a, i) => i === currentAttempt ? { ...a, diagram: diagramCode } : a));
  };

  // Navigation Logic
  const handleNavigate = (newIdx: number) => {
    persistCurrentProgress();
    setCurrentAttempt(newIdx);
    setDiagramCode(attempts[newIdx].diagram);
  };

  const prevAttempt = () => handleNavigate(currentAttempt > 0 ? currentAttempt - 1 : attempts.length - 1);
  const nextAttempt = () => handleNavigate(currentAttempt < attempts.length - 1 ? currentAttempt + 1 : 0);

  // Create a new attempt
  const startNewAttempt = () => {
    if (!attempt.submitted) return;
    persistCurrentProgress();

    const newAttempt: Attempt = {
      id: attempts.length + 1,
      uuid: "",
      date: new Date().toISOString().slice(0, 10),
      submitted: false,
      diagram: defaultValue,
    };

    setAttempts(prev => [...prev, newAttempt]);
    setCurrentAttempt(attempts.length);
    setDiagramCode(defaultValue);
  };

  // Save or Submit
  const handleSave = (submit: boolean) => {
    saveStudentSolution({
      variables: {
        assessmentId: umlId,
        diagram: diagramCode,
        solutionId: attempt.uuid || undefined,
        studentId: userId,
        submit,
      },
      onCompleted: (response) => {
        const savedSolution = response.mutateUmlExercise?.saveStudentSolution;
        if (!savedSolution) return;

        // Update current attempt
        setAttempts(prev =>
          prev.map((a, i) =>
            i === currentAttempt
              ? {
                  ...a,
                  uuid: savedSolution.id,
                  diagram: savedSolution.diagram,
                  submitted: submit,
                  feedback: savedSolution.feedback?.comment,
                  score: savedSolution.feedback?.points
                }
              : a
          )
        );

        setSnackbarMessage(submit ? "Submitted successfully!" : "Saved successfully!");
        setSnackbarOpen(true);
      },
      onError: (err) => {
        console.error("Error saving solution:", err);
        setSnackbarMessage("Error! Please try again.");
        setSnackbarOpen(true);
      },
    });
  };

  if (!exercise) return <div>Loading...</div>;

  const Editor = (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MainHylimoEditor
        key={currentAttempt}
        initialValue={diagramCode}
        onChange={setDiagramCode}
        readOnly={attempts[currentAttempt]?.submitted}
/>
    </Box>
  );

  return (
    <Container maxWidth={false} sx={{ py: 2, width: "100%" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>{title}</Typography>

      <Box width="100%" bgcolor="#e3f2fd" p={2} borderRadius={1} mb={2}>
        <ContentViewer htmlContent={exercise.description}></ContentViewer>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 3 }}>
        <Stack spacing={2}>
          {/* Navbar */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <IconButton onClick={prevAttempt}><ArrowBackIosNewIcon /></IconButton>

            <Box textAlign="center" minWidth={100}>
              <Typography variant="subtitle1" color="text.secondary">
                Attempt {currentAttempt + 1} / {attempts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">{attempt.date}</Typography>
            </Box>

            <IconButton onClick={nextAttempt}><ArrowForwardIosIcon /></IconButton>

            <Box display="flex" alignItems="center" gap={1}>
              <Button onClick={startNewAttempt} variant="outlined" startIcon={<AddIcon />} disabled={!attempt.submitted}>
                New Attempt
              </Button>
              <Button onClick={() => handleSave(false)} variant="outlined" color="secondary" startIcon={<SaveIcon />} disabled={attempt.submitted}>
                Save
              </Button>
              <Button onClick={() => handleSave(true)} variant="contained" color="primary" endIcon={<SendIcon />} disabled={attempt.submitted}>
                Submit
              </Button>
            </Box>
          </Stack>

          {/* Feedback */}
          {attempt.submitted && <AssignmentResult key={attempt.id} feedback={attempt.feedback ?? ""} score={attempt.score ?? 0} />}

          {/* Editor */}
          <Box sx={{ height: "60vh", minHeight: 500, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>{Editor}</Box>
        </Stack>
      </Paper>

      {/* Fullscreen Editor */}
      <Dialog fullScreen open={fullscreen} onClose={() => setFullscreen(false)}>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setFullscreen(false)}><CloseIcon /></IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">HyLiMo Editor</Typography>
            <IconButton color="inherit" onClick={() => setShowInfo(v => !v)}><InfoIcon /></IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
          <Slide direction="down" in={showInfo} mountOnEnter unmountOnExit>
            <Paper sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, p: 3, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight="medium">{title}</Typography>
                <Typography variant="body1">{exercise.description}</Typography>
              </Stack>
            </Paper>
          </Slide>

          <Box sx={{ height: "100%", width: "100%" }}>{Editor}</Box>
        </Box>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={snackbarMessage}
      />
    </Container>
  );
}