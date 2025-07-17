"use client";

import { useState, useEffect, Suspense } from "react";
import {
  fetchQuery,
  graphql,
  PreloadedQuery,
  useLazyLoadQuery,
  useMutation,
  useQueryLoader,
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
import { LoadingButton } from "@mui/lab";
import toast from "react-hot-toast";
import { useAccessTokenCheck } from "./useAccessTokenCheck";
import { AddCodeAssignmentModalExternalAssignmentsQuery } from "@/__generated__/AddCodeAssignmentModalExternalAssignmentsQuery.graphql";
import { AddCodeAssignmentModalSyncAssignmentsMutation } from "@/__generated__/AddCodeAssignmentModalSyncAssignmentsMutation.graphql";
import { CreateItem } from "./form-sections/item/ItemFormSection";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { AllSkillQuery } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";

const GetExternalAssignmentsQuery = graphql`
  query AddCodeAssignmentModalExternalAssignmentsQuery($courseId: UUID!) {
    getExternalCodeAssignments(courseId: $courseId)
  }
`;

export function AddCodeAssignmentModal({
  onClose,
  chapterId,
  courseId,
  allSkillsQueryRef,
}: {
  onClose: () => void;
  chapterId: string;
  courseId: string;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | null | undefined;
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
  const [item, setItem] = useState<CreateItem>({
    associatedBloomLevels: [],
    associatedSkills: [],
  });

  const [requiredPercentage, setRequiredPercentage] = useState<number | null>(
    null
  );
  const [error, setError] = useState<any>(null);

  const env = useRelayEnvironment();
  const [assignmentNames, setAssignments] = useState<string[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    setLoadingAssignments(true);
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
      })
      .finally(() => setLoadingAssignments(false));
  }, [courseId, env]);

  useEffect(() => {
    setIsLoading(true);
    checkAccessToken()
      .then(setIsAccessTokenAvailable)
      .finally(() => setIsLoading(false));
  }, [checkAccessToken]);

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

  const [syncAssignments, isSyncing] =
    useMutation<AddCodeAssignmentModalSyncAssignmentsMutation>(graphql`
      mutation AddCodeAssignmentModalSyncAssignmentsMutation($courseId: UUID!) {
        syncAssignmentsForCourse(courseId: $courseId)
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
          items: [item],
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

  const handleSync = async () => {
    syncAssignments({
      variables: { courseId: courseId },
      onCompleted: (res) => {
        if (!res.syncAssignmentsForCourse) {
          toast.error(`${provider.name} sync failed.`);
          return;
        }
        toast.success(`${provider.name} synced successfully.`);

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
      },
      onError: (err) => {
        console.error(err);
        toast.error("Sync failed.");
      },
    });
  };

  const valid =
    metadata &&
    assessmentMetadata &&
    requiredPercentage !== null &&
    requiredPercentage >= 0 &&
    requiredPercentage <= 100;

  return (
    <>
      {!isLoading && !isAccessTokenAvailable && (
        <ProviderAuthorizationDialog
          onClose={onClose}
          onAuthorize={onClose}
          alertMessage={`You must authorize via ${provider.name} to add a code assignment.`}
          _provider={codeAssessmentProvider}
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
                {loadingAssignments ? (
                  <CircularProgress />
                ) : assignmentNames.length === 0 ? (
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
                    metadata={{
                      name: selectedAssignmentName ?? "",
                      suggestedDate: new Date().toISOString(),
                      rewardPoints: 0,
                      tagNames: [],
                    }}
                    onChange={setMetadata}
                    disableName={true}
                  />

                  <AssessmentMetadataFormSection
                    onChange={setAssessmentMetadata}
                    isRepeatable={false}
                    assessmentDetailsSkillSectionProps={{
                      operation: "create",
                      item,
                      setItem,
                      allSkillsQueryRef,
                    }}
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
            {step === "select" && (
              <LoadingButton onClick={handleSync}>
                Sync assignments
              </LoadingButton>
            )}

            <Button onClick={onClose} disabled={isSyncing}>
              Cancel
            </Button>
            {step === "form" && (
              <LoadingButton
                onClick={handleSubmit}
                disabled={!valid}
                loading={isCreatingAssignment}
              >
                Add
              </LoadingButton>
            )}
            <Backdrop open={isSyncing} sx={{ zIndex: "modal" }}>
              <CircularProgress />
            </Backdrop>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
