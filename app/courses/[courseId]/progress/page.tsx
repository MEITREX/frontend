"use client";

import { useState } from "react";
import * as React from "react";
import { RewardScores } from "@/components/RewardScores";
import { RewardScoresHelpButton } from "@/components/RewardScoresHelpButton";
import { Button, IconButton, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LightTooltip } from "@/components/LightTooltip";
import { Info } from "@mui/icons-material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CompetencyProgressbar from "@/components/CompetencyProgressbar";
import { stringToColor } from "@/components/ChapterHeader";
import { useCourseData } from "../../../../components/courses/context/CourseDataContext";
import { useRouter } from "next/navigation";
import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";

export default function LearningProgress() {
  const router = useRouter();

  // Get data from context
  const data = useCourseData() as StudentCourseLayoutCourseIdQuery$data;
  const course = data.coursesByIds[0];
  const id = course.id;

  const [currentPage, setCurrentPage] = useState(0);

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
    sortedSkillCategories.length / categoriesPerPage
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
  );
}