"use client";

import { lecturerAllSkillsQuery } from "@/__generated__/lecturerAllSkillsQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import {
  BloomLevel,
  QuestionPreviewFragment$key,
} from "@/__generated__/QuestionPreviewFragment.graphql";
import {
  Edit,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
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
        }
        associatedBloomLevels
      }
    }

    ... on ClozeQuestion {
      ...ClozeQuestionPreviewFragment
      ...EditClozeQuestionFragment
      type
      clozeElements {
        __typename
        ... on ClozeTextElement {
          text
        }
        ... on ClozeBlankElement {
          correctAnswer
        }
      }
      item {
        id
        associatedSkills {
          id
          skillName
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

const typeMap: Record<string, ImplementedQuestionTypes> = {
  AssociationQuestion: "ASSOCIATION",
  MultipleChoiceQuestion: "MULTIPLE_CHOICE",
  ClozeQuestion: "CLOZE",
};

type Props = {
  mediaRecords: MediaRecordSelector$key;
  question: QuestionPreviewFragment$key;
  allSkillsQueryRef: PreloadedQuery<lecturerAllSkillsQuery> | undefined | null;
};

export default function QuestionPreview({
  question,
  mediaRecords,
  allSkillsQueryRef,
}: Props) {
  const { quizId } = useParams();
  const data = useFragment(QuestionFragment, question);

  // Item-Objekt für ItemFormSection
  const item = useMemo<Item>(
    () => ({
      id: data.itemId,
      associatedSkills: data.item!.associatedSkills.map((s) => ({ ...s })),
      associatedBloomLevels: data.item!
        .associatedBloomLevels as BloomLevel[],
    }),
    [data.item, data.itemId]
  );

  // State für Frage-Einklappen
  const [questionOpen, setQuestionOpen] = useState(false);
  // State für Details-Unterbereich
  const [detailsOpen, setDetailsOpen] = useState(false);
  // State für Edit-Modal
  const [openEditModal, setOpenEditModal] =
    useState<ImplementedQuestionTypes | null>(null);

  // Hilfsfunktion zum Rendern der Frage-Überschrift
  const renderTitle = () => {
    if (data.__typename === "ClozeQuestion") {
      return (
        <div className="flex-1 text-lg font-semibold">
          {data.clozeElements
            .filter((el) => el.__typename === "ClozeTextElement")
            .map((el, i) => (
              <RenderRichText
                key={i}
                value={(el as { text?: string }).text ?? ""}
              />
            ))}
        </div>
      );
    }
    // @ts-ignore
    return (
      <div className="flex-1 text-lg font-semibold">
        {/* @ts-ignore */}
        <RenderRichText value={data.text ?? ""} />
      </div>
    );
  };

  return (
    <div className="mb-4 border rounded-xl shadow-lg">
      {/* Kopfzeile mit Frage-Titel und Pfeil */}
      <button
        onClick={() => setQuestionOpen((o) => !o)}
        className="flex items-center w-full p-4 bg-gray-100 hover:bg-gray-200"
      >
        {questionOpen ? <ExpandLess /> : <ExpandMore />}
        <div className="ml-2">{renderTitle()}</div>
      </button>

      {/* Alles, was zur Frage gehört, nur sichtbar wenn geöffnet */}
      {questionOpen && (
        <div className="p-6 flex flex-col items-center gap-6 bg-white">
          {/* Antwort-Vorschau */}
          <div className="w-full flex flex-col gap-4">
            {data.__typename === "AssociationQuestion" ? (
              <AssociationQuestionPreview question={data} />
            ) : data.__typename === "MultipleChoiceQuestion" ? (
              <MultipleChoiceQuestionPreview question={data} />
            ) : data.__typename === "ClozeQuestion" ? (
              <ClozeQuestionPreview question={data} />
            ) : null}
          </div>

          {/* Einklappbarer Details-Bereich */}
          <div className="w-full mt-6">
            <button
              onClick={() => setDetailsOpen((o) => !o)}
              className="flex items-center font-medium mb-2 bg-white"
            >
              {detailsOpen ? <ExpandLess /> : <ExpandMore />}
              <span className="ml-1">Details zu Item &amp; Skills</span>
            </button>
            {detailsOpen && (
              <div className="p-4 bg-white rounded-lg w-full max-w-lg">
                {/* Item-Information */}
                <ItemFormSection operation="view" item={item} />
              </div>
            )}
          </div>

          {/* Edit / Delete Buttons */}
          <div className="flex space-x-3 mt-4">
            <IconButton
              onClick={() => {
                const impl = typeMap[data.__typename];
                if (impl) setOpenEditModal(impl);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <DeleteQuestionButton num={data.number} assessmentId={quizId} />
          </div>

          {/* Edit-Modals */}
          {openEditModal === "MULTIPLE_CHOICE" && (
            <EditMultipleChoiceQuestion
              _allRecords={mediaRecords}
              allSkillsQueryRef={allSkillsQueryRef}
              onClose={() => setOpenEditModal(null)}
              open
              question={data}
            />
          )}
          {openEditModal === "CLOZE" && (
            <EditClozeQuestion
              _allRecords={mediaRecords}
              allSkillsQueryRef={allSkillsQueryRef}
              onClose={() => setOpenEditModal(null)}
              open
              question={data}
            />
          )}
          {openEditModal === "ASSOCIATION" && (
            <EditAssociationQuestion
              _allRecords={mediaRecords}
              allSkillsQueryRef={allSkillsQueryRef}
              onClose={() => setOpenEditModal(null)}
              open
              question={data}
            />
          )}
        </div>
      )}
    </div>
  );
}