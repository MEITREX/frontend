"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { EditAssignmentModalFragment$key } from "@/__generated__/EditAssignmentModalFragment.graphql";
import { EditAssignmentModalMutation } from "@/__generated__/EditAssignmentModalMutation.graphql";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "@/components/AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "@/components/ContentMetadataFormSection";
import { Form, FormSection } from "@/components/Form";
import { LoadingButton } from "@mui/lab";

export function EditAssignmentModal({
  onClose,
  onError,
  contentRef,
}: {
  onClose: () => void;
  onError: (e: any) => void;
  contentRef: EditAssignmentModalFragment$key;
}) {
  const content = useFragment(
    graphql`
      fragment EditAssignmentModalFragment on AssignmentAssessment {
        id
        metadata {
          name
          chapterId
          suggestedDate
          rewardPoints
          tagNames
        }
        assessmentMetadata {
          skillTypes
          skillPoints
          initialLearningInterval
        }
        assignment {
            assessmentId
            courseId
            assignmentType
            readmeHtml
            classroomLink
            invitationLink
            requiredPercentage
        }
      }
    `,
    contentRef
  );

  const [updateAssignment, isUpdatingAssignment] =
      useMutation<EditAssignmentModalMutation>(graphql`
        mutation EditAssignmentModalMutation(
          $assessment: UpdateAssessmentInput!
          $contentId: UUID!
        ) {
          mutateContent(contentId: $contentId) {
            updateAssessment(input: $assessment) {
              ... EditAssignmentModalFragment
            }
          }
        }
      `);
  

  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);
  const [requiredPercentage, setRequiredPercentage] = useState<number | null>(
    content.assignment?.requiredPercentage! * 100
  );

  const valid =
    metadata != null &&
    assessmentMetadata != null &&
    requiredPercentage !== null &&
    requiredPercentage >= 0 &&
    requiredPercentage <= 100;

    const handleSubmit = () => {
        if (!metadata || !assessmentMetadata) return;
        
        updateAssignment({
          variables: {
            assessment: {
              metadata: {
                ...metadata,
                chapterId: content.metadata.chapterId,
              },
              assessmentMetadata,
            },
            contentId: content.id,
          },
          onError,
          onCompleted: onClose,
        });
      };

  return (
    <Dialog maxWidth="md" open onClose={onClose}>
      <DialogTitle>Edit Code Assignment</DialogTitle>
      <DialogContent>
        <Form>
          <ContentMetadataFormSection
            suggestedTags={[]}
            metadata={content.metadata}
            onChange={setMetadata}
            disableName
          />
          <AssessmentMetadataFormSection
            metadata={content.assessmentMetadata}
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
          loading={isUpdatingAssignment}
          disabled={!valid}
          onClick={handleSubmit}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
