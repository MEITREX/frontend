import team_collaberation_1_A from "@/assets/survey/team_collaberation_1_A.svg";
import personal_goals_1_B from "@/assets/survey/personal_goals_1_B.svg";
import experiment_2_A from "@/assets/survey/experiment_2_A.svg";
import completed_steps_2_B from "@/assets/survey/completed_steps_2_B.svg";
import collaberation_3_A from "@/assets/survey/collaberation_3_A.svg";
import loophole_3_B from "@/assets/survey/loophole_3_B.svg";
import love_4_A from "@/assets/survey/love_4_A.svg";
import rewards_4_B from "@/assets/survey/rewards_4_B.svg";
import bugfix_5_A from "@/assets/survey/bugfix_5_A.svg";
import exploit_5_B from "@/assets/survey/exploit_5_B.svg";
import teamwork_6_A from "@/assets/survey/teamwork_6_A.svg";
import explore_6_B from "@/assets/survey/explore_6_B.svg";
import creative_7_A from "@/assets/survey/creative_7_A.svg";
import progress_7_B from "@/assets/survey/progress_7_B.svg";
import openend_8_A from "@/assets/survey/openend_8_A.svg";
import achievement_8_B from "@/assets/survey/achievement_8_B.svg";
import impact_9_A from "@/assets/survey/impact_9_A.svg";
import advantage_9_B from "@/assets/survey/advantage_9_B.svg";
import guidance_10_A from "@/assets/survey/guidance_10_A.svg";
import optimize_10_B from "@/assets/survey/optimize_10_B.svg";
import rules_11_A from "@/assets/survey/rules_11_A.svg";
import barriers_11_B from "@/assets/survey/barriers_11_B.svg";
import community_12_A from "@/assets/survey/community_12_A.svg";
import competition_12_B from "@/assets/survey/competition_12_B.svg";

enum PlayerTypes {
  ACHIEVER = "ACHIEVER",
  PLAYER = "PLAYER",
  SOCIALISER = "SOCIALISER",
  PHILANTHROPIST = "PHILANTHROPIST",
  FREE_SPIRIT = "FREE_SPIRIT",
  DISRUPTOR = "DISRUPTOR",
}

export const questions = [
  {
    question: "In team activities, you tend to",
    options: [
      {
        label:
          "actively assist teammates, share resources, and coordinate teamwork.",
        image: team_collaberation_1_A,
        types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
          PlayerTypes.FREE_SPIRIT,
        ],
        non_types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.PLAYER,
          PlayerTypes.DISRUPTOR,
        ],
      },
      {
        label: "focus on personal goals and optimize strategies for rewards.",
        image: personal_goals_1_B,
        types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.PLAYER,
          PlayerTypes.DISRUPTOR,
        ],
        non_types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
          PlayerTypes.FREE_SPIRIT,
        ],
      },
    ],
  },
  {
    question: "When exploring new features, you typically",
    options: [
      {
        label: "experiment freely, ignoring rule limitations.",
        image: experiment_2_A,
        types: [
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
        ],
        non_types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.SOCIALISER,
          PlayerTypes.PHILANTHROPIST,
        ],
      },
      {
        label: "follow tutorials step-by-step to unlock achievements.",
        image: completed_steps_2_B,
        types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.SOCIALISER,
          PlayerTypes.PHILANTHROPIST,
        ],
        non_types: [
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
        ],
      },
    ],
  },
  {
    question: "Your view on competition is",
    options: [
      {
        label: "improve team rankings through collaboration.",
        image: collaberation_3_A,
        types: [
          PlayerTypes.SOCIALISER,
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.ACHIEVER,
        ],
        non_types: [
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
          PlayerTypes.FREE_SPIRIT,
        ],
      },
      {
        label: "break rules or exploit loopholes to outperform others.",
        image: loophole_3_B,
        types: [
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
          PlayerTypes.FREE_SPIRIT,
        ],
        non_types: [
          PlayerTypes.SOCIALISER,
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.ACHIEVER,
        ],
      },
    ],
  },
  {
    question: "After completing a task, your satisfaction comes from",
    options: [
      {
        label: "helping others or contributing to the community.",
        image: love_4_A,
        types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
          PlayerTypes.ACHIEVER,
        ],
        non_types: [
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
          PlayerTypes.FREE_SPIRIT,
        ],
      },
      {
        label: "earning unique rewards or pushing system boundaries.",
        image: rewards_4_B,
        types: [
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
          PlayerTypes.FREE_SPIRIT,
        ],
        non_types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
          PlayerTypes.ACHIEVER,
        ],
      },
    ],
  },
  {
    question: "When encountering a system bug, you",
    options: [
      {
        label: "report it to improve the system.",
        image: bugfix_5_A,
        types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.ACHIEVER,
          PlayerTypes.SOCIALISER,
        ],
        non_types: [
          PlayerTypes.DISRUPTOR,
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.PLAYER,
        ],
      },
      {
        label: "exploit it to create new play styles.",
        image: exploit_5_B,
        types: [
          PlayerTypes.DISRUPTOR,
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.PLAYER,
        ],
        non_types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.ACHIEVER,
          PlayerTypes.SOCIALISER,
        ],
      },
    ],
  },
  {
    question: "Your preferred learning style is",
    options: [
      {
        label: "collaborating with others to solve tasks.",
        image: teamwork_6_A,
        types: [
          PlayerTypes.SOCIALISER,
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.ACHIEVER,
        ],
        non_types: [
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
        ],
      },
      {
        label: "exploring independently with unconventional methods.",
        image: explore_6_B,
        types: [
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
        ],
        non_types: [
          PlayerTypes.SOCIALISER,
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.ACHIEVER,
        ],
      },
    ],
  },
  {
    question: "When designing a new feature, you prioritize",
    options: [
      {
        label: "user freedom for creative expression.",
        image: creative_7_A,
        types: [
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
        ],
        non_types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
        ],
      },
      {
        label: "clear progress tracking and reward systems.",
        image:progress_7_B,
        types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
        ],
        non_types: [
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
        ],
      },
    ],
  },
  {
    question: "Your main criteria for choosing tasks are",
    options: [
      {
        label: "open-ended creativity and flexibility.",
        image: openend_8_A,
        types: [
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
        ],
        non_types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.SOCIALISER,
          PlayerTypes.PHILANTHROPIST,
        ],
      },
      {
        label: "achievement-driven goals or social opportunities.",
        image: achievement_8_B,
        types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.SOCIALISER,
          PlayerTypes.PHILANTHROPIST,
        ],
        non_types: [
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.PLAYER,
        ],
      },
    ],
  },
  {
    question: "When earning rewards, you care most about",
    options: [
      {
        label: "their uniqueness or community impact.",
        image: impact_9_A,
        types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.SOCIALISER,
        ],
        non_types: [
          PlayerTypes.PLAYER,
          PlayerTypes.ACHIEVER,
          PlayerTypes.DISRUPTOR,
        ],
      },
      {
        label: "their practical value or competitive advantage.",
        image: advantage_9_B,
        types: [
          PlayerTypes.PLAYER,
          PlayerTypes.ACHIEVER,
          PlayerTypes.DISRUPTOR,
        ],
        non_types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.SOCIALISER,
        ],
      },
    ],
  },
  {
    question: "When others make mistakes, you usually",
    options: [
      {
        label: "offer guidance and support.",
        image: guidance_10_A,
        types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
          PlayerTypes.ACHIEVER,
        ],
        non_types: [
          PlayerTypes.PLAYER,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.FREE_SPIRIT,
        ],
      },
      {
        label: "optimize your own strategy based on their errors.",
        image: optimize_10_B,
        types: [
          PlayerTypes.PLAYER,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.FREE_SPIRIT,
        ],
        non_types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
          PlayerTypes.ACHIEVER,
        ],
      },
    ],
  },
  {
    question: "Your attitude toward rules is",
    options: [
      {
        label: "follow them and find optimal solutions.",
        image: rules_11_A,
        types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
        ],
        non_types: [
          PlayerTypes.DISRUPTOR,
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.PLAYER,
        ],
      },
      {
        label: "test their limits to innovate.",
        image: barriers_11_B,
        types: [
          PlayerTypes.DISRUPTOR,
          PlayerTypes.FREE_SPIRIT,
          PlayerTypes.PLAYER,
        ],
        non_types: [
          PlayerTypes.ACHIEVER,
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
        ],
      },
    ],
  },
  {
    question: "You prefer participating in",
    options: [
      {
        label: "community-building or charity projects.",
        image: community_12_A,
        types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
          PlayerTypes.ACHIEVER,
        ],
        non_types: [
          PlayerTypes.PLAYER,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.FREE_SPIRIT,
        ],
      },
      {
        label: "Time-limited competitions or experimental challenges.",
        image: competition_12_B,
        types: [
          PlayerTypes.PLAYER,
          PlayerTypes.DISRUPTOR,
          PlayerTypes.FREE_SPIRIT,
        ],
        non_types: [
          PlayerTypes.PHILANTHROPIST,
          PlayerTypes.SOCIALISER,
          PlayerTypes.ACHIEVER,
        ],
      },
    ],
  },
  // Weitere Fragen ...
];

const SurveyPopup = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer | null>>({});
  const [selected, setSelected] = useState<any>(null);
  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);
  var showSurvey = false;

  useEffect(() => {
    const savedAnswer = answers[currentQuestionIndex];
    setSelected(savedAnswer ?? null);
  }, [currentQuestionIndex, answers]);

  useEffect(() => {}, []);

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

  type Answer = {
    answer: string;
    types: PlayerTypes[];
    index: number;
  };

  const handleFinishSurvey = (updatedAnswers: Record<number, Answer>) => {
    const input = Object.entries(updatedAnswers).map(([index, option]) => ({
      text: questions[Number(index)].question,
      selectedAnswer: {
        text: option?.answer,
        playerTypes: option?.types,
      },
      possibleAnswers: questions[Number(index)].options.map((opt) => ({
        text: opt.label,
        playerTypes: opt.types,
      })),
    }));

    if (!id || typeof id !== "string") {
      console.error("Ungültige oder fehlende userId:", id);
      return;
    }

    if (!id) return;

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

  const handleSkip = async () => {
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

    // Wiederherstellen der vorherigen Antwort (falls vorhanden)
    const previousAnswerIndex = answers[prevIndex];

    setCurrentQuestionIndex(prevIndex);
    setSelected(previousAnswerIndex ?? null);
  };

  const current = questions[currentQuestionIndex];

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

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
        <DialogContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {current.question}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            {current.options.map((opt, i) => (
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
                  border:
                    selected?.index === i
                      ? "4px solid #2196f3"
                      : "4px solid transparent",
                  transition: "border 0.2s ease-in-out",
                  backgroundImage: `url(${opt.image.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textShadow: "0 0 6px rgba(0,0,0,0.7)",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    width: "100%",
                    textAlign: "center",
                    py: 1,
                  }}
                >
                  {opt.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
          <Button variant="contained" color="info" onClick={handleSkip}>
            Skip
          </Button>
          <Box sx={{ display: "flex", gap: 2 }}>
            {currentQuestionIndex > 0 && (
              <Button variant="outlined" onClick={handleBack}>
                Zurück
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
      <Dialog open={confirmSkipOpen} onClose={() => setConfirmSkipOpen(false)}>
        <DialogTitle>Are you sure you want to quit the survey?</DialogTitle>
        <DialogContent>
          <Typography>
            All your answers will be lost and there will be no chance to re-do
            the survey
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmSkipOpen(false);
              setOpen(false); // schließt die Umfrage
            }}
          >
            Quit and skip survey
          </Button>
          <Button
            onClick={() => {
              setConfirmSkipOpen(false);
            }}
            color="info"
            variant="contained"
          >
            Back to survey
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SurveyPopup;
