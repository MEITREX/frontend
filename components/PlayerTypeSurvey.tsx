"use client";
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, RadioGroup, FormControlLabel, Radio, Typography, Box, LinearProgress
} from '@mui/material';


const SurveyPopup = () => {
  const questions = [{
    question: 'In team activities, you tend to',
    options: ['actively assist teammates, share resources, and coordinate teamwork.',
        'focus on personal goals and optimize strategies for rewards.']
  }, {
    question: 'When exploring new features, you typically',
    options: ['experiment freely, ignoring rule limitations.', 
        'follow tutorials step-by-step to unlock achievements.']
  }, {
    question: 'Your view on competition is',
    options: ['improve team rankings through collaboration.',
        'break rules or exploit loopholes to outperform others.']
  }, {
    question: 'After completing a task, your satisfaction comes from',
    options: ['helping others or contributing to the community.', 
        'earning unique rewards or pushing system boundaries.']
  }, {
    question: 'When encountering a system bug, you',
    options: ['report it to improve the system.',
        'exploit it to create new play styles.']
  }, {
    question: 'Your preferred learning style is',
    options: ['collaborating with others to solve tasks.', 
        'exploring independently with unconventional methods.']
  }, {
    question: 'When designing a new feature, you prioritize',
    options: ['user freedom for creative expression.',
        'clear progress tracking and reward systems.']
  }, {
    question: 'Your main criteria for choosing tasks are',
    options: ['open-ended creativity and flexibility.', 
        'achievement-driven goals or social opportunities.']
  }, {
    question: 'When earning rewards, you care most about',
    options: ['their uniqueness or community impact.',
        'their practical value or competitive advantage.']
  }, {
    question: 'When others make mistakes, you usually',
    options: ['offer guidance and support.', 
        'optimize your own strategy based on their errors.']
  }, {
    question: 'Your attitude toward rules is',
    options: ['follow them and find optimal solutions.',
        'test their limits to innovate.']
  }, {
    question: 'You prefer participating in',
    options: ['community-building or charity projects.', 
        'time-limited competitions or experimental challenges.']
  }]

  const [open, setOpen] = useState(true);
  const [confirmSkipOpen, setConfirmSkipOpen] = useState(false);
  const [answers, setAnswers] = useState<any>({});

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [index]: value
    }));
  };

  const handleFinish = () => {
    console.log('Antworten:', answers);
    setOpen(false);
  };

  const handleSkip = () => {
    console.log('Umfrage übersprungen');
    setOpen(false);
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key] !== ''
  ).length;
  const progress = (answeredCount / totalQuestions) * 100;

  

  return (
    <>
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>Player Type Questionaire</DialogTitle>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white' }}>
        <LinearProgress variant="determinate" 
            value={progress} 
            sx={{
                height: 6,
                borderRadius: 4,
                backgroundColor: '#ccebf8', // Hintergrund (nicht gefüllter Teil)
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#009bde', // gefüllter Teil (hier: grün)
                }
              }}
        />
      </Box>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          This is to find out which kind of person you are, to adjust the gamification for you
        </Typography>

        {questions.map((q, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>{q.question}</Typography>
            <RadioGroup
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            >
              {q.options.map((opt: any, i: any) => (
                <FormControlLabel
                  key={i}
                  value={opt}
                  control={<Radio  size="small"/>}
                  label={opt}
                />
              ))}
            </RadioGroup>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Box
            sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            px: 3, // horizontaler Padding, wie in MUI default Content
            }}
        >
            <Button variant="contained" 
                sx={{
                    backgroundColor: '#3369ad',  // Lila Hex-Wert
                    color: '#fff',               // weiße Schrift
                    '&:hover': {
                    backgroundColor: '#2e5f9c', // dunkleres Lila beim Hover
                    }
                }} 
                onClick={() => setConfirmSkipOpen(true)}>
                Skip
            </Button>
            <Button variant="contained" 
                sx={{
                    backgroundColor: '#009bde',  // Lila Hex-Wert
                    color: '#fff',               // weiße Schrift
                    '&:hover': {
                    backgroundColor: '#1aa5e1', // dunkleres Lila beim Hover
                    }
                }}  
                onClick={handleFinish}>
                Finish
            </Button>
        </Box>
      </DialogActions>

    </Dialog>

    <Dialog open={confirmSkipOpen} onClose={() => setConfirmSkipOpen(false)}>
        <DialogTitle>Skip survey?</DialogTitle>
        <DialogContent>
            <Typography>
                Are sure you want skip the survey? This will lead to non-personalized default values in your
                player type analysis.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setConfirmSkipOpen(false)}>
                Back to survey
            </Button>
            <Button
                onClick={() => {
                setConfirmSkipOpen(false);
                setOpen(false);  // schließt das Haupt-Survey-Popup
                }}
                sx={{
                    backgroundColor: '#3369ad',  // Lila Hex-Wert
                    color: '#fff',               // weiße Schrift
                    '&:hover': {
                    backgroundColor: '#2e5f9c', // dunkleres Lila beim Hover
                    }
                }} 
                variant="contained"
            >
                Skip
            </Button>
        </DialogActions>
    </Dialog>
    </>
  );
};

export default SurveyPopup;
