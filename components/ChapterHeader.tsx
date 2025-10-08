"use client";
import { ChapterHeaderFragment$key } from "@/__generated__/ChapterHeaderFragment.graphql";
import {
  DoneRounded,
  ExpandLess,
  ExpandMore,
  Warning,
} from "@mui/icons-material";
import {
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";
import { graphql, useFragment } from "react-relay";

export function stringToColor(string: string): string {
  const nameColorMap: Record<string, string> = {
    "Algorithmic Foundations": "#F49AC2", // pastel pink
    "Architecture and Organization": "#FDDDE6", // pastel rose
    "Artificial Intelligence": "#E0BBE4", // pastel lavender
    "Data Management": "#EBCCFF", // pastel mauve
    "Foundations of Programming Languages": "#E6E6FA", // lavender
    "Graphics and Interactive Techniques": "#D6EFED", // pale sea blue
    "Human-Computer Interaction": "#D5F6FB", // pastel aqua
    "Mathematical and Statistical Foundations": "#B0E0E6", // pastel turquoise
    "Networking and Communication": "#E0FFFF", // light cyan
    "Operating Systems": "#AEC6CF", // pastel blue
    "Parallel and Distributed Computing": "#FFDAB9", // pastel peach
    Security: "#FDFD96", // pastel yellow
    "Society, Ethics, and the Profession": "#FFFACD", // pastel lemon
    "Software Development Fundamentals": "#D5E8D4", // pastel mint
    "Software Engineering": "#C1E1C1", // pastel light green
    "Specialized Platform Development": "#C3D9C4", // pastel sage
    "Systems Fundamentals": "#CFCFC4", // pastel grey
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

  const getWarningMessage = () => {
    const missingItems = [];
    if (!chapter.suggestedStartDate) {
      missingItems.push("start date");
    }
    if (!chapter.suggestedEndDate) {
      missingItems.push("end date");
    }

    if (missingItems.length > 0) {
      return `Missing chapter configuration: ${missingItems.join(" and ")}.`;
    }
    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <div className="flex flex-row items-center justify-between py-4 pr-4 rounded-3xl gap-4">
      <div className="flex flex-row items-center gap-2 flex-grow">
        {(expandable === undefined || expandable) && expanded !== undefined && (
          <IconButton className="ml-4 mr-2" onClick={onExpandClick}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
        <Typography
          variant="h2"
          onClick={(e) => {
            e.stopPropagation();
            if (onExpandClick) onExpandClick();
          }}
          sx={{ cursor: expandable !== false ? "pointer" : "default" }}
        >
          {chapter.title}
        </Typography>
        {!student && warningMessage && (
          <Tooltip
            title={warningMessage}
            componentsProps={{
              tooltip: {
                sx: {
                  fontSize: "0.85rem",
                },
              },
            }}
          >
            <Warning color="warning" />
          </Tooltip>
        )}
        {action}
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
