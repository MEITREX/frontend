"use client";
import { FormDivider } from "@/components/Form";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import {
  CapabilitiesTabPanel,
  EducationalObjective,
} from "./quiz/CapabilitiesTabPanel";
import { LectureMaterialsTabPanel } from "./quiz/LectureMaterialsTabPanel";
import { GenerateQuizModalMediaQuery } from "@/__generated__/GenerateQuizModalMediaQuery.graphql";
import { QuestionsTabPanel } from "./quiz/QuestionsTabPanel";
import {
  AiGenQuestionContext,
  GenerateQuizModalMutation,
} from "@/__generated__/GenerateQuizModalMutation.graphql";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export type CapabilityInput = {
  objectives: EducationalObjective[];
  keywords: string[];
  relationship: string;
};

const defaultCapability = {
  objectives: [],
  keywords: [""],
  relationship: "",
};

const defaultQuestionAmount = {
  multipleChoiceAmount: 0,
  clozeAmount: 0,
  associationAmount: 0,
};

export function GenerateQuizModal({
  onClose: _onClose,
  courseId,
  isOpen,
  quizId,
}: {
  onClose: () => void;
  isOpen: boolean;
  courseId: string;
  quizId: string;
}) {
  const [tabIndex, setTabIndex] = useState(0);

  const [capabilities, setCapabilities] =
    useState<CapabilityInput>(defaultCapability);

  const [materialIds, setMaterialIds] = useState<string[]>([]);

  const [questionAmount, setQuestionAmount] = useState<{
    multipleChoiceAmount: number;
    clozeAmount: number;
    associationAmount: number;
  }>(defaultQuestionAmount);

  const [error, setError] = useState<any>(null);

  const valid = useMemo(() => {
    const validCapabilities =
      capabilities.objectives.length !== 0 &&
      capabilities.relationship !== "" &&
      capabilities.keywords.every((kw) => kw.trim() !== "");

    const validMaterials =
      materialIds.length !== 0 && materialIds.every((m) => m !== "");
    const validQuestionAmount = Object.values(questionAmount).some(
      (amount) => amount !== 0
    );
    return (
      (tabIndex === 0 && validCapabilities) ||
      (tabIndex === 1 && validMaterials) ||
      (tabIndex === 2 && validQuestionAmount)
    );
  }, [capabilities, materialIds, questionAmount, tabIndex]);

  const data = useLazyLoadQuery<GenerateQuizModalMediaQuery>(
    graphql`
      query GenerateQuizModalMediaQuery {
        mediaRecords {
          id
          name
          type
          courseIds
        }
      }
    `,
    { courseId }
  );

  const mediaRecords = data.mediaRecords.filter((item) => {
    return item.courseIds.includes(courseId);
  });

  const [generate] = useMutation<GenerateQuizModalMutation>(graphql`
    mutation GenerateQuizModalMutation(
      $context: AiGenQuestionContext!
      $assessmentId: UUID!
    ) {
      mutateQuiz(assessmentId: $assessmentId) {
        aiGenerateQuestionAsync(context: $context) {
          assessmentId
        }
      }
    }
  `);

  function handleSubmit() {
    const sumOfQuesitonAmount = Object.values(questionAmount).reduce(
      (acc, val) => acc + val,
      0
    );
    const context: AiGenQuestionContext = {
      description:
        "Use the following keywords as context to generate the questions:\n" +
        capabilities.keywords.join(", "),
      allowMultipleCorrectAnswers: false,
      maxAnswersPerQuestion: 5,
      maxExactQuestions: 0,
      maxFreeTextQuestions: 0,
      maxMultipleChoiceQuestions: questionAmount.multipleChoiceAmount,
      maxNumericQuestions: 0,
      maxQuestions: sumOfQuesitonAmount,
      mediaRecordIds: materialIds,
      minQuestions: sumOfQuesitonAmount,
      quizId: quizId,
    };
    generate({
      variables: { context, assessmentId: quizId },
      onError: setError,

      onCompleted() {
        alert(
          "Generation of questions was started successfully!" +
            "\n Please come back later to review the generated questions!"
        );
        closeModal();
      },
    });
  }

  function closeModal() {
    setCapabilities(defaultCapability);
    setMaterialIds([]);
    setQuestionAmount(defaultQuestionAmount);
    setTabIndex(0);
    setError(null);
    _onClose();
  }

  function handleNext() {
    if (!valid) return;
    if (tabIndex != 2) {
      setTabIndex(tabIndex + 1);
    } else {
      handleSubmit();
    }
  }

  return (
    <Dialog maxWidth="sm" open={isOpen} onClose={_onClose}>
      <DialogTitle>Generate Quiz</DialogTitle>
      <FormDivider />
      {error?.source.errors.map((err: any, i: number) => (
        <Alert key={i} severity="error" onClose={() => setError(null)}>
          {err.message}
        </Alert>
      ))}
      <Box>
        <Tabs value={tabIndex} aria-label="basic tabs example">
          <Tab label="Capabilities" />
          <Tab label="Lecture Materials" />
          <Tab label="Questions" />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <CapabilitiesTabPanel
            capabilities={capabilities}
            onChange={setCapabilities}
          />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <LectureMaterialsTabPanel
            materialIds={materialIds}
            mediaRecords={mediaRecords}
            onChange={setMaterialIds}
          />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <QuestionsTabPanel
            questionAmounts={questionAmount}
            onChange={setQuestionAmount}
          />
        </TabPanel>
      </Box>
      <FormDivider />
      <DialogActions>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button onClick={_onClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Box className="inline-flex gap-2">
            <Button
              onClick={() => setTabIndex(Math.max(0, tabIndex - 1))}
              disabled={tabIndex == 0}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!valid}
              color="success"
              variant="outlined"
            >
              {tabIndex != 2 ? "Next" : "Generate"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
