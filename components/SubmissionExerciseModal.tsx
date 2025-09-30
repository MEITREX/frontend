"use client";
import { SubmissionExerciseModalCreateMutation } from "@/__generated__/SubmissionExerciseModalCreateMutation.graphql";
import { Form, FormSection } from "@/components/Form";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "./AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "./ContentMetadataFormSection";

const defaultInput = {
  questionPoolingMode: "RANDOM",
  requiredCorrectAnswers: 4,
  numberOfRandomlySelectedQuestions: 5,
} as const;

export function SubmissionExerciseModal({
  onClose: _onClose,
  chapterId,
  isOpen,
  _existingSubmission,
}: {
  onClose: () => void;
  isOpen: boolean;
  chapterId: string;
  _existingSubmission: any;
}) {
  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(
    _existingSubmission ? _existingSubmission.metadata : null
  );
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(
      _existingSubmission ? _existingSubmission.assessmentMetadata : null
    );

  const [deadline, setDeadline] = useState<{
    endDate: string | null;
  }>({
    endDate: _existingSubmission
      ? _existingSubmission.endDate
      : new Date().toISOString(),
  });

  const [create, loading] =
    useMutation<SubmissionExerciseModalCreateMutation>(graphql`
      mutation SubmissionExerciseModalCreateMutation(
        $submissionExerciseInput: InputSubmissionExercise!
        $assessmentInput: CreateAssessmentInput!
      ) {
        createSubmissionAssessment(
          assessmentInput: $assessmentInput
          submissionExerciseInput: $submissionExerciseInput
        ) {
          id
          __typename
          ...ContentLinkFragment
        }
      }
    `);

  const [error, setError] = useState<any>(null);

  const valid = Boolean(
    metadata?.name?.trim() &&
      assessmentMetadata &&
      deadline.endDate &&
      dayjs(deadline.endDate).isValid()
  );

  function onClose() {
    _onClose();
  }

  function handleSubmit() {
    console.log(deadline);
    if (!valid) {
      return;
    }

    create({
      variables: {
        submissionExerciseInput: {
          endDate: deadline.endDate!,
          tasks: [],
        },
        assessmentInput: {
          metadata: {
            ...metadata!,
            type: "SUBMISSION",
            chapterId,
          },
          assessmentMetadata: assessmentMetadata!,
        },
      },
      onCompleted() {
        onClose();
      },
      onError: setError,
      updater(store, data) {
        // Get record of chapter and of the new assignment
        const chapterRecord = store.get(chapterId);
        const newRecord = store.get(data.createSubmissionAssessment.id);

        if (!chapterRecord || !newRecord) return;

        // Update the linked records of the chapter contents
        const contentRecords = chapterRecord.getLinkedRecords("contents") ?? [];
        chapterRecord.setLinkedRecords(
          [...contentRecords, newRecord],
          "contents"
        );
      },
    });
  }

  return (
    <Dialog maxWidth="lg" open={isOpen} onClose={onClose}>
      <DialogTitle>Add Submission Exercise</DialogTitle>
      <DialogContent>
        {error?.source.errors.map((err: any, i: number) => (
          <Alert key={i} severity="error" onClose={() => setError(null)}>
            {err.message}
          </Alert>
        ))}
        <Form>
          <ContentMetadataFormSection
            metadata={metadata}
            onChange={setMetadata}
            suggestedTags={[]}
          />

          <AssessmentMetadataFormSection
            metadata={assessmentMetadata}
            onChange={setAssessmentMetadata}
          />
          <FormSection title="Deadline">
            <DatePicker
              label="Suggested start date"
              value={deadline.endDate ? dayjs(deadline.endDate) : null}
              onChange={(newValue: Dayjs | null) => {
                setDeadline({
                  endDate: newValue ? newValue.toISOString() : null,
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  error={
                    deadline.endDate != null &&
                    !dayjs(deadline.endDate).isValid()
                  }
                />
              )}
            />
          </FormSection>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          loading={loading}
          disabled={!valid || loading}
          onClick={handleSubmit}
        >
          {"Add"}
        </LoadingButton>
      </DialogActions>

      {Array.isArray(error?.source?.errors) &&
        error.source.errors.map((err: any, i: number) => (
          <Alert key={i} severity="error" onClose={() => setError(null)}>
            {err?.message ?? "Unknown error"}
          </Alert>
        ))}
    </Dialog>
  );
}
