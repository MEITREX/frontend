/* eslint-disable jsx-a11y/alt-text */
"use client";

import {
  ContentLinkFragment$key,
  MediaType,
} from "@/__generated__/ContentLinkFragment.graphql";
import { PageView, usePageView } from "@/src/currentView";
import {
  ArrowRight,
  Description,
  Earbuds,
  Image,
  Language,
  PersonalVideo,
  QuestionAnswerRounded,
  Quiz,
  Terminal,
} from "@mui/icons-material";
import { Chip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ProviderAuthorizationDialog } from "../ProviderAuthorizationDialog";
import { codeAssessmentProvider, providerConfig } from "../ProviderConfig";
import { NoMaxWidthTooltip } from "../search/SearchResultItem";
import { useAccessTokenCheck } from "../useAccessTokenCheck";
import { ProgressFrame } from "./ProgressFrame";

export const ContentTypeToColor: Record<string, string> = {
  MediaContent: colors.violet[200],
  FlashcardSetAssessment: colors.emerald[200],
  QuizAssessment: colors.rose[200],
  AssignmentAssessment: colors.blue[200],
};

export type ContentChip = { key: string; label: string; color?: string };
export type ContentSize = "small" | "normal";

export function MediaRecordIcon({ type }: { type: MediaType }) {
  const style = { color: "text.secondary", width: "100%", height: "100%" };
  switch (type) {
    case "AUDIO":
      return <Earbuds sx={style} />;
    case "DOCUMENT":
      return <Description sx={style} />;
    case "IMAGE":
      return <Image sx={style} />;
    case "PRESENTATION":
      return <PersonalVideo sx={style} />;
    case "VIDEO":
      return <ArrowRight sx={style} />;
    case "URL":
      return <Language sx={style} />;
    default:
      return <></>;
  }
}

export function ContentLink({
  disabled = false,
  optional = false,
  extra_chips = [],
  size = "normal",
  _content,
  courseId,
}: {
  disabled?: boolean;
  optional?: boolean;
  extra_chips?: ContentChip[];
  size?: ContentSize;
  _content: ContentLinkFragment$key;
  courseId: string;
}) {
  const content = useFragment(
    graphql`
      fragment ContentLinkFragment on Content {
        id
        metadata {
          type
          name
          tagNames
        }
        userProgressData {
          ...ProgressFrameFragment
        }

        ... on MediaContent {
          mediaRecords {
            id
            name
            type
            aiProcessingProgress {
              queuePosition
              state
            }
            suggestedTags
            summary
          }
          aiProcessingProgress {
            queuePosition
            state
          }
        }

        ... on AssignmentAssessment {
          assignment {
            assignmentType
          }
        }

        __typename
      }
    `,
    _content
  );

  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const checkAccessToken = useAccessTokenCheck();
  const provider = providerConfig[codeAssessmentProvider];

  const isProcessing =
    content.aiProcessingProgress?.state === "PROCESSING" ||
    content.aiProcessingProgress?.state === "ENQUEUED" ||
    content.mediaRecords?.some(
      (x) =>
        x.aiProcessingProgress.state === "ENQUEUED" ||
        x.aiProcessingProgress.state === "PROCESSING"
    );
  const hasSuggestedTags =
    content.metadata.tagNames.length === 0 &&
    (content.mediaRecords?.some((x) => x.suggestedTags.length > 0) ?? false);
  const [pageView] = usePageView();

  const typeString =
    content.__typename === "MediaContent"
      ? "Media"
      : content.__typename === "FlashcardSetAssessment"
      ? "Flashcard"
      : content.__typename === "QuizAssessment"
      ? "Quiz"
      : content.__typename === "AssignmentAssessment" &&
        content.assignment?.assignmentType === "CODE_ASSIGNMENT"
      ? "Code Assignment"
      : "Unknown";
  const router = useRouter();
  const chips = [
    ...(optional ? [{ key: "optional", label: "optional" }] : []),
    {
      key: "type",
      label: typeString,
      color: ContentTypeToColor[content.__typename],
    },
    ...(pageView === PageView.Lecturer && isProcessing
      ? [{ key: "processing", label: "Processing..." }]
      : []),
    ...(pageView === PageView.Lecturer && hasSuggestedTags
      ? [
          {
            key: "tags",
            label: "New tags available",
          },
        ]
      : []),
    ...extra_chips,
  ];

  const gap = size == "small" ? "gap-2" : "gap-4";

  const cursor = !disabled ? "cursor-pointer" : "cursor-default";
  const frameSize = size == "small" ? "w-10 h-10" : "w-12 h-12";

  let icon =
    content.__typename === "MediaContent" ? (
      <div
        className={
          content.mediaRecords && content.mediaRecords.length > 1
            ? "grid grid-cols-2 max-w-[50%] max-h-[50%]"
            : "max-w-[50%] max-h-[50%]"
        }
      >
        {content.mediaRecords?.slice(0, 4).map((x, idx) => (
          <MediaRecordIcon type={x.type} key={idx} />
        ))}
      </div>
    ) : content.__typename === "FlashcardSetAssessment" ? (
      <QuestionAnswerRounded
        className="!w-1/2 !h-1/2"
        sx={{
          color: disabled ? "text.disabled" : "text.secondary",
        }}
      />
    ) : content.__typename === "QuizAssessment" ? (
      <Quiz
        className="!w-[47%] !h-[47%]"
        sx={{
          color: disabled ? "text.disabled" : "text.secondary",
        }}
      />
    ) : content.__typename === "AssignmentAssessment" ? (
      <Terminal
        className="!w-[47%] !h-[47%]"
        sx={{
          color: disabled ? "text.disabled" : "text.secondary",
        }}
      />
    ) : (
      <div>unknown</div>
    );

  let link =
    content.__typename === "MediaContent"
      ? `/courses/${courseId}/media/${content.id}`
      : content.__typename === "FlashcardSetAssessment"
      ? `/courses/${courseId}/flashcards/${content.id}`
      : content.__typename === "QuizAssessment"
      ? `/courses/${courseId}/quiz/${content.id}`
      : content.__typename === "AssignmentAssessment" &&
        content.assignment?.assignmentType === "CODE_ASSIGNMENT"
      ? `/courses/${courseId}/assignment/${content.id}`
      : "-";

  const body = (
    <>
      {showProviderDialog && (
        <ProviderAuthorizationDialog
          onClose={() => setShowProviderDialog(false)}
          onAuthorize={() => {
            setShowProviderDialog(false);
          }}
          alertMessage={`You must authorize via ${provider.name} to access this code assignment.`}
          _provider={codeAssessmentProvider}
        />
      )}

      <button
        disabled={disabled}
        className={`group flex items-center text-left ${gap} pr-3 bg-transparent hover:disabled:bg-gray-50 ${cursor} rounded-full`}
        onClick={async () => {
          if (
            content.__typename === "AssignmentAssessment" &&
            content.assignment?.assignmentType === "CODE_ASSIGNMENT"
          ) {
            const hasToken = await checkAccessToken();
            if (!hasToken) {
              setShowProviderDialog(true);
              return;
            }
          }

          router.push(link);
        }}
      >
        <div
          className={`${frameSize} relative flex justify-center items-center group-hover:group-enabled:scale-105`}
        >
          <ProgressFrame
            color={
              disabled
                ? colors.gray[100]
                : ContentTypeToColor[content.__typename]
            }
            _progress={content.userProgressData}
          />

          <div className="absolute flex justify-center items-center">
            {icon}
          </div>
        </div>
        <div className="group-hover:group-enabled:translate-x-0.5">
          <div
            className={`flex pb-1 items-center ${
              size == "small" ? "gap-1 -ml-0.5" : "gap-1.5 -ml-1"
            }`}
          >
            {chips.map((chip) => (
              <Chip
                key={chip.key}
                className={"!h-4 px-0 !text-[0.6rem]"}
                label={chip.label}
                sx={{ backgroundColor: chip.color }}
              />
            ))}
          </div>
          <Typography
            variant="body2"
            color={disabled ? "text.disabled" : "text.secondary"}
          >
            {content.metadata.name}
          </Typography>
        </div>
        <div className="flex-1"></div>
      </button>
    </>
  );

  if (content.mediaRecords?.some((x) => true)) {
    return (
      <NoMaxWidthTooltip
        title={
          <div>
            <div className="w-full border-b mb-2">Summary</div>
            {content.mediaRecords
              .filter((x) => x.summary.length > 0)
              .map((rec) => (
                <div key={rec.id}>
                  <div className="italic">{rec.name}</div>
                  <div className="mb-1" style={{ whiteSpace: "pre" }}>
                    {rec.summary || "No summary"}
                  </div>
                </div>
              ))}

            <div className="!text-[8px] opacity-50 font-light">
              Summaries are generated automatically and may contain inaccuracies
            </div>
          </div>
        }
      >
        {body}
      </NoMaxWidthTooltip>
    );
  } else {
    return body;
  }
}
