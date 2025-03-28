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
} from "@mui/material";

import { codeAssessmentProvider } from "./ProviderConfig";
import { CodeAssignmentModalAccessTokenQuery } from "@/__generated__/CodeAssignmentModalAccessTokenQuery.graphql";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "./AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "./ContentMetadataFormSection";
import { Form } from "./Form";
import { ProviderAuthorizationDialog } from "./ProviderAuthorizationDialog";
// import {
//   CodeAssignmentModalMutation,
//   ContentType,
//   SkillType,
// } from "@/__generated__/CodeAssignmentModalMutation.graphql";

export function CodeAssignmentModal({
  onClose,
  chapterId,
  isOpen,
}: {
  onClose: () => void;
  isOpen: boolean;
  chapterId: string;
}) {
  const env = useRelayEnvironment();
  const [isAccessTokenAvailable, setIsAccessTokenAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);
  const [error, setError] = useState<any>(null);

  const valid = metadata != null && assessmentMetadata != null;

  // const [createAssignment, isCreatingAssignment] =
  //   useMutation<CodeAssignmentModalMutation>(graphql`
  //     mutation CodeAssignmentModalMutation($assessmentInput: CreateAssessmentInput!) {
  //       createCodeAssessment(assessmentInput: $assessmentInput) {
  //         __typename
  //         __id
  //         id
  //       }
  //     }
  //   `);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    fetchQuery<CodeAssignmentModalAccessTokenQuery>(
      env,
      graphql`
        query CodeAssignmentModalAccessTokenQuery($provider: ExternalServiceProviderDto!) {
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
  }, [isOpen, env]);

  const handleSubmit = () => {
    // createAssignment({
    //   variables: {
    //     assessmentInput: {
    //       metadata: {
    //         ...metadata!,
    //         chapterId,
    //         type: "CODE" as ContentType,
    //       },
    //       assessmentMetadata: {
    //         ...assessmentMetadata!,
    //         skillTypes: assessmentMetadata!.skillTypes as SkillType[],
    //         initialLearningInterval:
    //           assessmentMetadata!.initialLearningInterval as number,
    //       },
    //     },
    //   },
    //   onCompleted() {
    //     onClose();
    //   },
    //   onError(err) {
    //     setError(err);
    //   },
    // });
  };

  return (
    <>
      {!isLoading && !isAccessTokenAvailable && (
        <ProviderAuthorizationDialog
          open={isOpen}
          onClose={onClose}
        />
      )}

      {!isLoading && isAccessTokenAvailable && (
        <>
          <Dialog maxWidth="md" open={isOpen} onClose={onClose}>
            <DialogTitle>Add code assignment</DialogTitle>
            <DialogContent>
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
              </Form>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancel</Button>
              <Button disabled={!valid} onClick={handleSubmit}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
          <Backdrop open={false} sx={{ zIndex: "modal" }}>
            <CircularProgress />
          </Backdrop>
        </>
      )}
    </>
  );
}
