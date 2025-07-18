"use client";

import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import { Button, Divider, IconButton, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";

import { AddChapterModal } from "@/components/AddChapterModal";
import { CodeAssessmentProviderCourseButton } from "@/components/CodeAssessmentProviderCourseButton";
import { EditCourseModal } from "@/components/EditCourseModal";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import {
  codeAssessmentProvider,
  providerConfig,
} from "@/components/ProviderConfig";
import { Add, People, Settings } from "@mui/icons-material";
import { orderBy } from "lodash";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import { LecturerChapter } from "./LecturerChapter";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { ChapterOverview } from "@/components/ChapterOverview";
import SkeletonThreadList from "@/components/forum/skeleton/SkeletonThreadList";
import ForumOverview from "@/components/forum/ForumOverview";

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
          }

          getExternalCourse(courseId: $courseId) {
            url
            courseTitle
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
            <CodeAssessmentProviderCourseButton
              externalCourse={query.getExternalCourse}
            />
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
          <Tab label="Forum" {...a11yProps(1)} />
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
        <Suspense fallback={<SkeletonThreadList />}>
          <ForumOverview />
        </Suspense>
      </CustomTabPanel>
    </main>
  );
}
