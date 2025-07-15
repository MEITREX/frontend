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
  Menu,
  MenuItem,
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
import { useEffect, useState } from "react";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useQueryLoader,
} from "react-relay";
import { DeleteAssignmentButton } from "./assignment/DeleteAssignmentButton";
import { EditAssignmentModal } from "./assignment/EditAssignmentModal";
import toast from "react-hot-toast";
import { UUID } from "crypto";
import { AllSkillQuery } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";

export default function LecturerCodeAssignment({
  contentRef,
}: {
  contentRef: LecturerCodeAssignment$key;
}) {
  const { courseId, assignmentId } = useParams();
  const router = useRouter();
  const [isEditSetOpen, setEditSetOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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

  const [allSkillsQueryRef, loadAllSkillsQuery] =
    useQueryLoader<lecturerAllSkillsQuery>(AllSkillQuery);

  useEffect(() => {
    if (contentRef && !allSkillsQueryRef) {
      loadAllSkillsQuery({ courseId });
    }
  }, [courseId, loadAllSkillsQuery, allSkillsQueryRef, contentRef]);

  const { getGradingsForAssignment } =
    useLazyLoadQuery<LecturerCodeAssignmentGradingQuery>(
      graphql`
        query LecturerCodeAssignmentGradingQuery($assessmentId: UUID!) {
          getGradingsForAssignment(assessmentId: $assessmentId) {
            studentId
            achievedCredits
            student {
              id
              userName
            }
          }
        }
      `,
      { assessmentId: assignmentId }
    );

  const { findAssignmentsByAssessmentIds } =
    useLazyLoadQuery<LecturerCodeAssignmentQuery>(
      graphql`
        query LecturerCodeAssignmentQuery($assessmentId: UUID!) {
          findAssignmentsByAssessmentIds(assessmentIds: [$assessmentId]) {
            assessmentId
            date
            totalCredits
            requiredPercentage
            codeAssignmentMetadata {
              assignmentLink
              readmeHtml
            }
          }
        }
      `,
      { assessmentId: assignmentId }
    );

  const assignment = findAssignmentsByAssessmentIds[0];

  const studentGrades = getGradingsForAssignment;
  const [localRequiredPercentage, setLocalRequiredPercentage] = useState<number | null>(
    assignment?.requiredPercentage ?? 0
  );

  useEffect(() => {
    if (assignment?.requiredPercentage != null) {
      setLocalRequiredPercentage(assignment.requiredPercentage);
    }
  }, [assignment?.requiredPercentage]);

  if (!assignment) {
    return <PageError message="No assignment found with given id." />;
  }

  const requiredPoints =
    assignment.totalCredits !== null && localRequiredPercentage != null
      ? Math.round(assignment.totalCredits * localRequiredPercentage)
      : null;

  const passedCount =
    requiredPoints != null
      ? studentGrades.filter((g) => (g.achievedCredits ?? -1) >= requiredPoints)
          .length
      : null;

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

            {assignment.codeAssignmentMetadata?.assignmentLink && (
              <>
                <Button
                  sx={{ color: "text.secondary" }}
                  startIcon={<GitHub />}
                  onClick={handleClick}
                >
                  GitHub Classroom
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "github-classroom-button",
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      if (assignment.codeAssignmentMetadata!.assignmentLink) {
                        window.open(
                          assignment.codeAssignmentMetadata!.assignmentLink,
                          "_blank"
                        );
                      }
                      handleClose();
                    }}
                  >
                    Assignment page
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      const baseLink =
                        assignment.codeAssignmentMetadata!.assignmentLink?.replace(
                          /\/assignments\//,
                          "/new_assignments/"
                        );
                      window.open(`${baseLink}/settings`, "_blank");
                      handleClose();
                    }}
                  >
                    Edit assignment
                  </MenuItem>
                </Menu>
              </>
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
          allSkillsQueryRef={allSkillsQueryRef}
          onCompleted={(newPercentage) => {
            setEditSetOpen(false);
            setLocalRequiredPercentage(newPercentage);
          }}
        />
      )}

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
                backgroundColor: "#e0e0e0",
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
            <Typography variant="body2" align="center">
              {assignment.totalCredits !== null &&
              localRequiredPercentage !== null
                ? Math.round(localRequiredPercentage * assignment.totalCredits)
                : "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Total Credits
            </Typography>
            <Typography variant="body2" align="center">
              {assignment.totalCredits !== null
                ? assignment.totalCredits
                : "N/A"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Students Passed
            </Typography>
            <Typography variant="body2" align="center">
              {passedCount != null
                ? `${passedCount}/${studentGrades.length}`
                : "N/A"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box mt={6}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Passed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentGrades.map(({ studentId, achievedCredits, student }) => {
                const passed =
                  requiredPoints != null &&
                  (achievedCredits ?? -1) >= requiredPoints;

                return (
                  <TableRow key={studentId}>
                    <TableCell>{student?.userName ?? "Unknown"}</TableCell>
                    <TableCell>
                      {achievedCredits != null ? achievedCredits : "-"}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={passed ? "success.main" : "error.main"}
                        fontWeight={500}
                      >
                        {passed ? "Passed" : "Not Passed"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </main>
  );
}
