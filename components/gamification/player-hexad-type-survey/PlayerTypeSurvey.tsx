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
  answer: string;
  types: PlayerTypes[];
  index: number;
};

const SurveyPopup = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer | null>>({});
  const [selected, setSelected] = useState<Answer | null>(null);
  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);

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

  const handleFinishSurvey = (updatedAnswers: Record<number, Answer | null>) => {
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

    PlayerTypeSurveyCalcScoresMutation({
      variables: {
        id: id,
        input: { questions: input },
      },
    });
  };

  const handleSelect = (
    answer: any,
    types: any,
    question: any,
    non_types: any,
    i: number
  ) => {
    setSelected({
      question: question,
      answer: answer,
      types: types,
      non_types: non_types,
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

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setOpen(false);
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
      setOpen(false);
    }
  };

  const handleBack = () => {
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    setSelected(answers[prevIndex] ?? null);
  };

  const current = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <>
      {/* Main Survey Dialog */}
      <Dialog open={open} maxWidth="md" fullWidth>
        {/* Progress Bar */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
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
                    handleSelect(opt.label, opt.types, current.question, opt.non_types, i)
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
                    boxShadow: `0 0 0 ${isSelected ? "2px #009BDE" : "1px #0000001A"}`,
                    backgroundImage: `url(${opt.image.src})`,
                    backgroundSize: "auto calc(100% - 10px)",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: `0 0 0 2px ${isSelected ? "#009BDE" : "#B3E6F9"}`,
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
          <Button variant="contained" color="info" onClick={handleSkip}>
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
              {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirm Skip Dialog */}
      <Dialog open={confirmSkipOpen} onClose={() => setConfirmSkipOpen(false)}>
        <DialogTitle>Are you sure you want to quit the survey?</DialogTitle>
        <DialogContent>
          <Typography>
            All your answers will be lost and there will be no chance to re-do the survey.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmSkipOpen(false);
              setOpen(false);
            }}
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
