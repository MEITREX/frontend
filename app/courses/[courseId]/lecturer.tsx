"use client";

import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import { Button, Divider, IconButton, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";

import { AddChapterModal } from "@/components/AddChapterModal";
import { CodeAssessmentProviderCourseButton } from "@/components/CodeAssessmentProviderCourseButton";
import { EditCourseModal } from "@/components/EditCourseModal";
import ForumOverview from "@/components/forum/ForumOverview";
import SkeletonThreadList from "@/components/forum/skeleton/SkeletonThreadList";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import {
  codeAssessmentProvider,
  providerConfig,
} from "@/components/ProviderConfig";
import LecturerSubmissionsList from "@/components/submissions/LecturerSubmissionsList";
import { Add, People, Settings } from "@mui/icons-material";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { orderBy } from "lodash";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import { LecturerChapter } from "./LecturerChapter";

graphql`
  fragment lecturerCourseFragment on Course {
    id
    title
    description
    ...AddChapterModalFragment
    ...EditCourseModalFragment
    chapters {
      elements {
        id
        startDate
        number
        ...LecturerChapter
      }
    }
    skills {
      id
      skillName
      skillCategory
      isCustomSkill
    }
  }
`;

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function LecturerCoursePage() {
  // tabs
  const [value, setValue] = React.useState(0);
  const handleChange = (event: any, newValue: React.SetStateAction<number>) => {
    setValue(newValue);
  };

  const router = useRouter();

  const provider = providerConfig[codeAssessmentProvider];

  // Get course id from url
  const { courseId } = useParams();

  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Fetch course data
  // Parent (deine LecturerCoursePage.tsx) – nur Queryteil relevant
  const { coursesByIds, currentUserInfo, ...query } =
    useLazyLoadQuery<lecturerLecturerCourseIdQuery>(
      graphql`
        query lecturerLecturerCourseIdQuery($courseId: UUID!) {
          ...MediaRecordSelector
          currentUserInfo {
            realmRoles
            courseMemberships {
              role
              course {
                id
              }
            }
          }

          coursesByIds(ids: [$courseId]) {
            ...lecturerCourseFragment @relay(mask: false)

            # ⬇️ Hol' alle Contents über Kapitel (keine [[Content]] mehr!)
            chapters {
              elements {
                id
                contents {
                  __typename
                  ... on SubmissionAssessment {
                    id
                    metadata {
                      name
                      type
                    }
                  }
                }
                contentsWithNoSection {
                  __typename
                  ... on SubmissionAssessment {
                    id
                    metadata {
                      name
                      type
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { courseId }
    );

  const [openModal, setOpenModal] = useState(false);

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
  }

  // Extract course
  const course = coursesByIds[0];

const submissionAssessments =
  course.chapters.elements
    .flatMap(ch => [
      ...(ch.contents ?? []),
      ...(ch.contentsWithNoSection ?? []),
    ])
    .filter((c: any) => c?.__typename === "SubmissionAssessment")
    .map((c: any) => ({
      assessmentId: c.id,
      name: c.metadata?.name ?? "Submission",
    }));
  const role = currentUserInfo.courseMemberships.find(
    (x) => x.course.id === courseId
  )!.role;

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <main>
      {openModal && (
        <AddChapterModal open _course={course} onClose={handleCloseModal} />
      )}

      <Heading
        title={course.title}
        action={
          <div className="flex gap-4 items-center">
            <CodeAssessmentProviderCourseButton courseId={courseId} />
            <Button startIcon={<Add />} onClick={() => setOpenModal(true)}>
              Add chapter
            </Button>
            {role === "ADMINISTRATOR" && (
              <Button
                startIcon={<People />}
                onClick={() => router.push(`/courses/${courseId}/members`)}
              >
                Members
              </Button>
            )}
            <IconButton onClick={() => setInfoDialogOpen(true)}>
              <Settings />
            </IconButton>
          </div>
        }
      />

      <EditCourseModal
        _course={course}
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      />

      <Typography variant="body2" className="!mt-8 !mb-10">
        {course.description}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Tabs for course student page"
        >
          <Tab label="Course Overview" {...a11yProps(0)} />
          <Tab label="Submissions" {...a11yProps(1)} />
          <Tab label="Forum" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <div className="border-2 border-gray-300 rounded-3xl w-full overflow-hidden">
          {orderBy(course.chapters.elements, [
            (x) => new Date(x.startDate).getTime(),
            "number",
          ]).map((chapter, i) => (
            <React.Fragment key={chapter.id}>
              <LecturerChapter
                _mediaRecords={query}
                _chapter={chapter}
                key={chapter.id}
              />
              {i < course.chapters.elements.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <LecturerSubmissionsList
          courseId={course.id}
          submissions={submissionAssessments}
        ></LecturerSubmissionsList>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Suspense fallback={<SkeletonThreadList />}>
          <ForumOverview />
        </Suspense>
      </CustomTabPanel>
    </main>
  );
}
