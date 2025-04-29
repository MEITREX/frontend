"use client";
import { ChapterHeaderFragment$key } from "@/__generated__/ChapterHeaderFragment.graphql";
import { Done, ExpandLess, ExpandMore } from "@mui/icons-material";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ReactNode } from "react";
import { graphql, useFragment } from "react-relay";
import { SkillLevels } from "./SkillLevels";
import { Skill } from "./Skill";

export function ChapterHeader({
  _chapter,
  expanded,
  action,
  onExpandClick,
  courseId,
  student,
}: {
  _chapter: ChapterHeaderFragment$key;
  expanded?: boolean;
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
          ...SkillFragment
          ...SkillLevelsFragment
        }
      }
    `,
    _chapter
  );

  return (
    <div
      className="flex items-center py-4 pl-8 pr-12 -mx-8 mb-8 bg-gradient-to-r from-slate-100 to-slate-50"
      onClick={onExpandClick}
    >
      {expanded !== undefined && (
        <IconButton className="!-ml-2 !mr-4">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      )}
      <div className="mr-8">
        <ChapterProgress progress={chapter.userProgress.progress} />
      </div>
      <div className="flex justify-between items-center flex-grow">
        <div className="pr-8 flex flex-col items-start">
          <div className="flex gap-2 items-center">
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
        {student && (
          <div style={{display: "flex", flexDirection: "row", gap: "4px"}}>
            {chapter.skills.map(
              (c, index) => c !== null && <Skill key={index} _skill={c} />
            )}
          </div>
        )}
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
