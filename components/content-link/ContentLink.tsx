"use client";

import {
  ContentLinkFragment$key,
  MediaType,
} from "@/__generated__/ContentLinkFragment.graphql";
import {
  ArrowRight,
  Description,
  Earbuds,
  Image,
  Language,
  PersonalVideo,
  QuestionAnswerRounded,
  Quiz,
} from "@mui/icons-material";
import { Chip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentChip, ContentSize } from "./ContentBase";
import { ProgressFrame } from "./ProgressFrame";

export const ContentTypeToColor: Record<string, string> = {
  MediaContent: colors.violet[200],
  FlashcardSetAssessment: colors.emerald[200],
  QuizAssessment: colors.rose[200],
};

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
        }
        userProgressData {
          ...ProgressFrameFragment
        }
        ... on MediaContent {
          mediaRecords {
            type
            aiProcessingProgress {
              queuePosition
              state
            }
          }
          aiProcessingProgress {
            queuePosition
            state
          }
        }

        __typename
      }
    `,
    _content
  );
  const isProcessing =
    content.aiProcessingProgress?.state !== "DONE" ||
    content.mediaRecords?.some((x) => x.aiProcessingProgress.state !== "DONE");
  const typeString =
    content.__typename === "MediaContent"
      ? "Media"
      : content.__typename === "FlashcardSetAssessment"
      ? "Flashcard"
      : content.__typename === "QuizAssessment"
      ? "Quiz"
      : "Unknown";
  const router = useRouter();
  const chips = [
    ...(optional ? [{ key: "optional", label: "optional" }] : []),
    {
      key: "type",
      label: typeString,
      color: ContentTypeToColor[content.__typename],
    },
    ...(isProcessing ? [{ key: "processing", label: "Processing..." }] : []),
    ...extra_chips,
  ];

  const gap = size == "small" ? "gap-2" : "gap-4";

  const cursor = !disabled ? "cursor-pointer" : "cursor-default";
  const frameSize = size == "small" ? "w-10 h-10" : "w-16 h-16";

  let icon =
    content.__typename === "MediaContent" ? (
      <div
        className={
          content.mediaRecords && content.mediaRecords.length > 1
            ? "grid grid-cols-2 max-w-[50%] max-h-[50%]"
            : ""
        }
      >
        {content.mediaRecords?.slice(0, 4).map((x) => (
          <MediaRecordIcon type={x.type} />
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
      : "-";

  return (
    <button
      disabled={disabled}
      className={`group flex items-center text-left ${gap} pr-3 bg-transparent hover:disabled:bg-gray-50 ${cursor} rounded-full`}
      onClick={() => router.push(link)}
    >
      <div
        className={`${frameSize} relative flex justify-center items-center group-hover:group-enabled:scale-105`}
      >
        <ProgressFrame
          color={
            disabled ? colors.gray[100] : ContentTypeToColor[content.__typename]
          }
          _progress={content.userProgressData}
        />

        <div className="absolute flex justify-center items-center">{icon}</div>
      </div>
      <div className="group-hover:group-enabled:translate-x-0.5">
        <div
          className={`flex items-center ${
            size == "small" ? "gap-1 -ml-0.5" : "gap-1.5 -ml-1"
          }`}
        >
          {chips.map((chip) => (
            <Chip
              key={chip.key}
              className={"!h-4 px-0 !text-[0.6rem]"}
              label={chip.label}
              sx={{ backgroundColor: chip.color }}
              classes={{ label: size == "small" ? "!px-2 mt-[0.1rem]" : "" }}
            />
          ))}
        </div>
        <Typography
          variant="subtitle1"
          fontSize={size == "small" ? "0.8rem" : "1.25rem"}
          fontWeight="500"
          color={disabled ? "text.disabled" : ""}
          sx={size == "small" ? { lineHeight: 1.5 } : { marginBottom: -0.5 }}
        >
          {content.metadata.name}
        </Typography>
      </div>
      <div className="flex-1"></div>
    </button>
  );
}
