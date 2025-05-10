import { StudentFlashcard$key } from "@/__generated__/StudentFlashcard.graphql";
import { sample } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { StudentFlashcardSide } from "./StudentFlashcardSide";
import { Chip, Stack } from "@mui/material";
import {SKILL_CATEGORY_ABBREVIATION} from "@/components/form-sections/item/ItemFormSection";
import { LightTooltip } from "./LightTooltip";

export function StudentFlashcard({
  _flashcard,
  label,
  onChange,
}: {
  _flashcard: StudentFlashcard$key;
  label: string;
  onChange: (correctness: number) => void;
}) {
  const flashcard = useFragment(
    graphql`
      fragment StudentFlashcard on Flashcard {
        itemId
        sides {
          ...StudentFlashcardSide
          isQuestion
          isAnswer
          label
          text
        }
        item {
          associatedSkills {
            skillName
            skillCategory
      }
    }
      }
    `,
    _flashcard
  );

  const question = useMemo(
    () => sample(flashcard.sides.filter((x) => x.isQuestion)),
    [flashcard]
  );
  const answers = useMemo(
    () => flashcard.sides.filter((x) => x.isAnswer && x !== question),
    [flashcard, question]
  );
  const [knew, setKnew] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reset when flashcard changes
    setKnew({});
  }, [flashcard]);

  useEffect(() => {
    // Notify parent about known status
    const numCorrect = answers
      .map((x) => knew[x.label] ?? false)
      .filter((x) => x).length;
    onChange(numCorrect / answers.length);
  }, [answers, question, knew, onChange]);

  const currentItem = flashcard.item;
  const currentSkills = new Map<string, string[]>();
  currentItem.associatedSkills.forEach((skill) => {
    if(currentSkills.has(skill.skillCategory)) {
      currentSkills.get(skill.skillCategory)!.push(skill.skillName);
    }
    else {
      currentSkills.set(skill.skillCategory, [skill.skillName]);
    }
  });

  return (
    <div>
      <div className="w-full my-6 flex items-center">
        <div className="border-b border-b-gray-300 grow"></div>
        <div className="px-3 text-xs text-gray-600">
          {label}
        </div>
        <div className="border-b border-b-gray-300 grow"></div>
      </div>

      <Stack
        id="skills-selected"
        direction="row"
        sx={{
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {Array.from(currentSkills.entries()).map(([category, skills]) =>
          skills.map((skill, i) => (
            <LightTooltip
              title={
              <>
                <p><strong>{category + ":"}</strong></p>
                <p><strong>{skill}</strong></p>
              </>
              }
              placement="top"
            >
              <Chip
                key={`${skill}-${i}`}
                size="small"
                sx={{
                  maxWidth: "250px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
                title={`${category}: ${skill}`}
                label={(SKILL_CATEGORY_ABBREVIATION[category] ||category) +
                  ": " + skill
                }
              />
            </LightTooltip>
          ))
        )}
      </Stack>

      <div className="mt-6 text-center text-gray-600">
        {question?.text ?? "This flashcard does not have any questions."}
      </div>
      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center mb-6"></div>
      <div className="flex justify-center gap-4">
        {answers.map((answer) => (
          <StudentFlashcardSide
            key={answer.label}
            _side={answer}
            onChange={(knew) =>
              setKnew((oldValue) => ({ ...oldValue, [answer.label]: knew }))
            }
          />
        ))}
      </div>
    </div>
  );
}
