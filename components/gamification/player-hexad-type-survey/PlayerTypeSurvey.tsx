import { PlayerTypeSurveyEvaluateHexadTypeMutation } from "@/__generated__/PlayerTypeSurveyEvaluateHexadTypeMutation.graphql";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { graphql, useMutation } from "react-relay";
import { PlayerTypes } from "../types";
import { questions } from "./questions";

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
  const [isStartScreen, setIsStartScreen] = useState(false);
  const [isSkippedScreen, setIsSkippedScreen] = useState(false);
  const [isNicknameScreen, setIsNicknameScreen] = useState(true);

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

    PlayerTypeSurveyCalcScoresMutation({
      variables: {
        id: id,
        input: { questions: input },
      },
      onError() {
        setIsErrorScreen(true);
      },
      onCompleted() {
        if (input.length > 0) {
          setIsCompletedScreen(true);
          setTimeout(() => setOpen(false), 8000);
        } else {
          setIsSkippedScreen(true);
          setTimeout(() => setOpen(false), 8000);
        }
      },
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
      handleFinishSurvey(updatedAnswers);
    }
  };

  const handleBack = () => {
    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    setSelected(answers[prevIndex] ?? null);
  };

  const handleSkipSurveyConfirm = () => {
    setIsSkippedScreen(true);
    handleFinishSurvey([]);
  };

  const current = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const adjectives = [
    "Swift",
    "Brave",
    "Clever",
    "Fierce",
    "Tiny",
    "Giant",
    "Happy",
    "Wild",
    "Cunning",
    "Lazy",
  ];

  const dinos = [
    "T-Rex",
    "Velociraptor",
    "Triceratops",
    "Stegosaurus",
    "Spinosaurus",
    "Brachiosaurus",
    "Pachycephalosaurus",
    "Ankylosaurus",
  ];

  function generateRandomNickname() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const dino = dinos[Math.floor(Math.random() * dinos.length)];
    const number = Math.floor(1000 + Math.random() * 9000); // 4-stellige Zahl

    return `${adj}${dino}${number}`;
  }

  const [nickname, setNickname] = useState(generateRandomNickname());

  if (isNicknameScreen) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogTitle sx={{ position: "relative" }}>
          <Typography variant="h6" fontWeight="bold">
            Pick your nickname
          </Typography>

          {/* Fortschrittsanzeige oben rechts */}
          <Box
            sx={{
              position: "absolute",
              right: 16,
              top: 8,
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "primary.main",
            }}
          >
            1 / 2
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={4}>
            <Typography variant="body1" mb={2}>
              This nickname will be your public display name throughout the
              application.
            </Typography>
            <TextField
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              fullWidth
              sx={{
                maxWidth: 400,
                mx: "auto",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#f44336",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "#d32f2f",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#d32f2f",
                  },
                },
              }}
            />

            <IconButton
              onClick={() => setNickname(generateRandomNickname())}
              size="large"
            >
              <AutorenewIcon sx={{ fontSize: 28, color: "#00a9d6" }} />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setIsNicknameScreen(false);
              setIsStartScreen(true);
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (isSkippedScreen) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
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
            value={100}
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
        <DialogTitle>
          <Button
            onClick={() => setConfirmSkipOpen(true)}
            disabled={true}
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
        <DialogContent>
          <Box textAlign="center" py={6}>
            <Box fontSize={60}>🚫</Box>
            <Typography variant="h5" fontWeight="bold" mt={2}>
              Survey skipped
            </Typography>
            <Typography mt={1}>
              Default settings have been applied. They’ll automatically adapt
              over time based on your interactions to provide a more
              personalized experience.
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

  if (isStartScreen) {
    return (
      <>
        <Dialog open={open} maxWidth="md" fullWidth>
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
              value={0}
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
          <DialogTitle>
            {/* Fortschrittsanzeige oben rechts */}
            <Box
              sx={{
                position: "absolute",
                right: 16,
                top: 8,
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "primary.main",
              }}
            >
              2 / 2
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box textAlign="center" py={6}>
              <Box fontSize={60}>📖</Box>
              <Typography variant="h5" fontWeight="bold" mt={2}>
                Welcome to the Player Type survey
              </Typography>
              <Typography mt={1}>
                This survey determines your Player Type, enabling us to adapt
                gamification elements in a way that keeps you engaged and
                personalizes your experience.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3 }}>
            <Button variant="contained" onClick={() => setIsStartScreen(false)}>
              Start Survey
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={confirmSkipOpen}
          onClose={() => setConfirmSkipOpen(false)}
        >
          <DialogTitle>Are you sure you want to quit the survey?</DialogTitle>
          <DialogContent>
            <Typography>
              All your answers will be lost and there will be no chance to re-do
              the survey.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleSkipSurveyConfirm()}>
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
  }

  if (isErrorScreen) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
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
            value={100}
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
        <DialogTitle>
          <Button
            onClick={() => setConfirmSkipOpen(true)}
            disabled={true}
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
        <DialogContent>
          <Box textAlign="center" py={6}>
            <Box fontSize={60}>❌</Box>
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
            value={100}
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
        <DialogTitle>
          <Button
            onClick={() => setConfirmSkipOpen(true)}
            disabled={true}
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
        <DialogContent>
          <Box textAlign="center" py={6}>
            <Box fontSize={60}>✔</Box>
            <Typography variant="h5" fontWeight="bold" mt={2}>
              Survey completed
            </Typography>
            <Typography mt={1}>
              Your player type has been determined based on your answers and
              will adapt as you continue using the application.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3 }}>
          <Button variant="contained" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
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
                    boxShadow: `0 0 0 ${
                      isSelected ? "2px #009BDE" : "1px #0000001A"
                    }`,
                    backgroundImage: `url(${opt.image.src})`,
                    backgroundSize: "auto calc(100% - 10px)",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: `0 0 0 2px ${
                        isSelected ? "#009BDE" : "#B3E6F9"
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
          <Button onClick={() => handleSkipSurveyConfirm()}>
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
