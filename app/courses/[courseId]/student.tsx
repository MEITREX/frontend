"use client";
import { studentCourseIdQuery } from "@/__generated__/studentCourseIdQuery.graphql";
import { Button, Divider, IconButton, Typography } from "@mui/material";
import { orderBy } from "lodash";
import { useParams, useRouter } from "next/navigation";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { studentCourseLeaveMutation } from "@/__generated__/studentCourseLeaveMutation.graphql";
import { FormErrors } from "@/components/FormErrors";
import { LightTooltip } from "@/components/LightTooltip";
import { PageError } from "@/components/PageError";
import { RewardScores } from "@/components/RewardScores";
import { RewardScoresHelpButton } from "@/components/RewardScoresHelpButton";
import { StudentChapter } from "@/components/StudentChapter";
import { Suggestion } from "@/components/Suggestion";
import { Info, Repeat } from "@mui/icons-material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Link from "next/link";
import { useState } from "react";
import CompetencyProgressbar from "@/components/CompetencyProgressbar";
import { stringToColor } from "@/components/ChapterHeader";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { ChapterOverview } from "@/components/ChapterOverview";

import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

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

  // Extract scoreboard
  const rows: Data[] = scoreboard
    .slice(0, 3)
    .map((element) =>
      createData(element.user?.userName ?? "Unknown", element.powerScore)
    );

  const [currentPage, setCurrentPage] = useState(0);

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
  }

  // Extract course
  const course = coursesByIds[0];

  const categoriesPerPage = 3;
  const uniqueSkillCategories = Array.from(
    new Map(course.skills.map((skill) => [skill.skillCategory, skill])).values()
  );

  // Sort the categories by value. Categories with skillValue 0 will be displayed last.
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
                      userRecord.getLinkedRecords("courseMemberships")!;

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

      {/* Tabs for Learning Progress and Chapters */}
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Tabs for course student page"
          >
            <Tab label="Course Overview" {...a11yProps(0)} />
            <Tab label="Learning Progress" {...a11yProps(1)} />
            <Tab label="Chapters" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
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
              <div className="flex flex-col gap-2">
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student Name</TableCell>
                        <TableCell align="right">Power</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow
                          key={row.name}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.name}
                          </TableCell>
                          <TableCell align="right">{row.power}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <div className="flex flex-row gap-8">
                  <Link href={{ pathname: `${id}/scoreboard` }}>
                    <Button variant="text" endIcon={<NavigateNextIcon />}>
                      Full Scoreboard
                    </Button>
                  </Link>
                  <Link href={{ pathname: `${id}/skills` }}>
                    <Button variant="text" endIcon={<NavigateNextIcon />}>
                      Knowledge Status
                    </Button>
                  </Link>
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
                {" "}
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
                <div className="border border-2 border-gray-300 rounded-3xl w-full overflow-hidden">
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
      </Box>
    </main>
  );
}
