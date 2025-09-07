"use client";

import { studentCourseIdQuery } from "@/__generated__/studentCourseIdQuery.graphql";
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { orderBy } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

import { studentCourseLeaveMutation } from "@/__generated__/studentCourseLeaveMutation.graphql";
import { studentUserLoginMutation } from "@/__generated__/studentUserLoginMutation.graphql";

import { stringToColor } from "@/components/ChapterHeader";
import { ChapterOverview } from "@/components/ChapterOverview";
import CompetencyProgressbar from "@/components/CompetencyProgressbar";
import { FormErrors } from "@/components/FormErrors";
import { LightTooltip } from "@/components/LightTooltip";
import { PageError } from "@/components/PageError";
import { RewardScores } from "@/components/RewardScores";
import { RewardScoresHelpButton } from "@/components/RewardScoresHelpButton";
import { StudentChapter } from "@/components/StudentChapter";
import { Suggestion } from "@/components/Suggestion";
import WidgetsOverview from "@/components/widgets/WidgetsOverview";

import ForumOverview from "@/components/forum/ForumOverview";
import SkeletonThreadList from "@/components/forum/skeleton/SkeletonThreadList";

import { Info, Repeat } from "@mui/icons-material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import Link from "next/link";
import * as React from "react";
import { Suspense, useEffect, useMemo, useState } from "react";

/**
 * Small inline XP widget: pulls XP/Level from backend via the new `getUser(userID: ID!)` query.
 * - uses NEXT_PUBLIC_GRAPHQL_URL || NEXT_PUBLIC_GRAPHQL_ENDPOINT || "/graphql"
 * - rounds values to integers
 * - shows a level icon like /levels/level_XX.svg
 */
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "/graphql";

type UserLevelInfo = {
  level: number;
  xpValue: number;
  requiredXP: number;
  exceedingXP: number;
};

async function postGraphQL<TData>(
  query: string,
  variables: Record<string, any>
): Promise<{ data?: TData; errors?: any[] }> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });

  try {
    return (await res.json()) as any;
  } catch {
    return { errors: [{ message: "Failed to parse GraphQL response" }] } as any;
  }
}

function XPWidget({ userId }: { userId: string }) {
  const [info, setInfo] = useState<UserLevelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) return;
      setLoading(true);
      const query = `
        query GetUser($userID: ID!) {
          getUser(userID: $userID) {
            id
            name
            email
            xpValue
            requiredXP
            exceedingXP
            level
          }
        }
      `;
      const { data, errors } = await postGraphQL<{
        getUser?: Array<{
          id: string;
          level: number;
          xpValue: number;
          requiredXP: number;
          exceedingXP: number;
        }>;
      }>(query, { userID: userId });

      if (!cancelled) {
        if (data?.getUser && data.getUser.length > 0) {
          const u = data.getUser[0];
          setInfo({
            level: u.level ?? 0,
            xpValue: Math.round(u.xpValue ?? 0),
            requiredXP: Math.round(u.requiredXP ?? 1),
            exceedingXP: Math.round(u.exceedingXP ?? 0),
          });
        } else {
          if (errors && errors.length) {
            // eslint-disable-next-line no-console
            console.warn("[XP Widget] GraphQL errors:", errors);
          }
          setInfo({ level: 0, xpValue: 0, requiredXP: 1, exceedingXP: 0 });
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const levelIcon = useMemo(() => {
    const lvl = Math.max(0, Math.min(99, info?.level ?? 0));
    return `/levels/level_${String(lvl)}.svg`;
  }, [info?.level]);

  const progressPct = useMemo(() => {
    const required = Math.max(1, info?.requiredXP ?? 1);
    const have = Math.max(0, info?.exceedingXP ?? 0);
    return Math.max(0, Math.min(100, Math.round((have / required) * 100)));
  }, [info?.requiredXP, info?.exceedingXP]);

  return (
    <Box
      sx={{
        p: 2,
        border: "4px solid",
        borderColor: "divider",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Typography variant="h2" component="h2">
        Your XP
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <img
          src={levelIcon}
          alt={`Level ${info?.level ?? 0}`}
          width={48}
          height={48}
          style={{ display: "block" }}
        />
        <Typography variant="body2" color="text.secondary">
          {loading
            ? "Loading XP…"
            : `${info?.exceedingXP ?? 0} / ${info?.requiredXP ?? 1} XP (Level ${
                info?.level ?? 0
              })`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progressPct}
        sx={{ height: 10, borderRadius: 999 }}
      />
    </Box>
  );
}

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

interface Data {
  name: string;
  power: number;
}

function createData(name: string, power: number) {
  return { name, power };
}

export default function StudentCoursePage() {
  // Get course id from url
  const { courseId: id } = useParams();

  // tabs
  const [value, setValue] = React.useState(0);
  const handleChange = (event: any, newValue: React.SetStateAction<number>) => {
    setValue(newValue);
  };

  const router = useRouter();
  const [error, setError] = useState<any>(null);

  // Fetch course data
  const {
    coursesByIds,
    scoreboard,
    currentUserInfo: { id: userId },
  } = useLazyLoadQuery<studentCourseIdQuery>(
    graphql`
      query studentCourseIdQuery($id: UUID!) {
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
    `,
    { id }
  );

  const [leave] = useMutation<studentCourseLeaveMutation>(graphql`
    mutation studentCourseLeaveMutation($courseId: UUID!) {
      leaveCourse(courseId: $courseId) {
        courseId
        role
      }
    }
  `);

  const [studentUserLogin] = useMutation<studentUserLoginMutation>(graphql`
    mutation studentUserLoginMutation($id: UUID!) {
      loginUser(courseId: $id)
    }
  `);

  // Extract scoreboard (top 3 preview)
  const rows: Data[] = (scoreboard ?? [])
    .slice(0, 3)
    .map((element) =>
      createData(element.user?.userName ?? "Unknown", element.powerScore)
    );

  const [currentPage, setCurrentPage] = useState(0);

  // Extract course (404 if not found)
  const course = coursesByIds[0];

  useEffect(() => {
    if (course?.id) {
      studentUserLogin({
        variables: { id: course.id },
        onCompleted: () => {},
        onError: (e) => {
          console.error("Login error:", e);
        },
      });
    }
  }, [course?.id, studentUserLogin]);

  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
  }

  const categoriesPerPage = 3;
  const uniqueSkillCategories = Array.from(
    new Map(course.skills.map((skill) => [skill.skillCategory, skill])).values()
  );

  // Sort categories by total progress
  const sortedSkillCategories = [...uniqueSkillCategories].sort((a, b) => {
    const getTotalProgress = (category: typeof a) => {
      const skillsInCategory = course.skills.filter(
        (skill) => skill.skillCategory === category.skillCategory
      );
      const uniqueSkills = Array.from(
        new Map(skillsInCategory.map((s) => [s.skillName, s])).values()
      );
      return uniqueSkills.reduce(
        (acc, skill) =>
          acc +
          Object.values(skill.skillLevels || {}).reduce(
            (sum, level) => sum + (level?.value || 0),
            0
          ),
        0
      );
    };
    return getTotalProgress(b) - getTotalProgress(a);
  });

  const totalPages = Math.ceil(
    uniqueSkillCategories.length / categoriesPerPage
  );

  const currentCategorySlice = sortedSkillCategories.slice(
    currentPage * categoriesPerPage,
    (currentPage + 1) * categoriesPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <main>
      <FormErrors error={error} onClose={() => setError(null)} />

      {/* Header section with course title, description and leave button */}
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
                    courseId: id,
                  },
                  onError: setError,

                  updater(store) {
                    const userRecord = store.get(userId)!;
                    const records =
                      userRecord.getLinkedRecords("courseMemberships") || [];

                    userRecord.setLinkedRecords(
                      records.filter((x) => x.getValue("courseId") !== id),
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

      {/* Quick widgets row */}
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} md={6}>
          {/* Integrated XP widget */}
          <XPWidget userId={userId} />
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Keep space for future widgets (Forum/Questions etc.) */}
          <Box
            sx={{
              p: 2,
              border: "4px solid",
              borderColor: "divider",
              borderRadius: "24px",
              height: "100%",
            }}
          >
            <Typography variant="h2" component="h2" gutterBottom>
              Forum &amp; Questions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check the Forum tab for new posts and open questions.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs for Learning Progress and Chapters */}
      <Box sx={{ width: "100%", mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Tabs for course student page"
          >
            <Tab label="Course Overview" {...a11yProps(0)} />
            <Tab label="Learning Progress" {...a11yProps(1)} />
            <Tab label="Chapters" {...a11yProps(2)} />
            <Tab label="Forum" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <CustomTabPanel value={value} index={0}>
          <WidgetsOverview userId={userId} courseId={course.id} />
          <ChapterOverview _chapters={course} />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <div className="flex flex-col gap-12">
            <div className="grid grid-cols-2 items-start gap-4">
              <div className="object-cover flex flex-col gap-2">
                <div className="p-4 border-4 border-slate-200 rounded-3xl">
                  <RewardScores
                    _scores={course.rewardScores}
                    courseId={course.id}
                  />
                </div>
                <div className="mx-4 flex items-center gap-8">
                  <RewardScoresHelpButton />
                  <Button
                    endIcon={<NavigateNextIcon />}
                    onClick={() => router.push(`/courses/${id}/statistics`)}
                  >
                    Full history
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <Typography variant="h2">Skill progress</Typography>

                <LightTooltip
                  title={
                    <>
                      <p className="text-slate-600 mb-1">
                        Information Skillprogress
                      </p>
                      <p>
                        {
                          "Here you can see your personal progress for this course, splitted up in every skill category that is assigned to this course. Every skill category consists of unique skills. These skills are assigned to the different exercises. If you complete an exercise your skill progress will increase."
                        }
                      </p>
                    </>
                  }
                >
                  <IconButton>
                    <Info />
                  </IconButton>
                </LightTooltip>

                {totalPages > 1 && (
                  <div className="flex gap-2 items-center ml-12">
                    <IconButton
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    <span>
                      {currentPage + 1} / {totalPages}
                    </span>
                    <IconButton
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages - 1}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentCategorySlice.map((uniqueSkill) => {
                  const skillsInCategory = course.skills.filter(
                    (skill) => skill.skillCategory === uniqueSkill.skillCategory
                  );
                  const uniqueSkillsInCategory = Array.from(
                    new Map(
                      skillsInCategory.map((skill) => [skill.skillName, skill])
                    ).values()
                  );

                  const totalCategoryProgress = uniqueSkillsInCategory.reduce(
                    (acc, skill) =>
                      acc +
                      Object.values(skill.skillLevels || {}).reduce(
                        (sum, level) => sum + (level?.value || 0),
                        0
                      ),
                    0
                  );
                  const categoryProgressValue = Math.floor(
                    Math.min(
                      (totalCategoryProgress * 100) /
                        uniqueSkillsInCategory.length,
                      100
                    )
                  );

                  return (
                    <div
                      key={uniqueSkill.skillCategory}
                      className="mb-4 w-full"
                    >
                      <div className="flex items-center gap-2 w-full mb-2">
                        <CompetencyProgressbar
                          competencyName={`${
                            uniqueSkill.skillCategory
                          } - ${Math.floor(categoryProgressValue)}%`}
                          heightValue={15}
                          progressValue={categoryProgressValue}
                          color={stringToColor(uniqueSkill.skillCategory)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        {uniqueSkillsInCategory.map((skill) => {
                          const rawValue = Object.values(
                            skill?.skillLevels || {}
                          ).reduce(
                            (sum, level) => sum + (level?.value || 0),
                            0
                          );
                          const clamped = Math.min(rawValue, 1);
                          const skillProgressPercent = Math.floor(
                            clamped * 100
                          );

                          return (
                            <div key={skill.skillName} className="pl-8 w-full">
                              <CompetencyProgressbar
                                competencyName={
                                  skill.skillName +
                                  " - " +
                                  Math.floor(skillProgressPercent) +
                                  "%"
                                }
                                heightValue={10}
                                progressValue={skillProgressPercent}
                                color={stringToColor(uniqueSkill.skillCategory)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={2}>
          <div className="flex flex-col items-end w-full gap-4">
            <div className="flex flex-col gap-8 w-full">
              <div>
                {/*Up next*/}
                <div className="flex justify-between items-center">
                  <Typography variant="h2">Up next</Typography>
                  <Button
                    startIcon={<Repeat />}
                    onClick={() => router.push(`/courses/${id}/flashcards/due`)}
                  >
                    Repeat learned flashcards
                  </Button>
                </div>
                <div className="mt-4 gap-8 flex flex-wrap">
                  {course.suggestions.map((x) => (
                    <Suggestion
                      courseId={course.id}
                      key={x.content.id}
                      _suggestion={x}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col w-full gap-4">
                <Typography variant="h2">Chapters</Typography>
                <div className="border-2 border-gray-300 rounded-3xl w-full overflow-hidden">
                  {orderBy(course.chapters.elements, [
                    (x) => new Date(x.startDate).getTime(),
                    "number",
                  ]).map((chapter, i) => (
                    <React.Fragment key={chapter.id}>
                      <StudentChapter
                        key={chapter.id}
                        _chapter={chapter}
                        standardExpand={false}
                      />
                      {i < course.chapters.elements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={3}>
          <Suspense fallback={<SkeletonThreadList />}>
            <ForumOverview />
          </Suspense>
        </CustomTabPanel>
      </Box>
    </main>
  );
}
