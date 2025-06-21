"use client";
import { ChapterHeaderFragment$key } from "@/__generated__/ChapterHeaderFragment.graphql";
import { DoneRounded, ExpandLess, ExpandMore } from "@mui/icons-material";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";
import { graphql, useFragment } from "react-relay";

export function stringToColor(string: string): string {
  const nameColorMap: Record<string, string> = {
    "Algorithmic Foundations": "#AEC6CF", // pastel blue
    "Architecture and Organization": "#C3D9C4", // pastel sage
    "Artificial Intelligence": "#D6EFED", // pale sea blue
    "Data Management": "#D5F6FB", // pastel aqua
    "Foundations of Programming Languages": "#F49AC2", // pastel pink
    "Graphics and Interactive Techniques": "#EBCCFF", // pastel mauve
    "Human-Computer Interaction": "#CFCFC4", // pastel grey
    "Mathematical and Statistical Foundations": "#FFFACD", // pastel lemon
    "Networking and Communication": "#E0BBE4", // pastel lavender
    "Operating Systems": "#D5E8D4", // pastel mint
    "Parallel and Distributed Computing": "#FDDDE6", // pastel rose
    Security: "#FDFD96", // pastel yellow
    "Society, Ethics, and the Profession": "#B0E0E6", // pastel turquoise
    "Software Development Fundamentals": "#C1E1C1", // pastel light green
    "Software Engineering": "#FFDAB9", // pastel peach
    "Specialized Platform Development": "#E6E6FA", // lavender
    "Systems Fundamentals": "#E0FFFF", // light cyan
  };

  for (const [key, color] of Object.entries(nameColorMap)) {
    if (key === string) {
      return color;
    }
  }
  return "#D3D3D3"; // light gray as default color
}

export function ChapterHeader({
  _chapter,
  expanded,
  expandable,
  action,
  onExpandClick,
  courseId,
  student,
}: {
  _chapter: ChapterHeaderFragment$key;
  expanded?: boolean;
  expandable?: boolean;
  action?: ReactNode;
  onExpandClick?: () => void;
  courseId: string;
  student: boolean;
}) {
  const chapter = useFragment(
    graphql`
      fragment ChapterHeaderFragment on Chapter {
        userProgress {
          progress
        }
        title
        suggestedStartDate
        suggestedEndDate
        userProgress {
          progress
        }
        description
        skills {
          skillName
          skillCategory
        }
      }
    `,
    _chapter
  );

  return (
    <div className="flex flex-row justify-start items-center py-4 pr-4 rounded-3xl gap-16">
      <div className="flex flex-row items-center justify-center flex-grow">
        {(expandable === undefined || expandable) && expanded !== undefined && (
          <IconButton className="ml-4 mr-2" onClick={onExpandClick}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
        <div className="flex flex-col items-start flex-grow gap-5">
          <div className="flex flex-row flex-grow gap-1">
            <Typography variant="h2" onClick={(e) => e.stopPropagation()}>
              {chapter.title}
            </Typography>
            {action}
          </div>
        </div>
      </div>
      {chapter.suggestedEndDate && chapter.suggestedStartDate && (
        <div className="min-w-[200px] justify-start">
          <Typography
            variant="subtitle1"
            color="text.secondary"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "clip",
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {dayjs(chapter.suggestedStartDate).format("D. MMMM")} -{" "}
            {dayjs(chapter.suggestedEndDate).format("D. MMMM")}
          </Typography>
        </div>
      )}
      {student && <ChapterProgress progress={chapter.userProgress.progress} />}
    </div>
  );
}

export function ChapterProgress({ progress }: { progress: number }) {
  return (
    <div className="relative flex justify-center items-center">
      <CircularProgress
        variant="determinate"
        value={100}
        size="3rem"
        thickness={4}
        className="!text-gray-200"
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        value={progress}
        thickness={4}
        size="3rem"
        sx={{
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
          color: "#84BFE6",
        }}
      />
      {(progress >= 0 && progress < 100 && (
        <Typography
          variant="body2"
          fontWeight="bold"
          style={{ color: "#84BFE6", position: "absolute" }}
        >
          {Math.round(progress)}%
        </Typography>
      )) ||
        (progress == 100 && (
          <DoneRounded
            className="absolute w-6 h-6"
            style={{ color: "#84BFE6" }}
          />
        ))}
    </div>
  );
}
