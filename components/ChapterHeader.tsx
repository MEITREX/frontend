"use client";
import { ChapterHeaderFragment$key } from "@/__generated__/ChapterHeaderFragment.graphql";
import { Done, ExpandLess, ExpandMore } from "@mui/icons-material";
import { Chip, CircularProgress, IconButton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";
import { graphql, useFragment } from "react-relay";
import { LightTooltip } from "./LightTooltip";

export function stringToColor(string: string): string {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
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

  function getReadableTextColor(backgroundColor: String) {
    const hex = backgroundColor.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? "#000000" : "#FFFFFF";
  }

  const skillCategoryMap = new Map<string, string[]>();

  chapter.skills
    .filter((c) => c !== null)
    .forEach((c) => {
      if (!skillCategoryMap.has(c!.skillCategory)) {
        skillCategoryMap.set(c!.skillCategory, []);
      }
      skillCategoryMap.get(c!.skillCategory)!.push(c!.skillName);
    });

  for (const key of skillCategoryMap.keys()) {
    skillCategoryMap.get(key)!.sort();
  }

  const skillChips = Array.from(skillCategoryMap.entries())
    .sort()
    .map(([category, skillNames], index) => (
      <LightTooltip
        key={category}
        title={
          <>
            <p>
              <strong>{category + ":"}</strong>
            </p>
            <ul className="list-disc pl-6">
              {[...new Set(skillNames)].map((skillName, index) => (
                <li key={index}>{skillName}</li>
              ))}
            </ul>
          </>
        }
      >
        <Chip
          key={index}
          sx={{
            maxWidth: "250px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            backgroundColor: stringToColor(category),
            color: getReadableTextColor(stringToColor(category)),
          }}
          label={category}
        />
      </LightTooltip>
    ));

  return (
    <div
      className="flex items-center py-4 pl-8 pr-12 mb-8 bg-gradient-to-r from-slate-100 to-slate-50 rounded-3xl"
      onClick={onExpandClick}
    >
      {(expandable === undefined || expandable) && expanded !== undefined && (
        <IconButton className="!-ml-2 !mr-4">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      )}
      <div className="mr-8">
        <ChapterProgress progress={chapter.userProgress.progress} />
      </div>
      <div className="flex justify-between items-center flex-grow">
        <div className="pr-8 flex flex-col items-start">
          <div className="flex gap-2 whitespace-nowrap items-center">
            <Typography variant="h2" onClick={(e) => e.stopPropagation()}>
              {chapter.title}
            </Typography>
            {action}
          </div>
          {chapter.suggestedEndDate && chapter.suggestedStartDate && (
            <Typography
              variant="subtitle1"
              onClick={(e) => e.stopPropagation()}
            >
              {dayjs(chapter.suggestedStartDate).format("D. MMMM")} –{" "}
              {dayjs(chapter.suggestedEndDate).format("D. MMMM")}
            </Typography>
          )}
          <Typography variant="caption" onClick={(e) => e.stopPropagation()}>
            {chapter.description}
          </Typography>
        </div>
        <div className="flex justify-end flex-wrap gap-2">{skillChips}</div>
      </div>
    </div>
  );
}

export function ChapterProgress({ progress }: { progress: number }) {
  return (
    <div className="relative flex justify-center items-center">
      <div className="absolute h-12 w-12 rounded-full shadow-lg shadow-slate-100"></div>
      <div className="absolute h-10 w-10 rounded-full shadow-inner shadow-slate-100"></div>
      <CircularProgress
        variant="determinate"
        value={100}
        size="3rem"
        thickness={4}
        className="!text-white"
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        color="success"
        value={progress}
        thickness={4}
        size="3rem"
      />
      {progress == 100 && (
        <Done fontSize="large" className="absolute text-green-600" />
      )}
    </div>
  );
}
