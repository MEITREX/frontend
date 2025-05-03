"use client";

import { useState, useEffect } from "react";
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
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
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

import { codeAssessmentProvider, providerConfig } from "./ProviderConfig";
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
import { useAccessTokenCheck } from "./useAccessTokenCheck";
import { AddCodeAssignmentModalExternalAssignmentsQuery } from "@/__generated__/AddCodeAssignmentModalExternalAssignmentsQuery.graphql";

const GetExternalAssignmentsQuery = graphql`
  query AddCodeAssignmentModalExternalAssignmentsQuery($courseId: UUID!) {
    getExternalCodeAssignments(courseId: $courseId)
  }
`;

export function AddCodeAssignmentModal({
  onClose,
  chapterId,
  courseId,
}: {
  onClose: () => void;
  chapterId: string;
  courseId: string;
}) {
  const checkAccessToken = useAccessTokenCheck();
  const provider = providerConfig[codeAssessmentProvider];
  const [isAccessTokenAvailable, setIsAccessTokenAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<"select" | "form">("select");
  const [selectedAssignmentName, setSelectedAssignmentName] = useState<
    string | null
  >(null);
  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);
  const [requiredPercentage, setRequiredPercentage] = useState<number | null>(
    null
  );
  const [error, setError] = useState<any>(null);

  const env = useRelayEnvironment();
  const [assignmentNames, setAssignments] = useState<string[]>([]);

  useEffect(() => {
    if (!courseId) {
      return;
    }
  
    fetchQuery<AddCodeAssignmentModalExternalAssignmentsQuery>(
      env,
      GetExternalAssignmentsQuery,
      { courseId }
    )
      .toPromise()
      .then((data) => {
        if (data?.getExternalCodeAssignments) {
          setAssignments([...data.getExternalCodeAssignments]);
        }
      });
  }, [courseId, env]);
  

  useEffect(() => {
    setIsLoading(true);
    checkAccessToken()
      .then(setIsAccessTokenAvailable)
      .finally(() => setIsLoading(false));
  }, [checkAccessToken]);

  const valid =
    metadata &&
    assessmentMetadata &&
    requiredPercentage &&
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

  const handleSubmit = () => {
    createAssignment({
      variables: {
        assessmentInput: {
          metadata: {
            ...metadata!,
            name: selectedAssignmentName!,
            chapterId,
            type: "ASSIGNMENT" as ContentType,
          },
          assessmentMetadata: {
            ...assessmentMetadata!,
            skillTypes: assessmentMetadata!.skillTypes as SkillType[],
            initialLearningInterval: assessmentMetadata!
              .initialLearningInterval as number,
          },
          items: [],
        },
        assignmentInput: {
          assignmentType: "CODE_ASSIGNMENT",
          requiredPercentage: requiredPercentage! / 100,
        },
      },
      onError: setError,
      updater(store, response) {
        const chapterRecord = store.get(chapterId);
        const newRecord = store.get(response!.createAssignmentAssessment!.id);
        if (chapterRecord && newRecord) {
          const contentRecords =
            chapterRecord.getLinkedRecords("contents") ?? [];
          chapterRecord.setLinkedRecords(
            [...contentRecords, newRecord],
            "contents"
          );
        }
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
          alertMessage={`You must authorize via ${provider.name} to add a code assignment.`}
        />
      )}

      {isAccessTokenAvailable && (
        <Dialog open onClose={onClose} maxWidth="md">
          <DialogTitle>
            {step === "select"
              ? `Select ${provider.name}  Assignment`
              : "Add Code Assignment"}
          </DialogTitle>

          <DialogContent>
            {step === "select" ? (
              <>
                {assignmentNames.length === 0 ? (
                  <Alert severity="info">
                    No assignments found from {provider.name}.
                  </Alert>
                ) : (
                  <List>
                    {assignmentNames.sort().map((name) => (
                      <ListItemButton
                        key={name}
                        onClick={() => {
                          setSelectedAssignmentName(name);
                          setStep("form");
                        }}
                      >
                        <ListItemText primary={name} />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </>
            ) : (
              <>
                {error?.source?.errors?.map((err: any, i: number) => (
                  <Alert
                    key={i}
                    severity="error"
                    onClose={() => setError(null)}
                  >
                    {err.message}
                  </Alert>
                ))}

                <Form>
                  <ContentMetadataFormSection
                    suggestedTags={[]}
                    onChange={setMetadata}
                    disableName={true}
                    createCodeAssignment={{
                      name: selectedAssignmentName ?? "",
                      disableName: true,
                    }}
                  />
                  <AssessmentMetadataFormSection
                    onChange={setAssessmentMetadata}
                  />
                  <FormSection title="Scoring">
                    <TextField
                      label="Required percentage"
                      type="number"
                      value={requiredPercentage ?? ""}
                      onChange={(e) =>
                        setRequiredPercentage(parseInt(e.target.value) || null)
                      }
                      inputProps={{ min: 0, max: 100, step: 1 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">%</InputAdornment>
                        ),
                      }}
                      error={
                        requiredPercentage !== null &&
                        (requiredPercentage < 0 || requiredPercentage > 100)
                      }
                      helperText={
                        requiredPercentage !== null &&
                        (requiredPercentage < 0 || requiredPercentage > 100)
                          ? "Must be between 0 and 100"
                          : ""
                      }
                      fullWidth
                      required
                    />
                  </FormSection>
                </Form>
              </>
            )}
          </DialogContent>

          <DialogActions>
            {step === "form" && (
              <Button onClick={() => setStep("select")}>Back</Button>
            )}
            <Button onClick={onClose}>Cancel</Button>
            {step === "form" && (
              <LoadingButton
                onClick={handleSubmit}
                disabled={!valid}
                loading={isCreatingAssignment}
              >
                Save
              </LoadingButton>
            )}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
