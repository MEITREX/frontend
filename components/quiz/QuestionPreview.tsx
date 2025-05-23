import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import {
  BloomLevel,
  QuestionPreviewFragment$key,
} from "@/__generated__/QuestionPreviewFragment.graphql";
import { Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PreloadedQuery, useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { Item } from "../form-sections/item/ItemFormSection";
import ItemFormSectionPreview from "../form-sections/item/ItemFormSectionPreview";
import { RenderRichText } from "../RichTextEditor";
import { AssociationQuestionPreview } from "./AssociationQuestionPreview";
import { ClozeQuestionPreview } from "./ClozeQuestionPreview";
import { DeleteQuestionButton } from "./DeleteQuestionButton";
import { EditAssociationQuestion } from "./EditAssociationQuestion";
import { EditClozeQuestion } from "./EditClozeQuestion";
import { EditMultipleChoiceQuestion } from "./EditMultipleChoiceQuestion";
import { MultipleChoiceQuestionPreview } from "./MultipleChoiceQuestionPreview";

const QuestionFragment = graphql`
  fragment QuestionPreviewFragment on Question {
    __typename
    hint
    number
    itemId
    ... on AssociationQuestion {
      ...AssociationQuestionPreviewFragment
      ...EditAssociationQuestionFragment
      type
      text

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
    ... on MultipleChoiceQuestion {
      ...MultipleChoiceQuestionPreviewFragment
      ...EditMultipleChoiceQuestionFragment
      type
      text

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
    ... on ClozeQuestion {
      ...ClozeQuestionPreviewFragment
      ...EditClozeQuestionFragment
      type
      clozeElements {
        ... on ClozeBlankElement {
          correctAnswer
        }
        ... on ClozeTextElement {
          text
        }
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
  }
`;

export type ImplementedQuestionTypes =
  | "ASSOCIATION"
  | "MULTIPLE_CHOICE"
  | "CLOZE";

type Props = {
  mediaRecords: MediaRecordSelector$key;
  question: QuestionPreviewFragment$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
};

const QuestionPreview = ({
  question,
  mediaRecords,
  allSkillsQueryRef,
}: Props) => {
  const { quizId } = useParams();
  const data = useFragment(QuestionFragment, question);

  // Destructuring necessary due to `readonly` types from relay
  const item = useMemo<Item>(
    () => ({
      id: data.itemId,
      associatedSkills: data.item!.associatedSkills.map((skill) => ({
        ...skill,
      })),
      associatedBloomLevels: data.item!.associatedBloomLevels as BloomLevel[],
    }),
    [data.item, data.itemId]
  );

  const [openEditModal, setOpenEditModal] =
    useState<ImplementedQuestionTypes | null>(null);

  // logic to render ItemFormSectionPreview besides the heading if enough space is available
  const sectionInHeading = useRef<HTMLDivElement>(null);
  const sectionBelowHeading = useRef<HTMLDivElement>(null);

  const toggleInlineItemFormSection = useCallback(() => {
    if (sectionInHeading.current && sectionBelowHeading.current) {
      const test = sectionInHeading.current.getBoundingClientRect();
      // should roughly fit one BloomLevel & one skill
      if (test.width > 350) {
        sectionInHeading.current.style.contentVisibility = "visible";
        sectionBelowHeading.current!.style.contentVisibility = "hidden";
        sectionBelowHeading.current!.style.marginBottom = "-.75rem";
      } else {
        sectionInHeading.current.style.contentVisibility = "hidden";
        sectionBelowHeading.current!.style.contentVisibility = "visible";
        sectionBelowHeading.current!.style.marginBottom = "0rem";
      }
    }
  }, []);

  useLayoutEffect(() => {
    toggleInlineItemFormSection();
  }, [toggleInlineItemFormSection]);

  useEffect(() => {
    window.addEventListener("resize", toggleInlineItemFormSection);

    return () => {
      window.removeEventListener("resize", toggleInlineItemFormSection);
    };
  }, [toggleInlineItemFormSection]);

  return (
    <>
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex justify-between">
          <div className="mt-1">
            {data.text ? (
              <RenderRichText
                value={data.text}
                className="text-xl font-bold self-start mr-4"
              />
            ) : (
              <span className="text-xl font-bold flex flex-row mr-4">
                {data.clozeElements![0].correctAnswer ?? (
                  <RenderRichText
                    value={data.clozeElements![0].text}
                    className="text-xl font-bold self-start"
                  />
                )}
                ...
              </span>
            )}
          </div>

          <div ref={sectionInHeading} style={{ flex: 1 }}>
            <ItemFormSectionPreview item={item} />
          </div>

          <div className="flex flex-row justify-between gap-x-2 self-start min-w-fit">
            <Button
              startIcon={<Edit />}
              sx={{ minWidth: "fit-content" }}
              onClick={() =>
                setOpenEditModal(data.type as ImplementedQuestionTypes)
              }
            >
              <span className="max-lg:hidden">Edit</span>
            </Button>
            <DeleteQuestionButton num={data.number} assessmentId={quizId} />
          </div>
        </div>

        <div ref={sectionBelowHeading}>
          <ItemFormSectionPreview item={item} />
        </div>

        <div className="flex flex-col gap-2 items-start ml-2 mt-2">
          {data.type === "ASSOCIATION" ? (
            <AssociationQuestionPreview question={data} />
          ) : data.type === "MULTIPLE_CHOICE" ? (
            <MultipleChoiceQuestionPreview question={data} />
          ) : data.type === "CLOZE" ? (
            <ClozeQuestionPreview question={data} />
          ) : null}
        </div>
      </div>

      {openEditModal === "MULTIPLE_CHOICE" && (
        <EditMultipleChoiceQuestion
          _allRecords={mediaRecords}
          allSkillsQueryRef={allSkillsQueryRef}
          onClose={() => setOpenEditModal(null)}
          open={openEditModal === "MULTIPLE_CHOICE"}
          question={data}
        />
      )}

      {openEditModal === "CLOZE" && (
        <EditClozeQuestion
          _allRecords={mediaRecords}
          allSkillsQueryRef={allSkillsQueryRef}
          onClose={() => setOpenEditModal(null)}
          open={openEditModal === "CLOZE"}
          question={data}
        />
      )}
      {openEditModal === "ASSOCIATION" && (
        <EditAssociationQuestion
          _allRecords={mediaRecords}
          allSkillsQueryRef={allSkillsQueryRef}
          onClose={() => setOpenEditModal(null)}
          open={openEditModal === "ASSOCIATION"}
          question={data}
        />
      )}
    </>
  );
};

export default QuestionPreview;
