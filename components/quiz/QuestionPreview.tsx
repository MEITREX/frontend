import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import {
  BloomLevel,
  QuestionPreviewFragment$key,
} from "@/__generated__/QuestionPreviewFragment.graphql";
import { useError } from "@/app/courses/[courseId]/flashcards/[flashcardSetId]/lecturer";
import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PreloadedQuery, useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import ItemFormSectionNew, {
  Item,
} from "../form-sections/item/ItemFormSectionNew";
import { RenderRichText } from "../RichTextEditor";
import { AssociationQuestionPreview } from "./AssociationQuestionPreview";
import { ClozeQuestionPreview } from "./ClozeQuestionPreview";
import { DeleteQuestionButton } from "./DeleteQuestionButton";
import { EditMultipleChoiceQuestionButton } from "./EditMultipleChoiceQuestionButton";
import { MultipleChoiceQuestionPreview } from "./MultipleChoiceQuestionPreview";

const QuestionFragment = graphql`
  fragment QuestionPreviewFragment on Question {
    __typename
    hint
    number
    itemId
    ... on AssociationQuestion {
      ...AssociationQuestionPreviewFragment
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
      ...EditMultipleChoiceQuestionButtonFragment
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
      type

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
  const { error, setError } = useError();

  const data = useFragment(QuestionFragment, question);

  // Destructuring necessary due to `readonly` types from relay
  const [item, setItem] = useState<Item>({
    id: data.itemId,
    associatedSkills: data.item!.associatedSkills.map((skill) => ({
      ...skill,
    })),
    associatedBloomLevels: data.item!.associatedBloomLevels as BloomLevel[],
  });

  const [openEditModal, setOpenEditModal] =
    useState<ImplementedQuestionTypes | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <RenderRichText value={data.text ?? "Cloze??"} />

      <ItemFormSectionNew operation="view" item={item} />

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
        <EditMultipleChoiceQuestionButton
          mediaRecords={mediaRecords}
          allSkillsQueryRef={allSkillsQueryRef}
          onClose={() => setOpenEditModal(null)}
          open={openEditModal === "MULTIPLE_CHOICE"}
          question={data}
        />
      )}

      <DeleteQuestionButton
        num={data.number}
        assessmentId={quizId}
        questionId={data.itemId}
      />
    </div>
  );
};

export default QuestionPreview;
