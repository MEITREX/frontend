"use client";

import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { useParams, useRouter } from "next/navigation";
import { PageError } from "@/components/PageError";
import { useEffect, useState } from "react";
import { CourseDataProvider } from "@/components/courses/context/CourseDataContext";
import { FormErrors } from "@/components/FormErrors";
import { Box, Button, Typography } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { StudentCourseNavigation } from "@/components/courses/student/StudentCourseNavigation";
import * as React from "react";
import QuestList from "@/app/courses/[courseId]/quests/QuestItem";
import { StudentCourseLayoutCourseIdQuery } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";
import { StudentCourseLayoutLeaveMutation } from "@/__generated__/StudentCourseLayoutLeaveMutation.graphql";
import { StudentCourseLayoutLoginMutation } from "@/__generated__/StudentCourseLayoutLoginMutation.graphql";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";

const studentCourseIdQuery = graphql`
  query StudentCourseLayoutCourseIdQuery($id: UUID!) {
    scoreboard(courseId: $id) {
      user {
        id
        userName
      }
      powerScore
    }
    currentUserInfo {
      id
    }
    coursesByIds(ids: [$id]) {
      ...ChapterOverviewFragment
      suggestions(amount: 4) {
        ...SuggestionFragment
        content {
          id
        }
      }
      id
      title
      description
      dailyQuests {
        forDay
        id
        name
        quests {
          completed
          completedCount
          courseId
          description
          id
          name
          requiredCount
          rewardPoints
          trackingEndTime
          trackingStartTime
          userId
        }
        rewardMultiplier
      }
      rewardScores {
        ...RewardScoresFragment
      }
      chapters {
        elements {
          id
          number
          startDate
          ...StudentChapterFragment
          contents {
            ...ContentLinkFragment
            userProgressData {
              nextLearnDate
              lastLearnDate
            }
            id
            metadata {
              type
            }
          }
        }
      }
      skills {
        skillName
        skillCategory
        skillLevels {
          remember {
            value
          }
          understand {
            value
          }
          apply {
            value
          }
          analyze {
            value
          }
          evaluate {
            value
          }
          create {
            value
          }
        }
      }
    }
  }
`;

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { courseId } = useParams();
  const router = useRouter();
  const [error, setError] = useState<any>(null);

  const data = useLazyLoadQuery<StudentCourseLayoutCourseIdQuery>(
    studentCourseIdQuery,
    { id: courseId }
  );
  const course = data.coursesByIds?.[0];
  const userId = data.currentUserInfo.id;

  const [leave] = useMutation<StudentCourseLayoutLeaveMutation>(graphql`
    mutation StudentCourseLayoutLeaveMutation($courseId: UUID!) {
      leaveCourse(courseId: $courseId) {
        courseId
        role
      }
    }
  `);

  const [studentUserLogin] =
    useMutation<StudentCourseLayoutLoginMutation>(graphql`
      mutation StudentCourseLayoutLoginMutation($id: UUID!) {
        loginUser(courseId: $id)
      }
    `);

  useEffect(() => {
    if (course?.id) {
      studentUserLogin({ variables: { id: course.id } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id]);

  if (!course) {
    return <PageError message="No course found with given id." />;
  }

  return (
    <CourseDataProvider value={data}>
      <main>
        <FormErrors error={error} onClose={() => setError(null)} />

        {/* Course Information */}
        <div className="grid gap-2 pb-6">
          <div className="flex justify-between">
            <Typography variant="h1">{course.title}</Typography>
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              endIcon={<ExitToAppIcon />}
              onClick={() => {
                if (
                  confirm(
                    "Do you really want to leave this course? You might loose the progress you've already made"
                  )
                ) {
                  leave({
                    variables: {
                      courseId: courseId,
                    },
                    onError: setError,

                    updater(store) {
                      const userRecord = store.get(userId)!;
                      const records =
                        userRecord.getLinkedRecords("courseMemberships") || [];

                      userRecord.setLinkedRecords(
                        records.filter(
                          (x) => x.getValue("courseId") !== courseId
                        ),
                        "courseMemberships"
                      );
                    },
                    onCompleted() {
                      router.push("/courses?leftCourse=true");
                    },
                  });
                }
              }}
            >
              Leave course
            </Button>
          </div>
          {course.description && (
            <Typography variant="body2" color="text.secondary">
              {course.description}
            </Typography>
          )}
        </div>

        <GamificationGuard>
          {/* Quest */}
          <Box marginBottom={2} marginTop={2}>
            <QuestList
              questsProp={course.dailyQuests.quests}
              streak={course.dailyQuests.rewardMultiplier}
            />
          </Box>
        </GamificationGuard>

        {/* Navbar */}
        <StudentCourseNavigation courseId={courseId as string} />

        {/* Navbar-Content */}
        <div className="mt-4">{children}</div>
      </main>
    </CourseDataProvider>
  );
}
