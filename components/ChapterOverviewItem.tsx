import React from "react";
import { DoneRounded, LockOutlined } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { ChapterOverviewItemFragment$key } from "@/__generated__/ChapterOverviewItemFragment.graphql";
import { Suggestion } from "./Suggestion";

const ChapterFragment = graphql`
  fragment ChapterOverviewItemFragment on Chapter {
    title
    description
    userProgress {
      progress
    }
    suggestedStartDate
    suggestedEndDate
    startDate
    endDate
  }
`;

export function ChapterOverviewItem({
  _chapter,
  selected,
  onClick,
  suggestions,
  courseId,
}: {
  _chapter: ChapterOverviewItemFragment$key;
  selected: boolean;
  onClick: () => void;
  suggestions?: any[];
  courseId?: string;
}) {
  const chapter = useFragment(ChapterFragment, _chapter);
  const progress = chapter.userProgress.progress;
  const suggestedStartDate = Date.parse(
    chapter.suggestedStartDate ?? chapter.startDate
  );
  const disabled = suggestedStartDate.valueOf() > Date.now();
  const title = chapter.title;
  const description = chapter.description;

  return (
    <div className="relative flex flex-col items-center justify-center w-100 h-auto">
      <div className="bg-white rounded-lg shadow-md px-3 pb-2 text-center">
        {suggestions && courseId && suggestions.map((suggestion) => (
          <Suggestion
            key={suggestion.id}
            _suggestion={suggestion}
            courseId={courseId}
            small={true}
          />
        ))}
      </div>
      <div
        onClick={onClick}
        className="relative flex justify-center items-center"
      >
        <div
          style={{
            position: "absolute",
            width: "4rem",
            height: "4rem",
            borderRadius: "50%",
            backgroundColor: "white",
          }}
        />
        <CircularProgress
          variant="determinate"
          value={100}
          size="4rem"
          thickness={4}
          className="!text-gray-200"
        />
        {!disabled && (
          <CircularProgress
            className="absolute"
            variant="determinate"
            value={progress}
            thickness={4}
            size="4rem"
            sx={{
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
              color: selected ? "#F27900" : "#089CDC",
            }}
          />
        )}
        {(disabled && (
          <LockOutlined className="absolute w-9 h-9 text-gray-300" />
        )) ||
          (progress >= 0 && progress < 100 && (
            <div
              className="absolute text-sm font-bold"
              style={{ color: selected ? "#F27900" : "#089CDC" }}
            >
              {progress}%
            </div>
          )) ||
          (progress == 100 && (
            <DoneRounded
              className="absolute w-10 h-10"
              style={{ color: selected ? "#F27900" : "#089CDC" }}
            />
          ))}
      </div>
      <div
        onClick={onClick}
        className="absolute top-full mt-2 flex flex-col items-center w-40 h-auto"
      >
        {/* Dreieck */}
        <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />

        {/* Tooltip-Blase */}
        <div className="bg-white rounded-lg shadow-md px-3 py-2 text-center">
          <div
            className="text-sm font-semibold"
            style={{ color: selected ? "#F27900" : "#1F2937" }}
          >
            {title}
          </div>
        </div>
      </div>
    </div>
  );
}
