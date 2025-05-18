"use client";
import { studentCourseIdQuery } from "@/__generated__/studentCourseIdQuery.graphql";
import { Button, IconButton, Typography } from "@mui/material";
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
  }

  // Extract scoreboard
  const rows: Data[] = scoreboard
    .slice(0, 3)
    .map((element) =>
      createData(element.user?.userName ?? "Unknown", element.powerScore)
    );

  // Extract course
  const course = coursesByIds[0];

  const [expandedBars, setExpandedBars] = useState<Record<string, boolean>>({});

  const toggleProgressbar = (id: string) => {
    setExpandedBars((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [showProgressbars, setShowProgressbars] = useState(true);
  const [showUpNext, setShowUpNext] = useState(true);

  // Colors for Progressbar
  function getColorByIndex(index: number): string {
    const colors = [
      "#EF4444",
      "#F97316",
      "#F59E0B",
      "#EAB308",
      "#84CC16",
      "#22C55E",
      "#10B981",
      "#14B8A6",
      "#06B6D4",
      "#0EA5E9",
      "#3B82F6",
      "#6366F1",
      "#8B5CF6",
      "#A855F7",
      "#D946EF",
      "#EC4899",
      "#F43F5E",
      "#78716C",
      "#64748B",
      "#475569",
      "#334155",
      "#0F172A",
      "#172554",
      "#1E3A8A",
      "#312E81",
    ];

    return colors[index % colors.length];
  }

  const categoriesPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);
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
      <div className="flex gap-4 items-center">
        <Typography variant="h1">{course.title}</Typography>
        {course.description && (
          <LightTooltip
            title={
              <>
                <p className="text-slate-600 mb-1">Beschreibung</p>
                <p>{course.description}</p>
              </>
            }
          >
            <IconButton>
              <Info />
            </IconButton>
          </LightTooltip>
        )}
        <div className="flex-1"></div>

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
      <div className="grid grid-cols-2 items-start">
        <div className="object-cover my-12">
          <div className="pl-8 pr-10 py-6 border-4 border-slate-200 rounded-3xl">
            <RewardScores _scores={course.rewardScores} courseId={course.id} />
          </div>
          <div className="mt-2 mx-4 flex items-center gap-8">
            <RewardScoresHelpButton />
            <Button
              endIcon={<NavigateNextIcon />}
              onClick={() => router.push(`/courses/${id}/statistics`)}
            >
              Full history
            </Button>
          </div>
        </div>
        <div className="mx-5">
          <TableContainer component={Paper} className="mt-12 mb-2">
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
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
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

      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowProgressbars((prev) => !prev)}
            className="w-8 h-8 min-w-0 p-0 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors duration-200"
          >
            <div className="flex items-center justify-center">
              {showProgressbars ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </div>
          </Button>

          <Typography variant="h2">Skill progress</Typography>

          <LightTooltip
            title={
              <>
                <p className="text-slate-600 mb-1">Information Skillprogress</p>
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

          {showProgressbars && totalPages > 1 && (
            <div className="flex gap-2 items-center ml-12">
              <IconButton onClick={handlePrevPage} disabled={currentPage === 0}>
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
      </div>

      <div>
        {showProgressbars && (
          <div className="competency-progressbars grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  (totalCategoryProgress * 100) / uniqueSkillsInCategory.length,
                  100
                )
              );

              const barSections: { color: string; widthPercent: number }[] = [];
              const totalSkills = uniqueSkillsInCategory.length;

              uniqueSkillsInCategory.forEach((skill, index) => {
                const skillProgressValue = Object.values(
                  skill.skillLevels || {}
                ).reduce((sum, level) => sum + (level?.value || 0), 0);
                const clamped = Math.min(skillProgressValue, 1);
                const widthPercent = Math.floor((clamped * 100) / totalSkills);
                if (widthPercent > 0) {
                  barSections.push({
                    color: stringToColor(skill.skillName),
                    widthPercent,
                  });
                }
              });

              return (
                <div
                  key={uniqueSkill.skillCategory}
                  className="mb-4 w-full pl-10"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      onClick={() =>
                        toggleProgressbar(uniqueSkill.skillCategory)
                      }
                      className="w-6 h-6 min-w-0 p-0 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors duration-200"
                    >
                      {expandedBars[uniqueSkill.skillCategory] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <CompetencyProgressbar
                        competencyName={`${
                          uniqueSkill.skillCategory
                        } - ${Math.floor(categoryProgressValue)}%`}
                        heightValue={15}
                        progressValue={categoryProgressValue}
                        color={stringToColor(uniqueSkill.skillCategory)}
                      />
                    </div>
                  </div>
                  {expandedBars[uniqueSkill.skillCategory] && (
                    <div className="ml-4">
                      {uniqueSkillsInCategory.map((skill, index) => {
                        const rawValue = Object.values(
                          skill?.skillLevels || {}
                        ).reduce((sum, level) => sum + (level?.value || 0), 0);
                        const clamped = Math.min(rawValue, 1);
                        const skillProgressPercent = Math.floor(clamped * 100);

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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <section className="mt-8 mb-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowUpNext((prev) => !prev)}
              className="w-8 h-8 min-w-0 p-0 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors duration-200"
            >
              <div className="flex items-center justify-center">
                {showUpNext ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </div>
            </Button>
            <Typography variant="h2">Up next</Typography>
          </div>
          <Button
            startIcon={<Repeat />}
            onClick={() => router.push(`/courses/${id}/flashcards/due`)}
          >
            Repeat learned flashcards
          </Button>
        </div>
        {showUpNext && (
          <div className="mt-4 gap-8 flex flex-wrap pl-8">
            {course.suggestions.map((x) => (
              <Suggestion
                courseId={course.id}
                key={x.content.id}
                _suggestion={x}
              />
            ))}
          </div>
        )}
      </section>

      {orderBy(course.chapters.elements, [
        (x) => new Date(x.startDate).getTime(),
        "number",
      ]).map((chapter) => (
        <StudentChapter key={chapter.id} _chapter={chapter} />
      ))}
    </main>
  );
}
