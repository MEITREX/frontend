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
import { useEffect, useState } from "react";
import {
  graphql,
  PreloadedQuery,
  useFragment,
  useMutation,
  useQueryLoader,
} from "react-relay";
import { EditAssignmentModalFragment$key } from "@/__generated__/EditAssignmentModalFragment.graphql";
import { EditAssignmentModalGradingMutation } from "@/__generated__/EditAssignmentModalGradingMutation.graphql";
import { EditAssignmentModalAssessmentMutation } from "@/__generated__/EditAssignmentModalAssessmentMutation.graphql";
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
import { CreateItem } from "../AssessmentDetailsSkillSection";
import { AllSkillQuery } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";

export function EditAssignmentModal({
  onClose,
  onError,
  contentRef,
  allSkillsQueryRef,
}: {
  onClose: () => void;
  onError: (e: any) => void;
  contentRef: EditAssignmentModalFragment$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
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
          requiredPercentage
          codeAssignmentMetadata {
            readmeHtml
            assignmentLink
            invitationLink
          }
        }
        items {
          associatedBloomLevels
          associatedSkills {
            skillName
            skillCategory
            isCustomSkill
          }
        }
      }
    `,
    contentRef
  );

  const [updateAssessment, isUpdatingAssessment] = useMutation(graphql`
    mutation EditAssignmentModalAssessmentMutation(
      $assessment: UpdateAssessmentInput!
      $contentId: UUID!
    ) {
      mutateContent(contentId: $contentId) {
        updateAssessment(input: $assessment) {
          id
        }
      }
    }
  `);

  const [updateAssignment, isUpdatingAssignment] = useMutation(graphql`
    mutation EditAssignmentModalGradingMutation(
      $assessmentId: UUID!
      $input: UpdateAssignmentInput!
    ) {
      updateAssignment(assessmentId: $assessmentId, input: $input) {
        assessmentId
        requiredPercentage
      }
    }
  `);

  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);
  const [requiredPercentage, setRequiredPercentage] = useState<number | null>(
    content.assignment?.requiredPercentage! * 100
  );
  const initialItem: CreateItem = {
    associatedBloomLevels:
      content.items.length > 0
        ? [...content.items[0].associatedBloomLevels]
        : [],
    associatedSkills:
      content.items.length > 0 ? [...content.items[0].associatedSkills] : [],
  };

  const [item, setItem] = useState<CreateItem>(initialItem);

  const valid =
    metadata != null &&
    assessmentMetadata != null &&
    requiredPercentage !== null &&
    requiredPercentage >= 0 &&
    requiredPercentage <= 100;

  const handleSubmit = () => {
    if (!metadata || !assessmentMetadata || requiredPercentage === null) return;

    updateAssessment({
      variables: {
        assessment: {
          metadata: {
            ...metadata,
            chapterId: content.metadata.chapterId,
          },
          assessmentMetadata,
          items: [item],
        },
        contentId: content.id,
      },
      onError,
      onCompleted: () => {
        updateAssignment({
          variables: {
            assessmentId: content.assignment!.assessmentId,
            input: {
              requiredPercentage: requiredPercentage / 100,
            },
          },
          onError,
          onCompleted: onClose,
        });
      },
      updater: (store) => {
        const contentRecord = store.get(content.id);
        if (!contentRecord) return;

        const newItemId = `client:newItem:${crypto.randomUUID()}`;
        const newItemRecord = store.create(newItemId, "Item");

        newItemRecord.setValue(
          item.associatedBloomLevels,
          "associatedBloomLevels"
        );

        const skillRecords = item.associatedSkills.map((skill) => {
          const skillId = `client:newSkill:${crypto.randomUUID()}`;
          const skillRecord = store.create(skillId, "ItemSkill");
          skillRecord.setValue(skill.skillName, "skillName");
          skillRecord.setValue(skill.skillCategory, "skillCategory");
          skillRecord.setValue(skill.isCustomSkill, "isCustomSkill");
          return skillRecord;
        });

        newItemRecord.setLinkedRecords(skillRecords, "associatedSkills");

        contentRecord.setLinkedRecords([newItemRecord], "items");
      },
    });
  };

  return (
    <Dialog maxWidth="md" open onClose={onClose}>
      <DialogTitle>Edit Code Assignment</DialogTitle>
      <DialogContent>
        <Form>
          <ContentMetadataFormSection
            suggestedTags={[]}
            metadata={{
              ...content.metadata,
              name: content.metadata.name,
            }}
            onChange={setMetadata}
            disableName={true}
          />

          <AssessmentMetadataFormSection
            metadata={content.assessmentMetadata}
            onChange={setAssessmentMetadata}
            isRepeatable={false}
            assessmentDetailsSkillSectionProps={{
              operation: "edit",
              item,
              setItem,
              allSkillsQueryRef,
            }}
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
                ),
              }}
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
