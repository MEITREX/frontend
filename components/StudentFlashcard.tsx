import { BloomLevel } from "@/__generated__/QuestionPreviewFragment.graphql";
import { StudentFlashcard$key } from "@/__generated__/StudentFlashcard.graphql";
import { Item } from "@/components/form-sections/item/ItemFormSection";
import ItemFormSectionPreview from "@/components/form-sections/item/ItemFormSectionPreview";
import { Stack } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { StudentFlashcardSide } from "./StudentFlashcardSide";

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
          id
          associatedSkills {
            id
            skillName
            skillCategory
            isCustomSkill
          }
          associatedBloomLevels
        }
      }
    `,
    _flashcard
  );

  const questionCandidates = useMemo(
    () => flashcard.sides.filter((x) => x.isQuestion),
    [flashcard.sides]
  );
  const answerCandidates = useMemo(
    () => flashcard.sides.filter((x) => x.isAnswer),
    [flashcard.sides]
  );

  const [questionLabel, setQuestionLabel] = useState<string | null>(null);

  useEffect(() => {
    setQuestionLabel(questionCandidates[0]?.label ?? null);
    setKnew({});
  }, [flashcard.itemId, questionCandidates]);

  const question = useMemo(
    () => questionCandidates.find((q) => q.label === questionLabel),
    [questionCandidates, questionLabel]
  );
  const answers = useMemo(
    () => answerCandidates.filter((a) => a.label !== questionLabel),
    [answerCandidates, questionLabel]
  );
  const [knew, setKnew] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reset when flashcard changes
    setKnew({});
  }, [flashcard]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (answers.length === 0) return;
    const numCorrect = answers.reduce(
      (acc, x) => acc + (knew[x.label] ? 1 : 0),
      0
    );
    onChangeRef.current(numCorrect / answers.length);
  }, [answers, knew]);

  const currentItem = useMemo<Item>(
    () => ({
      id: flashcard.itemId,
      associatedSkills: flashcard.item!.associatedSkills.map((skill) => ({
        ...skill,
      })),
      associatedBloomLevels: flashcard.item!
        .associatedBloomLevels as BloomLevel[],
    }),
    [flashcard.item, flashcard.itemId]
  );

  return (
    <div>
      <div className="w-full my-6 flex items-center">
        <div className="border-b border-b-gray-300 grow"></div>
        <div className="px-3 text-xs text-gray-600">{label}</div>
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
        <ItemFormSectionPreview item={currentItem} />
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
