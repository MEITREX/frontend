import { ChapterOverviewItemFragment$key } from "@/__generated__/ChapterOverviewItemFragment.graphql";
import { AccessTimeRounded, DoneRounded } from "@mui/icons-material";
import { CircularProgress, useTheme } from "@mui/material";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";

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
  anyContent,
}: {
  _chapter: ChapterOverviewItemFragment$key;
  selected: boolean;
  onClick: () => void;
  anyContent: boolean;
}) {
  const chapter = useFragment(ChapterFragment, _chapter);
  const progress = Math.round(chapter.userProgress.progress);
  const suggestedStartDate = Date.parse(
    chapter.suggestedStartDate ?? chapter.startDate
  );
  const notSuggestedYet = suggestedStartDate.valueOf() > Date.now();
  const title = chapter.title;
  const description = chapter.description;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();
  const [enterMouse, setEnterMouse] = useState<boolean>(false);

  return (
    <div className="relative flex flex-col items-center justify-center w-100 h-auto">
      <div
        onClick={onClick}
        onMouseEnter={() => setEnterMouse(true)}
        onMouseLeave={() => setEnterMouse(false)}
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
          sx={{ color: theme.palette.grey[300] }}
        />
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
            color: selected
              ? theme.palette.secondary.light
              : anyContent
                ? theme.palette.primary.light
                : theme.palette.grey[400],

          }}
        />
        {(notSuggestedYet && progress === 0 && (
          <AccessTimeRounded
              className="absolute w-10 h-10"
              style={{
                color: selected
                  ? theme.palette.secondary.light
                  : theme.palette.grey[400],
              }}
          />
          )) ||
          (progress < 100 && (
            <div
              className="absolute text-sm font-bold"
              style={{
                color: selected
                  ? theme.palette.secondary.light
                  : theme.palette.primary.light,
              }}
            >
              {progress}%
            </div>
          )) ||
          (progress == 100 && anyContent && (
            <DoneRounded
              className="absolute w-10 h-10"
              style={{
                color: selected
                  ? theme.palette.secondary.light
                  : theme.palette.primary.light,
              }}
            />
          )) ||
          (!anyContent && (
            <div
              className="absolute text-sm font-bold"
              style={{
                color: selected
                  ? theme.palette.secondary.light
                  : theme.palette.grey[400],
              }}
            >
              --
            </div>
          ))}
      </div>
      <div
        onClick={onClick}
        onMouseEnter={() => setEnterMouse(true)}
        onMouseLeave={() => setEnterMouse(false)}
        className="absolute top-full mt-2 flex flex-col items-center w-40 h-auto"
      >
        {/* Triangle */}
        <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />

        {/* Tooltip-Bubble */}
        <div className="bg-white rounded-lg shadow-md px-3 py-2 text-center">
          <div
            className="text-sm font-semibold"
            style={{
              color: selected
                ? theme.palette.secondary.light
                : notSuggestedYet
                ? theme.palette.text.disabled
                : theme.palette.text.secondary,
            }}
          >
            {title}
          </div>
          {enterMouse && (
            <div
              className="text-sm text-gray-500 line-clamp-3"
              style={{ color: theme.palette.text.secondary }}
            >
              {anyContent ? description : "No assessments available yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
