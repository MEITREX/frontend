import React, { useState, useEffect } from 'react';
import { PlayerTypeSurveyQuery } from "@/__generated__/PlayerTypeSurveyQuery.graphql"
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import test from '../assets/test1.jpg'
import test2 from "../assets/test3.png"
import logo from "@/assets/logo.svg";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

const questions = [
  {
    question: "In team activities, you tend to",
    options: [
      {
        label: "actively assist teammates, share resources, and coordinate teamwork.",
        image: test,
        types: ["PHILANTHROPIST", "SOCIALISER", "FREE_SPIRIT"],
        non_types: ["ACHIEVER", "PLAYER", "DISRUPTOR"]
      },
      {
        label: "focus on personal goals and optimize strategies for rewards.",
        image: test2,
        types: ["ACHIEVER", "PLAYER", "DISRUPTOR"],
        non_types: ["PHILANTHROPIST", "SOCIALISER", "FREE_SPIRIT"]
      }
    ]
  },
  {
    question: "When exploring new features, you typically",
    options: [
      {
        label: "experiment freely, ignoring rule limitations.",
        image: test,
        types: ["FREE_SPIRIT", "DISRUPTOR", "PLAYER"],
        non_types: ["ACHIEVER", "SOCIALISER", "PHILANTHROPIST"]
      },
      {
        label: "follow tutorials step-by-step to unlock achievements.",
        image: test2,
        types: ["ACHIEVER", "SOCIALISER", "PHILANTHROPIST"],
        non_types: ["FREE_SPIRIT", "DISRUPTOR", "PLAYER"]
      }
    ]
  },
  {
    question: "Your view on competition is",
    options: [
      {
        label: "improve team rankings through collaboration.",
        image: test,
        types: ["SOCIALISER", "PHILANTHROPIST", "ACHIEVER"],
        non_types: ["DISRUPTOR", "PLAYER", "FREE_SPIRIT"]
      },
      {
        label: "break rules or exploit loopholes to outperform others.",
        image: test2,
        types: ["DISRUPTOR", "PLAYER", "FREE_SPIRIT"],
        non_types: ["SOCIALISER", "PHILANTHROPIST", "ACHIEVER"],
      }
    ]
  },
  {
    question: "After completing a task, your satisfaction comes from",
    options: [
      {
        label: "helping others or contributing to the community.",
        image: test,
        types: ["PHILANTHROPIST", "SOCIALISER", "ACHIEVER"],
        non_types: ["DISRUPTOR", "PLAYER", "FREE_SPIRIT"]
      },
      {
        label: "earning unique rewards or pushing system boundaries.",
        image: test2,
        types: ["DISRUPTOR", "PLAYER", "FREE_SPIRIT"],
        non_types: ["PHILANTHROPIST", "SOCIALISER", "ACHIEVER"]
      }
    ]
  },
  {
    question: "When encountering a system bug, you",
    options: [
      {
        label: "report it to improve the system.",
        image: test,
        types: ["PHILANTHROPIST", "ACHIEVER", "SOCIALISER"],
        non_types: ["DISRUPTOR", "FREE_SPIRIT", "PLAYER"]
      },
      {
        label: "exploit it to create new play styles.",
        image: test2,
        types: ["DISRUPTOR", "FREE_SPIRIT", "PLAYER"],
        non_types: ["PHILANTHROPIST", "ACHIEVER", "SOCIALISER"]
      }
    ]
  },
  {
    question: "Your preferred learning style is",
    options: [
      {
        label: "collaborating with others to solve tasks.",
        image: test,
        types: ["SOCIALISER", "PHILANTHROPIST", "ACHIEVER"],
        non_types: ["FREE_SPIRIT", "DISRUPTOR", "PLAYER"]
      },
      {
        label: "exploring independently with unconventional methods.",
        image: test2,
        types: ["FREE_SPIRIT", "DISRUPTOR", "PLAYER"],
        non_types: ["SOCIALISER", "PHILANTHROPIST", "ACHIEVER"]
      }
    ]
  },
  {
    question: "When designing a new feature, you prioritize",
    options: [
      {
        label: "user freedom for creative expression.",
        image: test,
        types: ["FREE_SPIRIT", "DISRUPTOR", "PLAYER"],
        non_types: ["ACHIEVER",  "PHILANTHROPIST", "SOCIALISER"]
      },
      {
        label: "clear progress tracking and reward systems.",
        image: test2,
        types: ["ACHIEVER",  "PHILANTHROPIST", "SOCIALISER"],
        non_types: ["FREE_SPIRIT", "DISRUPTOR", "PLAYER"]
      }
    ]
  },
  {
    question: "Your main criteria for choosing tasks are",
    options: [
      {
        label: "open-ended creativity and flexibility.",
        image: test,
        types: ["FREE_SPIRIT", "DISRUPTOR", "PLAYER"],
        non_types: ["ACHIEVER", "SOCIALISER",  "PHILANTHROPIST"]
      },
      {
        label: "achievement-driven goals or social opportunities.",
        image: test2,
        types: ["ACHIEVER", "SOCIALISER",  "PHILANTHROPIST"],
        non_types: ["FREE_SPIRIT", "DISRUPTOR", "PLAYER"]
      }
    ]
  },
  {
    question: "When earning rewards, you care most about",
    options: [
      {
        label: "their uniqueness or community impact.",
        image: test,
        types: ["PHILANTHROPIST", "FREE_SPIRIT", "SOCIALISER"],
        non_types: ["PLAYER", "ACHIEVER", "DISRUPTOR"]
      },
      {
        label: "their practical value or competitive advantage.",
        image: test2,
        types: ["PLAYER", "ACHIEVER", "DISRUPTOR"],
        non_types: ["PHILANTHROPIST", "FREE_SPIRIT", "SOCIALISER"]
      }
    ]
  },
  {
    question: "When others make mistakes, you usually",
    options: [
      {
        label: "offer guidance and support.",
        image: test,
        types: ["PHILANTHROPIST", "SOCIALISER", "ACHIEVER"],
        non_types: ["PLAYER", "DISRUPTOR", "FREE_SPIRIT"]
      },
      {
        label: "optimize your own strategy based on their errors.",
        image: test2,
        types: ["PLAYER", "DISRUPTOR", "FREE_SPIRIT"],
        non_types: ["PHILANTHROPIST", "SOCIALISER", "ACHIEVER"]
      }
    ]
  },
  {
    question: "Your attitude toward rules is",
    options: [
      {
        label: "follow them and find optimal solutions.",
        image: test,
        types: ["ACHIEVER", "PHILANTHROPIST", "SOCIALISER"],
        non_types: ["DISRUPTOR", "FREE_SPIRIT", "PLAYER"]
      },
      {
        label: "test their limits to innovate.",
        image: test2,
        types: ["DISRUPTOR", "FREE_SPIRIT", "PLAYER"],
        non_types: ["ACHIEVER", "PHILANTHROPIST", "SOCIALISER"]
      }
    ]
  },
  {
    question: "You prefer participating in",
    options: [
      {
        label: "community-building or charity projects.",
        image: test,
        types: ["PHILANTHROPIST", "SOCIALISER", "ACHIEVER"],
        non_types: ["PLAYER", "DISRUPTOR", "FREE_SPIRIT"]
      },
      {
        label: "time-limited competitions or experimental challenges.",
        image: test2,
        types: ["PLAYER", "DISRUPTOR", "FREE_SPIRIT"],
        non_types: ["PHILANTHROPIST", "SOCIALISER", "ACHIEVER"]
      }
    ]
  },
  // Weitere Fragen ...
];

const SurveyPopup = () => {
  const [open, setOpen] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number | null }>({});
  const [selected, setSelected] = useState<any>(null);
  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);

  useEffect(() => {
    const savedAnswer = answers[currentQuestionIndex];
    setSelected(savedAnswer ?? null);
  }, [currentQuestionIndex, answers]);


  const handleSelect = (answer: any, types: any, question: any, non_types: any ,i: number) => {
    setSelected({'question': question, 'answer': answer, 'types': types, 'non_types': non_types,  'index': i});
  };

  const handleNext = () => {
    const updatedAnswers = {
        ...answers,
        [currentQuestionIndex]: selected
      };
    setAnswers(updatedAnswers)
    setSelected(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setOpen(false);
      console.log("Antworten:", updatedAnswers);
    }
  };

  const handleSkip = async () => {
    const updatedAnswers = {
        ...answers,
        [currentQuestionIndex]: null
      };
    setAnswers(updatedAnswers)
    setSelected(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setOpen(false);
      console.log("Antworten:", updatedAnswers);
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
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 2,
            backgroundColor: '#eee',
            '& .MuiLinearProgress-bar': {
                backgroundColor: '#2196f3',
            }
          }}
        />
      </Box>
      <DialogTitle>
        Question {currentQuestionIndex + 1}
        <Button
          onClick={() => setConfirmSkipOpen(true)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            minWidth: 'auto',
            padding: 1,
            color: 'grey.600'
          }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          {current.question}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {current.options.map((opt, i) => (
            <Box
              key={i}
              onClick={() => handleSelect(opt.label, opt.types, current.question,  opt.non_types, i)}
              sx={{
                position: 'relative',
                width: '50%',
                height: 200,
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                border: selected?.index === i ? '4px solid #2196f3' : '4px solid transparent',
                transition: 'border 0.2s ease-in-out',
                backgroundImage: `url(${opt.image.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '0 0 6px rgba(0,0,0,0.7)',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  width: '100%',
                  textAlign: 'center',
                  py: 1
                }}
              >
                {opt.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
        <Button variant="contained" color="info" onClick={handleSkip}>
          Skip
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </Button>
        </Box>
      </DialogActions>
    </Dialog>
    <Dialog open={confirmSkipOpen} onClose={() => setConfirmSkipOpen(false)}>
      <DialogTitle>Are you sure you want to quit the survey?</DialogTitle>
      <DialogContent>
          <Typography>
            All your answers will be lost and there will be no chance to re-do the survey
          </Typography>
      </DialogContent>
      <DialogActions>
          <Button onClick={() => {
              setConfirmSkipOpen(false);
              setOpen(false); // schließt die Umfrage
            }}>
            Quit and skip survey
          </Button>
          <Button
            onClick={() => {
             
              setConfirmSkipOpen(false)
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

function GetPlayerHexadScore({ id }: { id: string }) {
  const { getPlayerHexadScoreById } =
  useLazyLoadQuery<PlayerTypeSurveyQuery>(
    graphql`
        query PlayerTypeSurveyQuery($id: UUID!) {
            getPlayerHexadScoreById(userId: $id) {
                scores {
                    type
                    value
                }
            }
        }
    `,
    { id }
  );
}

function EvaluateHexadType({input} :{input:Array<String>}, { id}:  {id: string}){
  const [commitMutation, isMutationInFlight] = useMutation(PlayerTypeSurveyCalcScoresMuataion);
  commitMutation({
    variables: {
      userId: id,
      input: input
    }
  })
}

const PlayerTypeSurveyCalcScoresMuataion = graphql`
    mutation PlayerTypeSurveyEvaluateHexadTypeMutation(
        $id: UUID!,
        $input: PlayerAnswerInput!,
    ) {
        evaluatePlayerHexadScore(
            userId: $id,
            input: $input
        ) {
            scores {
                type
                value
            }
        }
    }
`;

export default SurveyPopup;
