import { lecturerEditSubmissionQuery } from "@/__generated__/lecturerEditSubmissionQuery.graphql";
import { lecturerSubmissionExerciseForLecturerQuery } from "@/__generated__/lecturerSubmissionExerciseForLecturerQuery.graphql";
import { ES2022Error } from "@/components/ErrorContext";
import { PageError } from "@/components/PageError";
import { SubmissionExerciseModal } from "@/components/SubmissionExerciseModal";
import SubmissionsHeader from "@/components/submissions/SubmissionsHeader";
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
query lecturerSubmissionExerciseForLecturerQuery($assessmentId: UUID!){
  submissionExerciseForLecturer(assessmentId: $assessmentId){
    assessmentId
    courseId
    endDate
    files {
      downloadUrl
      id
      name
      uploadUrl
    }
    name
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
          taskId
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
          skillLevels{
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
}`;

export default function LecturerSubmission() {
  const { submissionId, courseId } = useParams();
  const [error, setError] = useState<ES2022Error | null>(null);
  const errorContext = useMemo(() => ({ error, setError }), [error, setError]);

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
      }
    );

  const content = contentsByIds[0];

  console.log(content, "CONTENT");
  console.log(submissionExerciseForLecturer, "SSSSSSSSSUUUUUUUUUUUUUUUUBBBBBBBBBB")

  const extendedContent = {
    ...content,
    endDate: submissionExerciseForLecturer.endDate
  }

  if (!(content.metadata.type === "SUBMISSION")) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content not of type submission."
      />
    );
  }

  return (
    <>
      <SubmissionsHeader
        openEditSubmissionModal={() => setEditSetModalOpen(true)}
        content={content}
      />

      <SubmissionExerciseModal
        onClose={() => setEditSetModalOpen(false)}
        isOpen={isEditSetModalOpen}
        _existingSubmission={extendedContent}
        chapterId={content.metadata.chapterId}
      />
    </>
  );
}
