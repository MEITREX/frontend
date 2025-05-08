"use client";
import { QuizModalEditMutation } from "@/__generated__/QuizModalEditMutation.graphql";
import { QuizModalFragment$key } from "@/__generated__/QuizModalFragment.graphql";
import {
  CreateQuizInput,
  QuestionPoolingMode,
  QuizModalMutation,
} from "@/__generated__/QuizModalMutation.graphql";
import { Form, FormSection } from "@/components/Form";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "./AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "./ContentMetadataFormSection";

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

export function GenerateQuizModal({
  onClose: _onClose,
  chapterId,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
  chapterId: string;
}) {
  const [tabIndex, setTabIndex] = useState(0);

  const [input, setInput] = useState<CreateQuizInput>();

  const [error, setError] = useState<any>(null);

  function handleSubmit() {
    console.log("start query");
  }

  function handleNext() {
    if (tabIndex != 2) {
      setTabIndex(tabIndex + 1);
    } else {
      handleSubmit();
    }
  }

  return (
    <Dialog maxWidth="lg" open={isOpen} onClose={_onClose}>
      <DialogTitle>Generate Quiz</DialogTitle>
      <DialogContent>
        {error?.source.errors.map((err: any, i: number) => (
          <Alert key={i} severity="error" onClose={() => setError(null)}>
            {err.message}
          </Alert>
        ))}
        <Form>
          <Box mt={2}>
            <Tabs
              value={tabIndex}
              onChange={(_, newIndex) => setTabIndex(newIndex)}
              aria-label="basic tabs example"
            >
              <Tab label="Capabilities" />
              <Tab label="Lecture Materials" />
              <Tab label="Questions" />
            </Tabs>

            <TabPanel value={tabIndex} index={0}></TabPanel>
            <TabPanel value={tabIndex} index={1}></TabPanel>
            <TabPanel value={tabIndex} index={2}></TabPanel>
          </Box>
        </Form>
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button onClick={_onClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Box>
            <Button
              onClick={() => setTabIndex(Math.max(0, tabIndex - 1))}
              disabled={tabIndex == 0}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {tabIndex != 2 ? "Next" : "Save"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
