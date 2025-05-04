import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import test from '../assets/test1.jpg'
import test2 from "../assets/test3.png"
import logo from "@/assets/logo.svg";

const questions = [
  {
    question: "In team activities, you tend to",
    options: [
      {
        label: "actively assist teammates, share resources, and coordinate teamwork.",
        image: test,
        types: ["Philanthropist", "Socialiser", "Free Spirit"]
      },
      {
        label: "focus on personal goals and optimize strategies for rewards.",
        image: test2,
        types: ["Achiever", "Player", "Disruptor"]
      }
    ]
  },
  {
    question: "When exploring new features, you typically",
    options: [
      {
        label: "experiment freely, ignoring rule limitations.",
        image: test,
        types: ["Free Spirit", "Disruptor", "Player"]
      },
      {
        label: "follow tutorials step-by-step to unlock achievements.",
        image: test2,
        types: ["Achiever", "Socialiser", "Philanthropist"]
      }
    ]
  },
  {
    question: "Your view on competition is",
    options: [
      {
        label: "improve team rankings through collaboration.",
        image: test,
        types: ["Socialiser", "Philanthropist", "Achiever"]
      },
      {
        label: "break rules or exploit loopholes to outperform others.",
        image: test2,
        types: ["Disruptor", "Player", "Free Spirit"]
      }
    ]
  },
  {
    question: "After completing a task, your satisfaction comes from",
    options: [
      {
        label: "helping others or contributing to the community.",
        image: test,
        types: ["Philanthropist", "Socialiser", "Achiever"]
      },
      {
        label: "earning unique rewards or pushing system boundaries.",
        image: test2,
        types: ["Disruptor", "Player", "Free Spirit"]
      }
    ]
  },
  {
    question: "When encountering a system bug, you",
    options: [
      {
        label: "report it to improve the system.",
        image: test,
        types: ["Philanthropist", "Achiever", "Socialiser"]
      },
      {
        label: "exploit it to create new play styles.",
        image: test2,
        types: ["Disruptor", "Free Spirit", "Player"]
      }
    ]
  },
  {
    question: "Your preferred learning style is",
    options: [
      {
        label: "collaborating with others to solve tasks.",
        image: test,
        types: ["Socialiser", "Philanthropist", "Achiever"]
      },
      {
        label: "exploring independently with unconventional methods.",
        image: test2,
        types: ["Free Spirit", "Disruptor", "Player"]
      }
    ]
  },
  {
    question: "When designing a new feature, you prioritize",
    options: [
      {
        label: "user freedom for creative expression.",
        image: test,
        types: ["Free Spirit", "Disruptor", "Player"]
      },
      {
        label: "clear progress tracking and reward systems.",
        image: test2,
        types: ["Achiever",  "Philanthropist", "Socialiser"]
      }
    ]
  },
  {
    question: "Your main criteria for choosing tasks are",
    options: [
      {
        label: "open-ended creativity and flexibility.",
        image: test,
        types: ["Free Spirit", "Disruptor", "Player"]
      },
      {
        label: "achievement-driven goals or social opportunities.",
        image: test2,
        types: ["Achiever", "Socialiser",  "Philanthropist"]
      }
    ]
  },
  {
    question: "When earning rewards, you care most about",
    options: [
      {
        label: "their uniqueness or community impact.",
        image: test,
        types: ["Philanthropist", "Free Spirit", "Socialiser"]
      },
      {
        label: "their practical value or competitive advantage.",
        image: test2,
        types: ["Player", "Achiever", "Disruptor"]
      }
    ]
  },
  {
    question: "When others make mistakes, you usually",
    options: [
      {
        label: "offer guidance and support.",
        image: test,
        types: ["Philanthropist", "Socialiser", "Achiever"] 
      },
      {
        label: "optimize your own strategy based on their errors.",
        image: test2,
        types: ["Player", "Disruptor", "Free Spirit"]
      }
    ]
  },
  {
    question: "Your attitude toward rules is",
    options: [
      {
        label: "follow them and find optimal solutions.",
        image: test,
        types: ["Achiever", "Philanthropist", "Socialiser"] 
      },
      {
        label: "test their limits to innovate.",
        image: test2,
        types: ["Disruptor", "Free Spirit", "Player"]
      }
    ]
  },
  {
    question: "You prefer participating in",
    options: [
      {
        label: "community-building or charity projects.",
        image: test,
        types: ["Philanthropist", "Socialiser", "Achiever"] 
      },
      {
        label: "time-limited competitions or experimental challenges.",
        image: test2,
        types: ["Player", "Disruptor", "Free Spirit"]
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


  const handleSelect = (answer: any, types: any, question: any, i: number) => {
    setSelected({'question': question, 'answer': answer, 'types': types, 'index': i});
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
              onClick={() => handleSelect(opt.label, opt.types, current.question, i)}
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
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={selected === null}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
        </Button>
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

export default SurveyPopup;
