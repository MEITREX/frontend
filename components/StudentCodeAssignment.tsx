import { StudentCodeAssignment$key } from "@/__generated__/StudentCodeAssignment.graphql";
import { StudentCodeAssignmentQuery } from "@/__generated__/StudentCodeAssignmentQuery.graphql";
import { ContentTags } from "./ContentTags";
import { FormErrors } from "./FormErrors";
import { Heading } from "./Heading";
import { PageError } from "./PageError";
import { QuizModal } from "./QuizModal";
import { Edit, GitHub } from "@mui/icons-material";
import { Box, Button, Divider, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";

export default function StudentCodeAssignment({contentRef}:{contentRef: StudentCodeAssignment$key}) {
  const {assignmentId} = useParams();
  const [error, setError] = useState<any>(null);

  const content = useFragment(
    graphql`
      fragment StudentCodeAssignment on AssignmentAssessment {
        metadata {
        name
          ... ContentTags
        }
      }
    `,
    contentRef
  );

  const {findAssignmentsByAssessmentIds} = useLazyLoadQuery<StudentCodeAssignmentQuery>(
    graphql`
      query StudentCodeAssignmentQuery($assessmentId: UUID!) {
        findAssignmentsByAssessmentIds(assessmentIds: [$assessmentId]) {
          assessmentId
          invitationLink
          date
          totalCredits
          requiredPercentage
          readmeHtml
        }
      }
    `,
    { assessmentId: assignmentId }
  );
  
  const assignment = findAssignmentsByAssessmentIds[0];
  if (!assignment) {
    return <PageError message="No assignment found with given id." />;
  }

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

            {assignment.invitationLink && (
              <Button
                sx={{ color: "text.secondary" }}
                startIcon={<GitHub />}
                href={assignment.invitationLink!}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Classroom
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
      {assignment.readmeHtml ? (
        <Box
          className="prose prose-sm max-w-none"
          sx={{
            // Removed grey box and border
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
              backgroundColor: "#f5f5f5",
              padding: "2px 4px",
              borderRadius: "4px",
              fontSize: "0.875rem",
            },
            "& a": {
              color: "#1976d2",
              textDecoration: "underline",
            },
          }}
          dangerouslySetInnerHTML={{ __html: assignment.readmeHtml }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary" fontStyle="italic">
          No README available.
        </Typography>
      )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box mt={4} sx={{ "& > *:not(:last-child)": { mb: 2 } }}>
        <Box mt={4} display="flex" gap={6} alignItems="flex-start" flexWrap="wrap">
          <Typography variant="h6" gutterBottom sx={{ minWidth: 120 }}>
            Grade
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Required
            </Typography>
            <Typography variant="body2">
              {assignment.totalCredits !== -1
                ? Math.round(assignment.requiredPercentage! * assignment.totalCredits)
                : "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Total
            </Typography>
            <Typography variant="body2">{assignment.totalCredits !== -1
                ? assignment.totalCredits
                : "N/A"}</Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
                Achieved
            </Typography>
            <Typography variant="body2">N/A</Typography>
          </Box>
        </Box>
      </Box>
    </main>
  );
}
