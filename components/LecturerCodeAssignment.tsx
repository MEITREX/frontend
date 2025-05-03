import { LecturerCodeAssignment$key } from "@/__generated__/LecturerCodeAssignment.graphql";
import { LecturerCodeAssignmentQuery } from "@/__generated__/LecturerCodeAssignmentQuery.graphql";
import { ContentTags } from "./ContentTags";
import { FormErrors } from "./FormErrors";
import { Heading } from "./Heading";
import { PageError } from "./PageError";
import { LecturerCodeAssignmentGradingQuery } from "@/__generated__/LecturerCodeAssignmentGradingQuery.graphql";
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
import { ItemData } from "./ItemFormSection";
import { DeleteAssignmentButton } from "./assignment/DeleteAssignmentButton";
import { EditAssignmentModal } from "./assignment/EditAssignmentModal";
import toast from "react-hot-toast";

export default function LecturerCodeAssignment({
  contentRef,
}: {
  contentRef: LecturerCodeAssignment$key;
}) {
  const { courseId, assignmentId } = useParams();
  const router = useRouter();
  const [isEditSetOpen, setEditSetOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const content = useFragment(
    graphql`
      fragment LecturerCodeAssignment on AssignmentAssessment {
        id
        metadata {
          name
          chapterId
          ...ContentTags
        }

        ...EditAssignmentModalFragment
      }
    `,
    contentRef
  );

  const { findAssignmentsByAssessmentIds } =
    useLazyLoadQuery<LecturerCodeAssignmentQuery>(
      graphql`
        query LecturerCodeAssignmentQuery($assessmentId: UUID!) {
          findAssignmentsByAssessmentIds(assessmentIds: [$assessmentId]) {
            assessmentId
            assignmentLink
            date
            totalCredits
            requiredPercentage
            readmeHtml
          }
        }
      `,
      { assessmentId: assignmentId }
    );

  // const { getGradingsForAssignment } =
  //   useLazyLoadQuery<LecturerCodeAssignmentGradingQuery>(
  //     graphql`
  //       query LecturerCodeAssignmentGradingQuery($assessmentId: UUID!) {
  //         getGradingsForAssignment(assessmentId: $assessmentId) {
  //           studentId
  //           achievedCredits
  //           codeAssignmentGradingMetadata {
  //             repoLink
  //             status
  //             feedbackTableHtml
  //           }
  //         }
  //       }
  //     `,
  //     { assessmentId: assignmentId }
  //   );

  const assignment = findAssignmentsByAssessmentIds[0];
  if (!assignment) {
    return <PageError message="No assignment found with given id." />;
  }

  // const studentGrades = getGradingsForAssignment.map((grading) => ({
  //   studentId: grading.studentId,
  //   achievedCredits: grading.achievedCredits,
  // }));

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

            {assignment.assignmentLink && (
              <Button
                sx={{ color: "text.secondary" }}
                startIcon={<GitHub />}
                href={assignment.assignmentLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Classroom
              </Button>
            )}

            <DeleteAssignmentButton
              chapterId={content.metadata.chapterId}
              contentId={content.id}
              onCompleted={() => {
                toast.success("Code assignment deleted succesfully");
                router.push(`/courses/${courseId}`);
              }}
              onError={setError}
            />

            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={() => setEditSetOpen(true)}
            >
              Edit
            </Button>
          </Box>
        }
        backButton
      />

      <ContentTags metadata={content.metadata} />

      {isEditSetOpen && (
        <EditAssignmentModal
          onClose={() => setEditSetOpen(false)}
          onError={setError}
          contentRef={content}
        />
      )}

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
        <Box
          mt={4}
          display="flex"
          gap={6}
          alignItems="flex-start"
          flexWrap="wrap"
        >
          <Typography variant="h6" gutterBottom sx={{ minWidth: 120 }}>
            Grades
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Required Credits
            </Typography>
            <Typography variant="body2">
              {assignment.totalCredits !== -1
                ? Math.round(
                    assignment.requiredPercentage! * assignment.totalCredits!
                  )
                : "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Total Credits
            </Typography>
            <Typography variant="body2">
              {assignment.totalCredits !== -1 ? assignment.totalCredits : "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Students Passed
            </Typography>
            <Typography variant="body2">N/A</Typography>
          </Box>
        </Box>
      </Box>
      <Box mt={6}>
        {/* <Typography variant="h6" gutterBottom>
          Grades
        </Typography> */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* {studentGrades.map(({ studentId, achievedCredits }) => (
                <TableRow key={studentId}>
                  <TableCell>{studentId}</TableCell>
                  <TableCell>
                    {achievedCredits != null
                      ? achievedCredits
                      : "-"}
                  </TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </main>
  );
}
