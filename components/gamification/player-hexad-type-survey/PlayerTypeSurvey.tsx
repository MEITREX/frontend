import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { graphql, useMutation } from "react-relay";
import { PlayerTypeSurveyEvaluateHexadTypeMutation } from "@/__generated__/PlayerTypeSurveyEvaluateHexadTypeMutation.graphql";
import { questions } from "./questions";
import { PlayerTypes } from "../types";

type Answer = {
  question: string;
  answer: string;
  types: PlayerTypes[];
  non_types: PlayerTypes[];
  index: number;
};

const SurveyPopup = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer | null>>({});
  const [selected, setSelected] = useState<Answer | null>(null);
  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);
  const [isCompletedScreen, setIsCompletedScreen] = useState(false);
  const [isErrorScreen, setIsErrorScreen] = useState(false);

  useEffect(() => {
    const savedAnswer = answers[currentQuestionIndex];
    setSelected(savedAnswer ?? null);
  }, [currentQuestionIndex, answers]);

  const [PlayerTypeSurveyCalcScoresMutation] =
    useMutation<PlayerTypeSurveyEvaluateHexadTypeMutation>(graphql`
      mutation PlayerTypeSurveyEvaluateHexadTypeMutation(
        $id: UUID!
        $input: PlayerAnswerInput!
      ) {
        evaluatePlayerHexadScore(userId: $id, input: $input) {
          scores {
            type
            value
          }
        }
      }
    `);

  const handleFinishSurvey = (
    updatedAnswers: Record<number, Answer | null>
  ) => {
    const input = Object.entries(updatedAnswers)
      .filter(([_, answer]) => answer !== null)
      .map(([index, answer]) => ({
        text: questions[Number(index)].question,
        selectedAnswer: {
          text: answer!.answer,
          playerTypes: answer!.types,
        },
        possibleAnswers: questions[Number(index)].options.map((opt) => ({
          text: opt.label,
          playerTypes: opt.types,
        })),
      }));

    if (!id) {
      console.error("Invalid user ID:", id);
      return;
    }

    console.log()

    PlayerTypeSurveyCalcScoresMutation({
      variables: {
        id: id,
        input: { questions: input },
      },
      onError() {
        setIsErrorScreen(true); // ❌ Fehler anzeigen
      },
      onCompleted() {
        // 👉 Abschluss-Screen erst nach erfolgreicher Mutation anzeigen
        setIsCompletedScreen(true);
        setTimeout(() => setOpen(false), 8000);
      }
    });
  };

  const handleSelect = (
    answer: string,
    types: PlayerTypes[],
    question: string,
    non_types: PlayerTypes[],
    i: number
  ) => {
    setSelected({
      question,
      answer,
      types,
      non_types,
      index: i,
    });
  };

  const handleNext = () => {
    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: selected,
    };
    setAnswers(updatedAnswers);
    setSelected(null);

    const lastQuestion = currentQuestionIndex === questions.length - 1;

    if (!lastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishSurvey(updatedAnswers);
    }
  };

  const handleSkip = () => {
    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: null,
    };
    setAnswers(updatedAnswers);
    setSelected(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishSurvey(updatedAnswers)
    }
  };

  const handleBack = () => {
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    setSelected(answers[prevIndex] ?? null);
  };

  const handleSkipSurveyConfirm = () => {
    setConfirmSkipOpen(false);
    setOpen(false);
    handleFinishSurvey([])
  }

  const current = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  if (isErrorScreen) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <Box textAlign="center" py={6}>
            <Box fontSize={60}>❌</Box> {/* ❌ Emoji für Fehleranzeige */}
            <Typography variant="h5" fontWeight="bold" mt={2}>
              Submission failed
            </Typography>
            <Typography mt={1}>
              We couldn’t save your answers. Please try again later.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3 }}>
          <Button onClick={() => setOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isCompletedScreen) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <Box textAlign="center" py={6}>
            <Box fontSize={60}>✔</Box>
            <Typography variant="h5" fontWeight="bold" mt={2}>
              Survey completed
            </Typography>
            <Typography mt={1}>
              Your player type is now tailored to your preferences
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3 }}>
          <Button variant="contained" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }



  return (
    <>
      {/* Main Survey Dialog */}
      <Dialog open={open} maxWidth="md" fullWidth>
        {/* Progress Bar */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "white",
          }}
        >
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 2,
              backgroundColor: "#eee",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#2196f3",
              },
            }}
          />
        </Box>

        {/* Title and Close Button */}
        <DialogTitle>
          Question {currentQuestionIndex + 1}
          <Button
            onClick={() => setConfirmSkipOpen(true)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              minWidth: "auto",
              padding: 1,
              color: "grey.600",
            }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        {/* Question Content */}
        <DialogContent>

          <Typography variant="h6" fontWeight="bold" mb={2}>
            {current.question}
          </Typography>

          {/* Answer Options */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            {current.options.map((opt, i) => {
              const isSelected = selected?.index === i;
              return (
                <Box
                  key={i}
                  onClick={() =>
                    handleSelect(
                      opt.label,
                      opt.types,
                      current.question,
                      opt.non_types,
                      i
                    )
                  }
                  sx={{
                    position: "relative",
                    width: "50%",
                    height: 200,
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    transition: "transform 0.3s ease, border 0.2s ease-in-out",
                    boxShadow: `0 0 0 ${isSelected ? "2px #009BDE" : "1px #0000001A"
                      }`,
                    backgroundImage: `url(${opt.image.src})`,
                    backgroundSize: "auto calc(100% - 10px)",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: `0 0 0 2px ${isSelected ? "#009BDE" : "#B3E6F9"
                        }`,
                      zIndex: 1,
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      width: "100%",
                      textAlign: "center",
                      py: 1,
                      color: "white",
                      fontWeight: 600,
                      textShadow: "0 0 5px rgba(0,0,0,0.7)",
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {opt.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </DialogContent>

        {/* Navigation Buttons */}
        <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>

          <Button variant="outlined" color="info" onClick={handleSkip}>
            Skip
          </Button>
          <Box sx={{ display: "flex", gap: 2 }}>
            {currentQuestionIndex > 0 && (
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={selected === null}
            >
              {currentQuestionIndex === questions.length - 1
                ? "Finish"
                : "Next"}
            </Button>
          </Box>

        </DialogActions>
      </Dialog>

      {/* Confirm Skip Dialog */}
      <Dialog open={confirmSkipOpen} onClose={() => setConfirmSkipOpen(false)}>
        <DialogTitle>Are you sure you want to quit the survey?</DialogTitle>
        <DialogContent>
          <Typography>
            All your answers will be lost and there will be no chance to re-do
            the survey.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleSkipSurveyConfirm()}
          >
            Quit and skip survey
          </Button>
          <Button
            color="info"
            variant="contained"
            onClick={() => setConfirmSkipOpen(false)}
          >
            Back to survey
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SurveyPopup;
