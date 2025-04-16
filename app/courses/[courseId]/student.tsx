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
import { Skill } from "@/components/Skill";
import { SkillLevels } from "@/components/SkillLevels";
import { progress } from "framer-motion";
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

  // Colors for Progressbar
  function getColorByIndex(index: number): string {
    const colors = [
      "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
      "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
      "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
      "#EC4899", "#F43F5E", "#78716C", "#64748B", "#475569",
      "#334155", "#0F172A", "#172554", "#1E3A8A", "#312E81"
    ];
    return colors[index % colors.length];
  }

  return (
    <main>
      <FormErrors error={error} onClose={() => setError(null)} />
      <div className="flex gap-4 items-center">
        <Typography variant="h1">{course.title}</Typography>
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

      <div className="flex items-center gap-4 mb-4">
      <Button
          onClick={() => setShowProgressbars((prev) => !prev)}
          className="w-8 h-8 min-w-0 p-0 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors duration-200"
        >
          <div className="flex items-center justify-center">
            {showProgressbars ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </div>
        </Button>
        <Typography variant="h2">Skill progress</Typography>
      </div>
      <div>  
        {showProgressbars && (
        <div className="competency-progressbars" >
          {/* Remove duplicate Competencies (skillCategories) */}
          {Array.from(new Map(course.skills.map((skill) => [skill.skillCategory, skill])).values()).map((uniqueSkill) => {
            const skillsInCategory = course.skills.filter(skill => skill.skillCategory === uniqueSkill.skillCategory);

            // Remove duplicates in skills, based on skillName
            const uniqueSkillsInCategory = Array.from(
              new Map(skillsInCategory.map(skill => [skill.skillName, skill])).values()
            );

            // Calculate Progress for competency by adding all skillValues of all skills together
            const totalCategoryProgress = uniqueSkillsInCategory.reduce((acc, skill) =>
              acc + Object.values(skill.skillLevels || {}).reduce((sum, level) => sum + (level?.value || 0), 0),
              0
            );
            const categoryProgressValue = Math.min(totalCategoryProgress * 100 / uniqueSkillsInCategory.length, 100);

            // Generate bar sections with individual skill colors and progress values
            const barSections: { color: string; widthPercent: number }[] = [];
            let totalProgress = 0;

            uniqueSkillsInCategory.forEach((skill, index) => {
              const skillProgressValue = Object.values(skill.skillLevels || {}).reduce(
                (sum, level) => sum + (level?.value || 0),
                0
              );
              const clampedProgress = Math.min(skillProgressValue, 1); // TODO: confirm value calc. currently Value is between 0 and 1?
              const percent = clampedProgress * 100;

              if (percent > 0) {
                barSections.push({
                  color: getColorByIndex(index), // Color based on index in the skill array
                  widthPercent: percent,
                });
                totalProgress += percent;
              }
            });

            // Grey for the rest of the progressbar
            if (totalProgress < 100) {
              barSections.push({
                color: "#E5E7EB",
                widthPercent: 100 - totalProgress,
              });
            }

            return (
              <div key={uniqueSkill.skillCategory} className="mb-4">
                <div onClick={() => toggleProgressbar(uniqueSkill.skillCategory)}>
                  <CompetencyProgressbar
                    competencyName={uniqueSkill.skillCategory}
                    heightValue={15}
                    progressValue={categoryProgressValue}
                    barSections={barSections}
                  />
                </div>
                {expandedBars[uniqueSkill.skillCategory] && (
                  <div className="ml-4">
                    {uniqueSkillsInCategory.map((skill, index) => {
                      const skillProgressValue = Object.values(skill?.skillLevels || {}).reduce(
                        (sum, level) => sum + (level?.value || 0),
                        0
                      ) * 100;

                      return (
                        <CompetencyProgressbar
                          key={skill.skillName}
                          competencyName={skill.skillName}
                          heightValue={10}
                          progressValue={Math.min(skillProgressValue, 100)}
                          barSections={[
                            {
                              color: getColorByIndex(index), // Color based on Index of the skill in the array
                              widthPercent: Math.min(skillProgressValue, 100),
                            },
                            {
                              color: "#E5E7EB", // rest of progressbar is grey
                              widthPercent: 100 - Math.min(skillProgressValue, 100),
                            },
                          ]}
                        />
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
          <Typography variant="h2">Up next</Typography>
          <Button
            startIcon={<Repeat />}
            onClick={() => router.push(`/courses/${id}/flashcards/due`)}
          >
            Repeat learned flashcards
          </Button>
        </div>
        <div className="mt-8 gap-8 flex flex-wrap">
          {course.suggestions.map((x) => (
            <Suggestion
              courseId={course.id}
              key={x.content.id}
              _suggestion={x}
            />
          ))}
        </div>
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
