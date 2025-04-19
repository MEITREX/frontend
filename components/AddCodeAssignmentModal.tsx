"use client";

import { useState, useEffect } from "react";
import {
  fetchQuery,
  graphql,
  useMutation,
  useRelayEnvironment,
} from "react-relay";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Alert,
  CircularProgress,
  Backdrop,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";

import { codeAssessmentProvider } from "./ProviderConfig";
import { AddCodeAssignmentModalAccessTokenQuery } from "@/__generated__/AddCodeAssignmentModalAccessTokenQuery.graphql";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "./AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "./ContentMetadataFormSection";
import { Form, FormSection } from "./Form";
import { ProviderAuthorizationDialog } from "./ProviderAuthorizationDialog";
import {
  AddCodeAssignmentModalMutation,
  ContentType,
  SkillType,
} from "@/__generated__/AddCodeAssignmentModalMutation.graphql";
import { set } from "lodash";
import { LoadingButton } from "@mui/lab";
import toast from "react-hot-toast";

export function AddCodeAssignmentModal({
  onClose,
  chapterId,
}: {
  onClose: () => void;
  chapterId: string;
}) {
  const env = useRelayEnvironment();
  const [isAccessTokenAvailable, setIsAccessTokenAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);
  const [requiredPercentage, setRequiredPercentage] = useState<number | null>(null);
  const [error, setError] = useState<any>(null);

  const valid =
  metadata != null &&
  assessmentMetadata != null &&
  requiredPercentage !== null &&
  requiredPercentage >= 0 &&
  requiredPercentage <= 100;

  const [createAssignment, isCreatingAssignment] =
  useMutation<AddCodeAssignmentModalMutation>(graphql`
    mutation AddCodeAssignmentModalMutation(
      $assessmentInput: CreateAssessmentInput!
      $assignmentInput: CreateAssignmentInput!
    ) {
      createAssignmentAssessment(
        assessmentInput: $assessmentInput
        assignmentInput: $assignmentInput
      ) {
        id
        ...ContentLinkFragment
        
        userProgressData {
          nextLearnDate
        }
      }
    }
  `);


  useEffect(() => {
    setIsLoading(true);
    fetchQuery<AddCodeAssignmentModalAccessTokenQuery>(
      env,
      graphql`
        query AddCodeAssignmentModalAccessTokenQuery($provider: ExternalServiceProviderDto!) {
          isAccessTokenAvailable(provider: $provider)
        }
      `,
      { provider: codeAssessmentProvider }
    )
      .toPromise()
      .then((res) => {
        setIsAccessTokenAvailable(res?.isAccessTokenAvailable ?? false);
        setIsLoading(false);
      });
  }, [env]);

  const handleSubmit = () => {
    createAssignment({
      variables: {
        assessmentInput: {
          metadata: {
            ...metadata!,
            chapterId,
            type: "ASSIGNMENT" as ContentType,
          },
          assessmentMetadata: {
            ...assessmentMetadata!,
            skillTypes: assessmentMetadata!.skillTypes as SkillType[],
            initialLearningInterval:
              assessmentMetadata!.initialLearningInterval as number,
          },
          items: []
        },
        assignmentInput: {
          assignmentType: "CODE_ASSIGNMENT",
          requiredPercentage: requiredPercentage! / 100,
        },
      },
      onError: setError,
      updater(store, response) {
        // Get record of chapter and of the new assignment
        const chapterRecord = store.get(chapterId);
        const newRecord = store.get(
          response!.createAssignmentAssessment!.id
        );
        if (!chapterRecord || !newRecord) return;

        // Update the linked records of the chapter contents
        const contentRecords = chapterRecord.getLinkedRecords("contents") ?? [];
        chapterRecord.setLinkedRecords(
          [...contentRecords, newRecord],
          "contents"
        );
      },
      onCompleted() {
        toast.success("Code assignment created successfully.");
        onClose();
      },
    });
  };
  
  return (
    <>
      {!isLoading && !isAccessTokenAvailable && (
        <ProviderAuthorizationDialog
          onClose={onClose}
        />
      )}

      {!isLoading && isAccessTokenAvailable && (
        <>
          <Dialog maxWidth="md" open={true} onClose={onClose}>
            <DialogTitle>Add code assignment</DialogTitle>
            <DialogContent>
            <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
              Make sure the course name corresponds to a GitHub Classroom
            </Typography>
              
              {error?.source?.errors?.map((err: any, i: number) => (
                <Alert key={i} severity="error" onClose={() => setError(null)}>
                  {err.message}
                </Alert>
              ))}
              <Form>
                <ContentMetadataFormSection
                  suggestedTags={[]}
                  onChange={setMetadata}
                />
                <AssessmentMetadataFormSection
                  onChange={setAssessmentMetadata}
                />
                <FormSection title="Scoring">
                  <TextField
                    label="Required percentage"
                    type="number"
                    variant="outlined"
                    className="w-96"
                    value={requiredPercentage !== null ? requiredPercentage : ""}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val)) {
                        setRequiredPercentage(null);
                      } else {
                        setRequiredPercentage(val);
                      }
                    }}
                    helperText={
                      requiredPercentage === null
                        ? null
                        : requiredPercentage < 0 || requiredPercentage > 100
                        ? "Must be between 0 and 100"
                        : ""
                    }
                    error={
                      requiredPercentage !== null &&
                      (requiredPercentage < 0 || requiredPercentage > 100)
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="start">%</InputAdornment>
                      ),                    }}
                    required
                  />
                </FormSection>

              </Form>
            </DialogContent>
            <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          loading={isCreatingAssignment}
          disabled={!valid}
          onClick={handleSubmit}
        >
          Save
        </LoadingButton>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
}
