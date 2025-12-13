"use client";

import { StudentCourseLayoutCourseIdQuery$data } from "@/__generated__/StudentCourseLayoutCourseIdQuery.graphql";
import { stringToColor } from "@/components/ChapterHeader";
import CompetencyProgressbar from "@/components/CompetencyProgressbar";
import { LightTooltip } from "@/components/LightTooltip";
import { Suggestion } from "@/components/Suggestion";
import { Info } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCourseData } from "../../../../components/courses/context/CourseDataContext";

export default function LearningProgress() {
  const router = useRouter();

  // Get data from context
  const data = useCourseData() as StudentCourseLayoutCourseIdQuery$data;
  const course = data.coursesByIds[0];

  const uniqueSkillCategories = Array.from(
    new Map(course.skills.map((skill) => [skill.skillCategory, skill])).values()
  );

  const [selectedCategory, setSelectedCategory] = useState<number>(0);

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

  return (
        <div className="flex flex-row gap-8">
          <div className="flex flex-col gap-2 w-1/2 max-h-[50vh]">
            <div className="flex items-center gap-4">
              <Typography variant="h2">Knowledge Area</Typography>
              <LightTooltip
                title={
                  <>
                    <p className="text-slate-600 mb-1">Knowledge Area</p>
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
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto">
              {sortedSkillCategories.map((category) => {
                const skillsInCategory = course.skills.filter(
                  (skill) => skill.skillCategory === category.skillCategory
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
                let categoryProgressValue = Math.floor(
                  Math.min(
                    (totalCategoryProgress * 100) / uniqueSkillsInCategory.length,
                    100
                  )
                );
                return (
                  <div key={category.skillCategory}>
                    <div className="flex items-center">
                      <CompetencyProgressbar
                        competencyName={`${
                          category.skillCategory
                        } - ${Math.floor(categoryProgressValue)}%`}
                        height={15}
                        startProgress={0}
                        endProgress={categoryProgressValue}
                        color={stringToColor(category.skillCategory)}
                        onClick={()=> setSelectedCategory(sortedSkillCategories.findIndex((s)=> s.skillCategory === category.skillCategory))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-1/4 max-h-[50vh] mt-8">
            <div className="flex items-center gap-4">
              <Typography variant="h2">Competencies</Typography>
              <LightTooltip
                title={
                  <>
                    <p className="text-slate-600 mb-1">Competency</p>
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
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto">
              {course.skills.filter(
                  (skill) => skill.skillCategory === sortedSkillCategories[selectedCategory].skillCategory
                ).map((skill) =>{
                  const rawValue = Object.values(
                        skill?.skillLevels || {}
                      ).reduce((sum, level) => sum + (level?.value || 0), 0);
                      const clamped = Math.min(rawValue, 1);
                      const skillProgressPercent = Math.floor(clamped * 100);
                  return (
                    <div key={skill.skillName}>
                        <CompetencyProgressbar
                          competencyName={`${
                            skill.skillName
                          } - ${Math.floor(skillProgressPercent)}%`}
                          height={10}
                          startProgress={0}
                          endProgress={skillProgressPercent}
                          color={stringToColor(skill.skillCategory)}
                        />
                    </div>
                  );
                })
              }
            </div>
          </div>

          <div className="flex flex-col gap-2 w-1/4 max-h-[50vh] mt-8">
            <div className="flex items-center gap-4">
              <Typography variant="h2">Task Recommendation</Typography>

              <LightTooltip
                title={
                  <>
                    <p className="text-slate-600 mb-1">Task Recommendation</p>
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
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto">
                {course.suggestions.map((x) => (
                  <Suggestion
                    courseId={course.id}
                    key={x.content.id}
                    _suggestion={x}
                  />
                ))}
            </div>
          </div>

        </div>
  );
}