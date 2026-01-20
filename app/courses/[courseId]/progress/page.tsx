"use client";

import { pageLearningProgressQuery } from "@/__generated__/pageLearningProgressQuery.graphql";
import { stringToColor } from "@/components/ChapterHeader";
import CompetencyProgressbar from "@/components/CompetencyProgressbar";
import { LightTooltip } from "@/components/LightTooltip";
import { Suggestion } from "@/components/Suggestion";
import { Info } from "@mui/icons-material";
import {
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Slide,
  Typography,
  useTheme,
} from "@mui/material";
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
          numberOfCourseMemberships
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
            skillValue {
              skillValue
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
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);

  const [showAverageProgress, setAverageProgress] = useState<boolean>(false);

  type skillItem = {
    skillValue: number;
    //skillAverageValue: number;
    //maxParticipantCount: number;
  };

  const getCategorySkillKey = (category: string, skillName: string) => {
    return `${category}_${skillName}`;
  };

  const progressBySkill = useMemo(() => {
    const progressBySkillValues = new Map<
      string,
      {
        progressSum: number;
        //averageProgressSum: number;
        count: number;
        //maxParticipantCount: number;
      }
    >();

    uniqueCategories.forEach((category) => {
      skillsByCategory[category].forEach((skill) => {
        const key = getCategorySkillKey(category, skill.skillName);

        if (!progressBySkillValues.has(key)) {
          progressBySkillValues.set(key, {
            progressSum: 0,
            //averageProgressSum: 0,
            count: 0,
            //maxParticipantCount: 0,
          });
        }

        const progressItem = progressBySkillValues.get(key)!;

        progressItem.progressSum += skill.skillValue.skillValue;
        /*progressItem.averageProgressSum +=
          skill.skillAllUsersStats.skillValueSum;*/
        progressItem.count++;
        /*progressItem.maxParticipantCount = Math.max(
          progressItem.maxParticipantCount,
          skill.skillAllUsersStats.participantCount
        );*/
      });
    });

    const result = new Map<string, skillItem>();
    progressBySkillValues.forEach(
      (
        {
          progressSum: sum,
          //averageProgressSum: averageSum,
          count,
          //maxParticipantCount,
        },
        key
      ) => {
        result.set(key, {
          skillValue: sum / count,
          /*skillAverageValue:
            averageSum / count / course.numberOfCourseMemberships,
          maxParticipantCount,*/
        });
      }
    );

    return result;
  }, [skillsByCategory, uniqueCategories]);

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
          const progress =
            progressBySkill.get(getCategorySkillKey(category, skill.skillName))
              ?.skillValue ?? 0;
          return sum + progress;
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
        const progressA =
          progressBySkill.get(
            getCategorySkillKey(
              sortedCategories[selectedCategory],
              skillA.skillName
            )
          )?.skillValue ?? 0;
        const progressB =
          progressBySkill.get(
            getCategorySkillKey(
              sortedCategories[selectedCategory],
              skillB.skillName
            )
          )?.skillValue ?? 0;
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
    return stored ? new Map<string, number>(JSON.parse(stored)) : new Map();
  });

  useEffect(() => {
    if (uniqueCategories.length === 0) return;

    const tempMap = new Map<string, number>();

    course.skills.forEach((skill) => {
      const key = getCategorySkillKey(skill.skillCategory, skill.skillName);
      tempMap.set(key, (progressBySkill.get(key)?.skillValue ?? 0) * 100);
    });

    sessionStorage.setItem("previousProgress", JSON.stringify([...tempMap]));
  }, [course.skills, progressBySkill, uniqueCategories.length]);

  const theme = useTheme();

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
        <div className="flex items-center gap-3">
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
          <div className="ml-8">
            <FormControlLabel
              className="text-slate-500"
              control={
                <Checkbox
                  size="small"
                  color="default"
                  checked={showAverageProgress}
                  onChange={() => setAverageProgress(!showAverageProgress)}
                />
              }
              label="show average Progress"
            />
          </div>
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
              const progress =
                (progressBySkill.get(
                  getCategorySkillKey(category, skill.skillName)
                )?.skillValue ?? 0) * 100;
              return sum + progress;
            }, 0);

            /*const averageProgressSum = uniqueSkillsInCategory.reduce(
              (sum, skill) => {
                const averageProgress =
                  (progressBySkill.get(
                    getCategorySkillKey(category, skill.skillName)
                  )?.skillAverageValue ?? 0) * 100;
                return sum + averageProgress;
              },
              0
            );*/

            /*const maxParticipantCountForaSkill = Math.max(
              ...uniqueSkillsInCategory.map(
                (skill) =>
                  progressBySkill.get(
                    getCategorySkillKey(category, skill.skillName)
                  )?.maxParticipantCount ?? 0
              )
            );*/

            const categoryProgressValue =
              progressSum / uniqueSkillsInCategory.length;

            /*const categoryAverageProgressValue =
              averageProgressSum / uniqueSkillsInCategory.length;*/

            const tempSumPreviousProgress = uniqueSkillsInCategory.reduce(
              (sum, skill) =>
                sum +
                (previousProgress.get(
                  getCategorySkillKey(category, skill.skillName)
                ) ?? 0),
              0
            );

            const previousCategoryProgressValue =
              previousProgress.size === 0
                ? categoryProgressValue
                : tempSumPreviousProgress / uniqueSkillsInCategory.length;

            return (
              <div key={category}>
                <div className="flex items-center">
                  <CompetencyProgressbar
                    competencyName={category}
                    startProgress={Math.floor(previousCategoryProgressValue)}
                    endProgress={Math.floor(categoryProgressValue)}
                    averageProgress={/*Math.floor(categoryAverageProgressValue)*/0}
                    color={stringToColor(category)}
                    onClick={() => {
                      setSelectedCategory(
                        sortedCategories.findIndex((c) => c === category)
                      );
                      setSelectedSkill(null);
                    }}
                    isDisabled={disabled}
                    isSelected={category === sortedCategories[selectedCategory]}
                    isUrgent={urgent}
                    showAverageProgress={showAverageProgress}
                    participantCount={/*maxParticipantCountForaSkill*/0}
                    courseMemberCount={course.numberOfCourseMemberships}
                    openTaskCount={
                      filteredSuggestionsByCategory(category).length
                    }
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

            const key = getCategorySkillKey(
              currentSkill.skillCategory,
              currentSkill.skillName
            );

            const skillProgressValue =
              (progressBySkill.get(key)?.skillValue ?? 0) * 100;

            /*const skillAverageProgressValue =
              (progressBySkill.get(key)?.skillAverageValue ?? 0) * 100;

            const maxParticipantCount =
              progressBySkill.get(key)?.maxParticipantCount ?? 0;*/

            const previousSkillProgressValue =
              previousProgress.get(key) ?? skillProgressValue;

            return (
              <Slide
                key={currentSkill.skillName}
                in
                direction="right"
                timeout={500}
              >
                <div>
                  <CompetencyProgressbar
                    competencyName={currentSkill.skillName}
                    small={true}
                    startProgress={Math.floor(previousSkillProgressValue)}
                    endProgress={Math.floor(skillProgressValue)}
                    averageProgress={/*Math.floor(skillAverageProgressValue)*/0}
                    color={stringToColor(currentSkill.skillCategory)}
                    onClick={() => {
                      const currentIndex = currentUniqueSkills.findIndex(
                        (skill) => skill === currentSkill
                      );
                      currentIndex === selectedSkill
                        ? setSelectedSkill(null)
                        : setSelectedSkill(currentIndex);
                    }}
                    isDisabled={disabled}
                    isSelected={
                      selectedSkill === null
                        ? false
                        : currentUniqueSkills.at(selectedSkill) === currentSkill
                    }
                    isUrgent={urgent}
                    showAverageProgress={showAverageProgress}
                    participantCount={/*maxParticipantCount*/0}
                    courseMemberCount={course.numberOfCourseMemberships}
                    openTaskCount={
                      filteredSuggestionsBySkill(currentSkill.skillName).length
                    }
                  />
                </div>
              </Slide>
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
        {selectedSkill === null ? (
          <div className="flex flex-col gap-2 overflow-y-auto thin-scrollbar pb-2">
            {filteredSuggestionsByCategory(sortedCategories[selectedCategory])
              .length > 0 ? (
              filteredSuggestionsByCategory(
                sortedCategories[selectedCategory]
              ).map((suggestion) => (
                <Slide
                  key={suggestion.content.id}
                  in
                  direction="right"
                  timeout={700}
                >
                  <div>
                    <Suggestion
                      courseId={course.id}
                      key={suggestion.content.id}
                      _suggestion={suggestion}
                    />
                  </div>
                </Slide>
              ))
            ) : (
              <Typography variant="body2">
                {" "}
                No task recommendations available for this knowledge area.
              </Typography>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto">
            <Typography variant="subtitle2"> Urgent Tasks: </Typography>
            <div className="flex flex-col overflow-y-auto thin-scrollbar pb-2">
              {filteredSuggestionsBySkill(
                currentUniqueSkills.at(selectedSkill)!.skillName
              )
                .filter((suggestion) =>
                  urgentChapters.some(
                    (urgentChapter) =>
                      urgentChapter.id ===
                      suggestion.content.metadata.chapter.id
                  )
                )
                .map((urgentSuggestion) => (
                  <Suggestion
                    courseId={course.id}
                    key={urgentSuggestion.content.id}
                    _suggestion={urgentSuggestion}
                  />
                ))}
            </div>
            <Typography variant="subtitle2"> Other Tasks: </Typography>
            <div className="flex flex-col overflow-y-auto thin-scrollbar pb-2">
              {filteredSuggestionsBySkill(
                currentUniqueSkills.at(selectedSkill)!.skillName
              )
                .filter(
                  (suggestion) =>
                    !urgentChapters.some(
                      (urgentChapter) =>
                        urgentChapter.id ===
                        suggestion.content.metadata.chapter.id
                    )
                )
                .map((notUrgentSuggestion) => (
                  <Suggestion
                    courseId={course.id}
                    key={notUrgentSuggestion.content.id}
                    _suggestion={notUrgentSuggestion}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
