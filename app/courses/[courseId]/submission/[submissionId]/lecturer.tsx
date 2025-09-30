"use client";

import { lecturerEditSubmissionQuery } from "@/__generated__/lecturerEditSubmissionQuery.graphql";
import { lecturerSubmissionExerciseForLecturerQuery } from "@/__generated__/lecturerSubmissionExerciseForLecturerQuery.graphql";
import { ES2022Error } from "@/components/ErrorContext";
import { PageError } from "@/components/PageError";
import { SubmissionExerciseModal } from "@/components/SubmissionExerciseModal";
import AddTaskDialog from "@/components/submissions/AddTaskDialog";
import SubmissionsHeader from "@/components/submissions/SubmissionsHeader";
import { Button, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

const RootQuery = graphql`
  query lecturerEditSubmissionQuery($id: UUID!, $courseId: UUID!) {
    ...MediaRecordSelector

    contentsByIds(ids: [$id]) {
      id
      metadata {
        name
        chapterId
        type
        suggestedDate
        rewardPoints
        tagNames
      }
      ... on SubmissionAssessment {
        items {
          id
        }
        assessmentMetadata {
          skillPoints
          skillTypes
          initialLearningInterval
        }
      }
    }
  }
`;

const GetSubmission = graphql`
  query lecturerSubmissionExerciseForLecturerQuery($assessmentId: UUID!) {
    submissionExerciseForLecturer(assessmentId: $assessmentId) {
      assessmentId
      courseId
      endDate
      files {
        downloadUrl
        id
        name
        uploadUrl
      }
      solutions {
        files {
          downloadUrl
          id
          name
          uploadUrl
        }
        id
        result {
          id
          results {
            number
            score
            itemId
          }
          status
        }
        submissionDate
        userId
      }
      tasks {
        item {
          associatedBloomLevels
          associatedSkills {
            id
            isCustomSkill
            skillCategory
            skillLevels {
              analyze {
                value
              }
              apply {
                value
              }
              create {
                value
              }
              evaluate {
                value
              }
              remember {
                value
              }
              understand {
                value
              }
            }
            skillName
          }
          id
        }
        itemId
        maxScore
        name
      }
    }
  }
`;

export default function LecturerSubmission() {
  const { submissionId, courseId } = useParams();
  const [error, setError] = useState<ES2022Error | null>(null);
  const errorContext = useMemo(() => ({ error, setError }), [error, setError]);
  const [fetchKey, setFetchKey] = useState(0); // neu

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [isEditSetModalOpen, setEditSetModalOpen] = useState(false);

  const { contentsByIds, ...mediaSelectorQuery } =
    useLazyLoadQuery<lecturerEditSubmissionQuery>(RootQuery, {
      id: submissionId,
      courseId,
    });

  const { submissionExerciseForLecturer } =
    useLazyLoadQuery<lecturerSubmissionExerciseForLecturerQuery>(
      GetSubmission,
      {
        assessmentId: submissionId,
      },
      {
        fetchKey,
        fetchPolicy: "network-only",
      }
    );

  const content = contentsByIds[0];

  console.log(content, "CONTENT");
  console.log(
    submissionExerciseForLecturer,
    "SSSSSSSSSUUUUUUUUUUUUUUUUBBBBBBBBBB"
  );

  const extendedContent = {
    ...content,
    endDate: submissionExerciseForLecturer.endDate,
  };

  if (!(content.metadata.type === "SUBMISSION")) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content not of type submission."
      />
    );
  }
  console.log(isAddOpen);

  return (
    <>
      <SubmissionsHeader
        openEditSubmissionModal={() => setEditSetModalOpen(true)}
        content={extendedContent}
      />

      {submissionExerciseForLecturer?.tasks?.length ? (
        submissionExerciseForLecturer.tasks.map((taskItem) => (
          <div key={taskItem.itemId} className="mb-3">
            <Typography variant="h6">{taskItem.name}</Typography>
            <Typography variant="body2">
              Max Score: {taskItem.maxScore}
            </Typography>
            <Typography variant="body2">Item ID: {taskItem.itemId}</Typography>

            {/* Beispiel: ein paar Details aus item */}
            {taskItem.item?.associatedSkills?.length ? (
              <ul style={{ marginTop: 8 }}>
                {taskItem.item.associatedSkills.map((s) => (
                  <li key={s.id}>
                    <Typography variant="caption">
                      {s.skillName} ({s.skillCategory})
                    </Typography>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          Keine Tasks gefunden.
        </Typography>
      )}

      <Button variant="outlined" onClick={() => setIsAddOpen(true)}>
        Task hinzufügen
      </Button>

      <SubmissionExerciseModal
        onClose={() => setEditSetModalOpen(false)}
        isOpen={isEditSetModalOpen}
        _existingSubmission={extendedContent}
        chapterId={content.metadata.chapterId}
      />

      {isAddOpen ? (
        <AddTaskDialog
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          submissionId={submissionId}
          setIsAddOpen={setIsAddOpen}
          onAdded={() => setFetchKey((k) => k + 1)}
        />
      ) : null}
    </>
  );
}
