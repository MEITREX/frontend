import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import {
  BloomLevel,
  QuestionPreviewFragment$key,
} from "@/__generated__/QuestionPreviewFragment.graphql";
import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PreloadedQuery, useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import ItemFormSection, { Item } from "../form-sections/item/ItemFormSection";
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

  return (
    <div className="flex flex-col gap-2">
      <RenderRichText value={data.text ?? "Cloze??"} />

      <ItemFormSection operation="view" item={item} />

      <div className="flex flex-col gap-2">
        {data.type === "ASSOCIATION" ? (
          <AssociationQuestionPreview question={data} />
        ) : data.type === "MULTIPLE_CHOICE" ? (
          <MultipleChoiceQuestionPreview question={data} />
        ) : data.type === "CLOZE" ? (
          <ClozeQuestionPreview question={data} />
        ) : null}
      </div>

      <IconButton
        onClick={() => setOpenEditModal(data.type as ImplementedQuestionTypes)}
      >
        <Edit fontSize="small" />
      </IconButton>

      {openEditModal === "MULTIPLE_CHOICE" && (
        <EditMultipleChoiceQuestion
          _allRecords={mediaRecords}
          allSkillsQueryRef={allSkillsQueryRef}
          onClose={() => setOpenEditModal(null)}
          open={openEditModal === "MULTIPLE_CHOICE"}
          question={data}
        />
      )}

      <DeleteQuestionButton num={data.number} assessmentId={quizId} />
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
    </div>
  );
};

export default QuestionPreview;
