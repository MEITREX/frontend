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
              metadata {
                chapter {
                  id
                }
              }
            }
          }
          chapters {
            elements {
              id
              suggestedStartDate
              suggestedEndDate
              startDate
              endDate
              skills {
                skillName
                skillCategory
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

  const progressBySkill = useMemo(() => {
    const progressBySkillValues = new Map<string, [number, number]>();
    uniqueCategories.forEach((category) => {
      skillsByCategory[category].forEach((skill) => {
        const currentProgressTuple = progressBySkillValues.get(
          skill.skillName
        ) ?? [0, 0];

        const levels = Object.values(skill.skillLevels || {});
        const sumLevels = levels.reduce(
          (sum, level) => sum + (level?.value || 0),
          0
        );
        const notZeroValues = levels.filter(
          (level) => level?.value !== 0
        ).length;

        const contribution = notZeroValues > 0 ? sumLevels / notZeroValues : 0;
        const newSum = currentProgressTuple[0] + contribution;
        const newCount = currentProgressTuple[1] + 1;

        progressBySkillValues.set(skill.skillName, [newSum, newCount]);
      });
    });
    return progressBySkillValues;
  }, [skillsByCategory, uniqueCategories]);

  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const sortedCategories = useMemo(() => {
    if (uniqueCategories.length === 0) return [];
    return [...uniqueCategories].sort((a, b) => {
      const getTotalProgress = (category: typeof a) => {
        const uniqueSkillsInCategory = Array.from(
          new Map(
            skillsByCategory[category].map((skill) => [skill.skillName, skill])
          ).values()
        );
        const progressSum = uniqueSkillsInCategory.reduce((sum, skill) => {
          const tuple = progressBySkill.get(skill.skillName);
          if (!tuple || tuple[1] === 0) return sum;
          const avg = tuple[0] / tuple[1];
          return sum + avg;
        }, 0);
        return (progressSum / uniqueSkillsInCategory.length) * 100;
      };
      return getTotalProgress(b) - getTotalProgress(a);
    });
  }, [progressBySkill, skillsByCategory, uniqueCategories]);

  const currentUniqueSkills = useMemo(() => {
    if (sortedCategories.length === 0) return [];
    return skillsByCategory[sortedCategories[selectedCategory]]
      .reduce((acc, skillA) => {
        if (!acc.some((skillB) => skillA.skillName === skillB.skillName)) {
          acc.push(skillA);
        }
        return acc;
      }, [] as (typeof skillsByCategory)[string])
      .sort((skillA, skillB) => {
        const progressA = progressBySkill.get(skillA.skillName)?.[0] ?? 0;
        const progressB = progressBySkill.get(skillB.skillName)?.[0] ?? 0;
        return progressB - progressA;
      });
  }, [progressBySkill, selectedCategory, skillsByCategory, sortedCategories]);

  const urgentChapters = useMemo(() => {
    return course.chapters.elements.filter((chapter) => {
      const suggestedEndDate = Date.parse(
        chapter.suggestedEndDate ?? chapter.endDate
      );
      return suggestedEndDate.valueOf() < Date.now();
    });
  }, [course.chapters.elements]);

  const lockedChapters = useMemo(() => {
    return course.chapters.elements.filter((chapter) => {
      const startDate = Date.parse(chapter.startDate);
      return startDate.valueOf() > Date.now();
    });
  }, [course.chapters.elements]);

  const filteredSuggestionsByCategory = (category: string) => {
    return (course.suggestions ?? []).filter((suggestion) =>
      suggestion.content.items?.some((item) =>
        item.associatedSkills.some((skill) => skill.skillCategory === category)
      )
    );
  };

  const filteredSuggestionsBySkill = (skillName: string) => {
    return (course.suggestions ?? []).filter((suggestion) =>
      suggestion.content.items?.some((item) =>
        item.associatedSkills.some((skill) => skill.skillName === skillName)
      )
    );
  };

  const [previousProgress] = useState<Map<string, number>>(() => {
    if (typeof window === "undefined") return new Map();

    const stored = sessionStorage.getItem("previousProgress");
    return stored
      ? new Map<string, number>(JSON.parse(stored))
      : new Map();
  });

  useEffect(() => {
    if (uniqueCategories.length === 0) return;

    const tempMap = new Map<string,number>();

    progressBySkill.forEach((progressValue, skill) => {
      if(!progressValue) return;
      const tempProgress = progressValue[0] / progressValue[1] * 100;
      tempMap.set(skill, tempProgress);
    })

    sessionStorage.setItem("previousProgress", JSON.stringify([...tempMap]));
  }, [progressBySkill, uniqueCategories.length]);

  if (uniqueCategories.length === 0) {
    return (
      <Typography variant="body1">
        {" "}
        No Skills in this course to display progress.
      </Typography>
    );
  }

  return (
    <div className="grid grid-cols-[4fr_3fr_2fr] gap-4">
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
        <div className="flex flex-col gap-2 overflow-y-auto thin-scrollbar p-2">
          {sortedCategories.map((category) => {
            const uniqueSkillsInCategory = Array.from(
              new Map(
                skillsByCategory[category].map((skill) => [
                  skill.skillName,
                  skill,
                ])
              ).values()
            );

            const chaptersWithThisCategory = course.chapters.elements.filter(
              (chapter) => {
                return chapter.skills?.some(
                  (skill) => skill?.skillCategory === category
                );
              }
            );

            const disabled = chaptersWithThisCategory.every((chapter) =>
              lockedChapters.includes(chapter)
            );

            const urgent = filteredSuggestionsByCategory(category).some(
              (suggestion) =>
                urgentChapters.some(
                  (chapter) =>
                    chapter.id === suggestion.content.metadata.chapter.id
                )
            );

            const progressSum = uniqueSkillsInCategory.reduce((sum, skill) => {
              const tuple = progressBySkill.get(skill.skillName);
              if (!tuple || tuple[1] === 0) return sum;
              const avg = tuple[0] / tuple[1];
              return sum + avg;
            }, 0);

            const categoryProgressValue =
              (progressSum / uniqueSkillsInCategory.length) * 100;

            const tempSumPreviousProgress = uniqueSkillsInCategory.reduce((sum, skill) =>
              sum + (previousProgress.get(skill.skillName) ?? 0),
              0
            );

            const previousCategoryProgressValue = previousProgress.size === 0 ? categoryProgressValue : tempSumPreviousProgress / uniqueSkillsInCategory.length;

            return (
              <div key={category}>
                <div className="flex items-center">
                  <CompetencyProgressbar
                    competencyName={category}
                    height={15}
                    startProgress={Math.floor(previousCategoryProgressValue)}
                    endProgress={Math.floor(categoryProgressValue)}
                    color={stringToColor(category)}
                    onClick={() =>
                      setSelectedCategory(
                        sortedCategories.findIndex((c) => c === category)
                      )
                    }
                    isDisabled={disabled}
                    isSelected={category === sortedCategories[selectedCategory]}
                    isUrgent={urgent}
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
        <div className="flex flex-col gap-2 overflow-y-auto thin-scrollbar p-2">
          {currentUniqueSkills.map((currentSkill) => {
            const chaptersWithThisSkill = course.chapters.elements.filter(
              (chapter) => {
                return chapter.skills?.some(
                  (skill) => skill?.skillName === currentSkill.skillName
                );
              }
            );

            const disabled = chaptersWithThisSkill.every((chapter) =>
              lockedChapters.includes(chapter)
            );

            const urgent = filteredSuggestionsBySkill(
              currentSkill.skillName
            ).some((suggestion) =>
              urgentChapters.some(
                (chapter) =>
                  chapter.id === suggestion.content.metadata.chapter.id
              )
            );

            const tuple = progressBySkill.get(currentSkill.skillName) ?? [0, 1];
            const skillProgressValue = (tuple[0] / tuple[1]) * 100;

            const previousSkillProgressValue = previousProgress.get(currentSkill.skillName) ?? skillProgressValue;

            return (
              <div key={currentSkill.skillName}>
                <CompetencyProgressbar
                  competencyName={currentSkill.skillName}
                  height={10}
                  startProgress={Math.floor(previousSkillProgressValue)}
                  endProgress={Math.floor(skillProgressValue)}
                  color={stringToColor(currentSkill.skillCategory)}
                  isDisabled={disabled}
                  isUrgent={urgent}
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
        <div className="flex flex-col gap-2 overflow-y-auto thin-scrollbar pb-2">
          {filteredSuggestionsByCategory(sortedCategories[selectedCategory])
            .length > 0 ? (
            filteredSuggestionsByCategory(
              sortedCategories[selectedCategory]
            ).map((suggestion) => (
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
