"use client";

import { StudentCourseLayoutCourseIdQuery } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";
import { StudentCourseLayoutLeaveMutation } from "@/__generated__/StudentCourseLayoutLeaveMutation.graphql";
import { StudentCourseLayoutLoginMutation } from "@/__generated__/StudentCourseLayoutLoginMutation.graphql";
import QuestList from "@/app/courses/[courseId]/quests/QuestItem";
import { CourseDataProvider } from "@/components/courses/context/CourseDataContext";
import { StudentCourseNavigation } from "@/components/courses/student/StudentCourseNavigation";
import { FormErrors } from "@/components/FormErrors";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";
import { PageError } from "@/components/PageError";
import { useFetchProactiveFeedback } from "@/src/feedbackUtils";
import { useConfirmation } from "@/src/useConfirmation";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Box, Button, Typography } from "@mui/material";
import { useParams, usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

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
  const confirm = useConfirmation();
  const [refreshKey, setRefreshKey] = useState(0);

  const pathname = usePathname();
  const noContentPaths = ["/quiz", "/media", "/quiz", "/submissions"];
  const hideContent = noContentPaths.some((path) => pathname?.includes(path));

  const data = useLazyLoadQuery<StudentCourseLayoutCourseIdQuery>(
    studentCourseIdQuery,
    { id: courseId },
    { fetchPolicy: "network-only", fetchKey: refreshKey }
  );

  const course = data.coursesByIds?.[0];
  const userId = data.currentUserInfo.id;
  const { sendMessage } = useFetchProactiveFeedback();

  // Regularly polls for proactive feedback every 10 seconds while in a course
  // Stops automatically when the user leaves the course
  // Restarts when the user joins another course
  useEffect(() => {
    if (!course?.id) return;

    const pollInterval = setInterval(() => {
      sendMessage(course.id).catch(() => {});
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [sendMessage, course?.id]);

  // Force a layout remount to refetch data when navigating back.
  // In Next.js, layouts stay mounted between subpages, so their data requests aren't re-run.
  // This simple refresh ensures updated data (e.g. course progress).
  // The clean solution would be to move data fetching into the subpages,
  // so data refetches automatically when those components are mounted.
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const subPages = [
      /^\/courses\/[^\/]+\/forum$/,
      /^\/courses\/[^\/]+\/progress$/,
      /^\/courses\/[^\/]+\/quests$/,
      /^\/courses\/[^\/]+\/leaderboard$/,
      /^\/courses\/[^\/]+\/chapters$/,
      /^\/courses\/[^\/]+$/,
    ];

    const wasSubPage = subPages.some((regex) => regex.test(prevPathname.current));

    if ((!wasSubPage && (pathname.match(/^\/courses\/[^\/]+$/)) || (!wasSubPage && (pathname.match(/^\/courses\/[^\/]+\/chapters$/))))) {
      setRefreshKey((prev) => prev + 1);
    }

    prevPathname.current = pathname;
  }, [pathname]);

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
              onClick={async () => {
                if (
                  await confirm({
                    title: "Confirm Deletion",
                    message:
                      "Do you really want to leave this course? You might loose the progress you've already made",
                  })
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

        {!hideContent && (
          <GamificationGuard>
            {/* Quest */}
            <Box marginBottom={2} marginTop={2}>
              <QuestList
                questsProp={course.dailyQuests.quests}
                streak={course.dailyQuests.rewardMultiplier}
              />
            </Box>
          </GamificationGuard>
        )}

        {/* Navbar */}
        {!hideContent && (
          <StudentCourseNavigation courseId={courseId as string} />
        )}

        {/* Navbar-Content */}
        <div className="mt-4">{children}</div>
      </main>
    </CourseDataProvider>
  );
}
