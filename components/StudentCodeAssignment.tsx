import { StudentCodeAssignment$key } from "@/__generated__/StudentCodeAssignment.graphql";
import { StudentCodeAssignmentCurrentUserQuery } from "@/__generated__/StudentCodeAssignmentCurrentUserQuery.graphql";
import { StudentCodeAssignmentGradingQuery } from "@/__generated__/StudentCodeAssignmentGradingQuery.graphql";
import { StudentCodeAssignmentQuery } from "@/__generated__/StudentCodeAssignmentQuery.graphql";
import { ExpandMore, GitHub } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import { ContentTags } from "./ContentTags";
import { FormErrors } from "./FormErrors";
import { Heading } from "./Heading";
import { PageError } from "./PageError";

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

  // getGradings should be called before findAssignmentsByAssessmentIds because of a bug in GH Api, we need to set Total Credits of an assingment through the grading
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
    return <PageError message="No assignment found with given id." />;
  }

  const grading = getGradingsForAssignment.find(
    (g) => g.studentId === currentUserInfo.id
  );
  const repoLink = grading?.codeAssignmentGradingMetadata?.repoLink;

  const isCompleted =
    grading?.codeAssignmentGradingMetadata?.status === "completed";
  const achieved = grading?.achievedCredits ?? 0;
  const required = assignment.totalCredits
    ? Math.round(assignment.requiredPercentage! * assignment.totalCredits!)
    : null;
  const passed = required != null ? achieved >= required : null;

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
                sx={{
                  color: "#fff",
                  backgroundColor: "#0bb049",
                  fontWeight: 500,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2,
                  "&:hover": {
                    backgroundColor: "#1b5e20",
                  },
                }}
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
                {repoLink ? "COPY LINK" : "START ASSIGNMENT"}
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
        <Box display="flex" alignItems="center" gap={10} mb={1}>
          <Typography variant="h6" gutterBottom>
            Automated Tests
          </Typography>
          <Typography variant="h6" gutterBottom>
            Grade
          </Typography>
        </Box>

        <Box
          display="flex"
          flexWrap="wrap"
          gap={13}
          alignItems="flex-start"
          mb={2}
          mt={1}
        >
          <Box>
            <Typography>
              <strong>Status:</strong>{" "}
              {grading?.codeAssignmentGradingMetadata?.status
                ? grading.codeAssignmentGradingMetadata.status === "queued"
                  ? "in progress"
                  : grading.codeAssignmentGradingMetadata.status.replace(
                      "_",
                      " "
                    )
                : "N/A"}
            </Typography>
          </Box>

          <Box display="flex" gap={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Required
              </Typography>
              <Typography variant="body2" align="center">
                {required ?? "N/A"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Total
              </Typography>
              <Typography variant="body2" align="center">
                {assignment.totalCredits ?? "N/A"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Achieved
              </Typography>
              <Typography variant="body2" align="center">
                {grading?.achievedCredits != null
                  ? grading.achievedCredits
                  : "N/A"}
              </Typography>
            </Box>

            {isCompleted && passed != null && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Result
                </Typography>
                <Typography
                  variant="body2"
                  color={passed ? "success.main" : "error.main"}
                  fontWeight={500}
                  align="center"
                >
                  {passed ? "Passed" : "Not Passed"}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {isCompleted &&
          grading?.codeAssignmentGradingMetadata?.feedbackTableHtml && (
            <Box mt={2}>
              <GroupedTestResults
                html={grading.codeAssignmentGradingMetadata.feedbackTableHtml}
              />
            </Box>
          )}

        {grading?.achievedCredits == null && !isCompleted && (
          <Box mt={2}>
            <Typography
              variant="body2"
              color="error.main"
              fontWeight={500}
              align="left"
            >
              Push your code to GitHub to trigger automated tests.
            </Typography>
          </Box>
        )}
      </Box>
    </main>
  );
}

function GroupedTestResults({ html }: { html: string }) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const rows = Array.from(doc.querySelectorAll("tbody tr"));

  const groups: Record<
    string,
    { name: string; score: string; errorLog?: string }[]
  > = {};

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 2) {
      const fullName = cells[0].textContent?.trim() || "Unknown";
      const score = cells[1].textContent?.trim() || "0";
      const errorLog = cells[2]?.innerHTML?.replace(/<br\s*\/?>/g, "\n");

      const [rawPrefix, ...rest] = fullName.split(" - ");
      const prefix = rawPrefix.trim();
      const testName = rest.join(" - ").trim() || fullName;

      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push({ name: testName, score, errorLog });
    }
  });

  const [expanded, setExpanded] = useState<string | false>(false);
  const [errorExpanded, setErrorExpanded] = useState<
    Record<string, number | null>
  >({});

  return (
    <Box>
      {Object.entries(groups).map(([prefix, tests]) => {
        const totalTests = tests.length;
        const passedTests = tests.filter((t) => {
          const [passed, total] = t.score.split("/").map(Number);
          return passed > 0 || total === 0;
        }).length;

        let achievedSum = 0;
        let maxSum = 0;

        tests.forEach(({ score }) => {
          const [achieved, max] = score.split("/").map(Number);
          if (!isNaN(achieved)) achievedSum += achieved;
          if (!isNaN(max)) maxSum += max;
        });

        return (
          <Accordion
            key={prefix}
            expanded={expanded === prefix}
            onChange={(_, isExp) => setExpanded(isExp ? prefix : false)}
            sx={{
              borderRadius: 1,
              mb: 1,
              boxShadow: "none",
              border: "1px solid #ddd",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                minHeight: 32,
                px: 2,
                py: 0.5,
                "&.MuiAccordionSummary-root": { minHeight: 42 },
                "& .MuiAccordionSummary-content": {
                  my: 0,
                  py: 0,
                  margin: 0,
                  alignItems: "center",
                },
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography fontWeight="bold" sx={{ flexGrow: 1 }}>
                {prefix}
              </Typography>
              <Typography color="text.secondary">
                {passedTests}/{totalTests} passed {achievedSum}/{maxSum} pts.
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 2, py: 0 }}>
              <Table size="small">
                <TableBody>
                  {tests.map(({ name, score, errorLog }, idx) => {
                    const hasError = score.startsWith("0") && errorLog;
                    const isOpen = errorExpanded[prefix] === idx;

                    return (
                      <React.Fragment key={idx}>
                        <TableRow
                          hover={!!hasError}
                          onClick={() => {
                            if (!hasError) return;
                            setErrorExpanded((prev) => ({
                              ...prev,
                              [prefix]: prev[prefix] === idx ? null : idx,
                            }));
                          }}
                          sx={{
                            cursor: hasError ? "pointer" : "default",
                            "&:last-child td": { borderBottom: "none" },
                          }}
                        >
                          <TableCell>{name}</TableCell>
                          <TableCell align="right" sx={{ pr: 8 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 1,
                                whiteSpace: "nowrap",
                                cursor: hasError ? "pointer" : "default",
                              }}
                            >
                              {score}
                              <ExpandMore
                                fontSize="small"
                                sx={{
                                  visibility: hasError ? "visible" : "hidden",
                                  transform: isOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition: "transform 0.2s ease-in-out",
                                  color: hasError ? "#f44336" : "transparent",
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>

                        {hasError && isOpen && (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              sx={{
                                whiteSpace: "pre-wrap",
                                backgroundColor: "#f9f9f9",
                                fontFamily: "monospace",
                                fontSize: "0.85rem",
                                borderBottom: "1px solid #eee",
                              }}
                              dangerouslySetInnerHTML={{
                                __html: errorLog ?? "",
                              }}
                            />
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
