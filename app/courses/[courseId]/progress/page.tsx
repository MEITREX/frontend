"use client";

import { pageLearningProgressQuery } from "@/__generated__/pageLearningProgressQuery.graphql";
import { stringToColor } from "@/components/ChapterHeader";
import CompetencyProgressbar from "@/components/CompetencyProgressbar";
import { LightTooltip } from "@/components/LightTooltip";
import { Suggestion } from "@/components/Suggestion";
import { Info } from "@mui/icons-material";
import { Chip, IconButton, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function LearningProgress() {
  const { courseId } = useParams();
  const data = useLazyLoadQuery<pageLearningProgressQuery>(
    graphql`
      query pageLearningProgressQuery($id: UUID!) {
        coursesByIds(ids: [$id]) {
          id
          suggestions(amount: 100) {
            ...SuggestionFragment
            content {
              id
              ... on Assessment {
                items {
                  associatedSkills {
                    skillName
                    skillCategory
                  }
                }
              }
            }
          }
          chapters {
            elements {
              id
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
    { id: courseId }
  );

  const course = data.coursesByIds[0];

  const skillsByCategory = useMemo(() => {
    return course.skills.reduce<
      Record<string, (typeof course.skills)[number][]>
    >((acc, skill) => {
      acc[skill.skillCategory] ??= [];
      acc[skill.skillCategory].push(skill);
      return acc;
    }, {});
  }, [course]);

  const uniqueCategories = Object.keys(skillsByCategory);

  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const sortedCategories = useMemo(() => {
    return [...uniqueCategories].sort((a, b) => {
      const getTotalProgress = (category: typeof a) => {
        const uniqueSkills = Array.from(
          new Map(
            skillsByCategory[category].map((s) => [s.skillName, s])
          ).values()
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
  }, [skillsByCategory, uniqueCategories]);

  const currentUniqueSkills = useMemo(() => {
    return skillsByCategory[sortedCategories[selectedCategory]].reduce(
      (acc, skillA) => {
        if (!acc.some((skillB) => skillA.skillName === skillB.skillName)) {
          acc.push(skillA);
        }
        return acc;
      },
      [] as (typeof skillsByCategory)[string]
    );
  }, [selectedCategory, skillsByCategory, sortedCategories]);

  const filteredSuggestions = useMemo(() => {
    return (course.suggestions ?? []).filter((suggestion) =>
      suggestion.content.items?.some((item) =>
        item.associatedSkills.some(
          (skill) => skill.skillCategory === sortedCategories[selectedCategory]
        )
      )
    );
  }, [course.suggestions, selectedCategory, sortedCategories]);

  //const stored = sessionStorage.getItem("previousProgress");
  //console.log("stored", stored);

  //const previousProgress = stored ? new Map<string, number>(JSON.parse(stored)) : new Map<string, number>();
  //const updatedProgress = new Map<string, number>();

  useEffect(() => {
    //const updatedStore = JSON.stringify(Array.from(updatedProgress.entries()));
    //sessionStorage.setItem("previousProgress", updatedStore);
    //const storedUseEffect = sessionStorage.getItem("previousProgress");
    //console.log("storedUseEffect", storedUseEffect);
  }, []);

  return (
    <div className="grid grid-cols-[4fr_3fr_2fr]">
      <div className="flex flex-col max-h-[50vh] min-w-0">
        <div className="flex items-center gap-2">
          <Typography variant="h2">Knowledge Area</Typography>
          <LightTooltip
            title={
              <>
                <p className="text-slate-600 mb-1">Knowledge Area</p>
                <p>
                  {
                    "A knowledge area is defined as a thematic field of study that groups together related competencies in order to represent the fundamental knowledge of a given subject area."
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
        <div className="flex flex-col gap-2 overflow-y-auto p-2">
          {sortedCategories.map((category) => {
            const skillsInCategory = course.skills.filter(
              (skill) => skill.skillCategory === category
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

            //const startProgress = previousProgress.has(category) ? previousProgress.get(category)! : categoryProgressValue;
            //updatedProgress.set(category, categoryProgressValue);

            return (
              <div key={category}>
                <div className="flex items-center">
                  <CompetencyProgressbar
                    competencyName={category}
                    height={15}
                    startProgress={categoryProgressValue}
                    endProgress={categoryProgressValue}
                    color={stringToColor(category)}
                    onClick={() =>
                      setSelectedCategory(
                        sortedCategories.findIndex((c) => c === category)
                      )
                    }
                    isSelected={category === sortedCategories[selectedCategory]}
                    disabled={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col max-h-[50vh] mt-8 min-w-0">
        <div className="flex items-center gap-2">
          <Typography variant="h2">Competencies</Typography>
          <Chip
            sx={{
              fontSize: "0.75rem",
              height: "1.5rem",
              maxWidth: "250px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              backgroundColor: stringToColor(
                sortedCategories[selectedCategory]
              ),
            }}
            label={sortedCategories[selectedCategory]}
          />
          <LightTooltip
            title={
              <>
                <p className="text-slate-600 mb-1">Competency</p>
                <p>
                  {
                    "Each task has assigned Competencies to represent the content of the task. The following competencies are part of the selected Knowledge Area."
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
        <div className="flex flex-col gap-2 overflow-y-auto p-2">
          {currentUniqueSkills.map((skill) => {
            const rawValue = Object.values(skill?.skillLevels || {}).reduce(
              (sum, level) => sum + (level?.value || 0),
              0
            );
            const clamped = Math.min(rawValue, 1);
            const skillProgressValue = Math.floor(clamped * 100);

            //const startProgress = previousProgress.has(skill.skillName) ? previousProgress.get(skill.skillName)! : skillProgressPercent;
            //updatedProgress.set(skill.skillName, skillProgressPercent);

            return (
              <div key={skill.skillName}>
                <CompetencyProgressbar
                  competencyName={skill.skillName}
                  height={10}
                  startProgress={skillProgressValue}
                  endProgress={skillProgressValue}
                  color={stringToColor(skill.skillCategory)}
                  isSelected={false}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 max-h-[50vh] mt-8 min-w-0">
        <div className="flex items-center gap-2">
          <Typography variant="h2">Task Recommendation</Typography>

          <LightTooltip
            title={
              <>
                <p className="text-slate-600 mb-1">Task Recommendation</p>
                <p>
                  {
                    "Here are some recommended tasks to improve your progress in the selected Knowledge Area."
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
        <div className="flex flex-col gap-2 overflow-y-auto pb-2">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion) => (
              <Suggestion
                courseId={course.id}
                key={suggestion.content.id}
                _suggestion={suggestion}
              />
            ))
          ) : (
            <Typography variant="body2">
              {" "}
              No task recommendations available for this knowledge area.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
}
