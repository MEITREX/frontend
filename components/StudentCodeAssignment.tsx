import { StudentCodeAssignment$key } from "@/__generated__/StudentCodeAssignment.graphql";
import { StudentCodeAssignmentQuery } from "@/__generated__/StudentCodeAssignmentQuery.graphql";
import { StudentCodeAssignmentGradingQuery } from "@/__generated__/StudentCodeAssignmentGradingQuery.graphql";
import { ContentTags } from "./ContentTags";
import { FormErrors } from "./FormErrors";
import { Heading } from "./Heading";
import { PageError } from "./PageError";
import { QuizModal } from "./QuizModal";
import { Edit, GitHub } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import toast from "react-hot-toast";
import { StudentCodeAssignmentCurrentUserQuery } from "@/__generated__/StudentCodeAssignmentCurrentUserQuery.graphql";

export default function StudentCodeAssignment({
  contentRef,
}: {
  contentRef: StudentCodeAssignment$key;
}) {
  const { assignmentId } = useParams();
  const [error, setError] = useState<any>(null);

  const { currentUserInfo } =
    useLazyLoadQuery<StudentCodeAssignmentCurrentUserQuery>(
      graphql`
        query StudentCodeAssignmentCurrentUserQuery {
          currentUserInfo {
            id
          }
        }
      `,
      {}
    );

  const content = useFragment(
    graphql`
      fragment StudentCodeAssignment on AssignmentAssessment {
        metadata {
          name
          ...ContentTags
        }
      }
    `,
    contentRef
  );

  const { getGradingsForAssignment } =
    useLazyLoadQuery<StudentCodeAssignmentGradingQuery>(
      graphql`
        query StudentCodeAssignmentGradingQuery($assessmentId: UUID!) {
          getGradingsForAssignment(assessmentId: $assessmentId) {
            date
            achievedCredits
            studentId
            codeAssignmentGradingMetadata {
              repoLink
              status
              feedbackTableHtml
            }
          }
        }
      `,
      { assessmentId: assignmentId }
    );

  const { findAssignmentsByAssessmentIds } =
    useLazyLoadQuery<StudentCodeAssignmentQuery>(
      graphql`
        query StudentCodeAssignmentQuery($assessmentId: UUID!) {
          findAssignmentsByAssessmentIds(assessmentIds: [$assessmentId]) {
            assessmentId
            date
            totalCredits
            requiredPercentage
            codeAssignmentMetadata {
              readmeHtml
              assignmentLink
              invitationLink
            }
          }
        }
      `,
      { assessmentId: assignmentId }
    );

  const assignment = findAssignmentsByAssessmentIds[0];
  if (!assignment) {
    // should never happen
    return <PageError message="No assignment found with given id." />;
  }

  const grading = getGradingsForAssignment.find(
    (g) => g.studentId === currentUserInfo.id
  );
  const repoLink = grading?.codeAssignmentGradingMetadata?.repoLink;

  return (
    <main>
      <FormErrors error={error} onClose={() => setError(null)} />
      <Heading
        title={content.metadata.name}
        action={
          <Box className="flex gap-2 items-center flex-wrap">
            {assignment.date && (
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                disableRipple
                sx={{
                  pointerEvents: "none",
                  "&:hover": {
                    backgroundColor: "transparent",
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                }}
              >
                Deadline: {new Date(assignment.date).toLocaleDateString()}
              </Button>
            )}

            {assignment.codeAssignmentMetadata?.invitationLink && (
              <Button
                sx={{ color: "text.secondary" }}
                startIcon={<GitHub />}
                onClick={() => {
                  if (repoLink) {
                    navigator.clipboard.writeText(repoLink);
                    toast.success("Repo link copied to clipboard!");
                  } else {
                    window.open(
                      assignment.codeAssignmentMetadata!.invitationLink!,
                      "_blank"
                    );
                  }
                }}
              >
                CLONE REPO
              </Button>
            )}
          </Box>
        }
        backButton
      />

      <ContentTags metadata={content.metadata} />

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          README
        </Typography>
        {assignment.codeAssignmentMetadata?.readmeHtml ? (
          <Box
            className="prose prose-sm max-w-none"
            sx={{
              "& h1, & h2, & h3": {
                marginTop: 2,
                marginBottom: 1,
                fontWeight: 600,
                fontSize: "1.1rem",
              },
              "& p": {
                marginBottom: 1.5,
                lineHeight: 1.6,
              },
              "& code": {
                backgroundColor: "#d6d6d6",
                padding: "2px 4px",
                borderRadius: "4px",
                fontSize: "0.875rem",
              },
              "& a": {
                color: "#1976d2",
                textDecoration: "underline",
              },
              "& ul": {
                paddingLeft: "1.25rem",
                listStyleType: "disc",
                marginBottom: "1rem",
              },
              "& ol": {
                paddingLeft: "1.25rem",
                listStyleType: "decimal",
                marginBottom: "1rem",
              },
              "& li": {
                marginBottom: "0.25rem",
              },
            }}
            dangerouslySetInnerHTML={{
              __html: assignment.codeAssignmentMetadata.readmeHtml,
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            No README available.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Automated Tests
        </Typography>
        <Typography>
          <strong>Status:</strong> {/* in_progress to in progress */}
          {grading?.codeAssignmentGradingMetadata?.status?.replace("_", " ") ??
            "N/A"}
        </Typography>
        {grading?.codeAssignmentGradingMetadata?.status == "completed" &&
          grading?.codeAssignmentGradingMetadata?.feedbackTableHtml && (
            <Box
              mt={2}
              sx={{
                overflowX: "auto",
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                padding: 2,
              }}
              dangerouslySetInnerHTML={{
                __html: grading.codeAssignmentGradingMetadata.feedbackTableHtml,
              }}
            />
          )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mt={4} sx={{ "& > *:not(:last-child)": { mb: 2 } }}>
        <Box
          mt={4}
          display="flex"
          gap={6}
          alignItems="flex-start"
          flexWrap="wrap"
        >
          <Typography variant="h6" gutterBottom sx={{ minWidth: 120 }}>
            Grade
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Required
            </Typography>
            <Typography variant="body2">
              {assignment.totalCredits
                ? Math.round(
                    assignment.requiredPercentage! * assignment.totalCredits!
                  )
                : "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Total
            </Typography>
            <Typography variant="body2">
              {assignment.totalCredits ? assignment.totalCredits : "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Achieved
            </Typography>
            <Typography variant="body2">
              {grading?.achievedCredits != null
                ? grading.achievedCredits
                : "N/A"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </main>
  );
}
