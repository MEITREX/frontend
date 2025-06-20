import { ChapterOverviewItemFragment$key } from "@/__generated__/ChapterOverviewItemFragment.graphql";
import { DoneRounded, LockOutlined } from "@mui/icons-material";
import { CircularProgress, useTheme } from "@mui/material";
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
}: {
  _chapter: ChapterOverviewItemFragment$key;
  selected: boolean;
  onClick: () => void;
}) {
  const chapter = useFragment(ChapterFragment, _chapter);
  const progress = Math.round(chapter.userProgress.progress);
  const suggestedStartDate = Date.parse(
    chapter.suggestedStartDate ?? chapter.startDate
  );
  const disabled = suggestedStartDate.valueOf() > Date.now();
  const title = chapter.title;
  const description = chapter.description;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();

  return (
    <div className="relative flex flex-col items-center justify-center w-100 h-auto">
      <div
        onClick={!disabled ? onClick : undefined}
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
              color: selected
                ? theme.palette.secondary.light
                : theme.palette.primary.light,
            }}
          />
        )}
        {(disabled && (
          <LockOutlined
            className="absolute w-9 h-9"
            style={{ color: theme.palette.grey[300] }}
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
          (progress == 100 && (
            <DoneRounded
              className="absolute w-10 h-10"
              style={{
                color: selected
                  ? theme.palette.secondary.light
                  : theme.palette.primary.light,
              }}
            />
          ))}
      </div>
      <div
        onClick={!disabled ? onClick : undefined}
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
                : disabled
                ? theme.palette.text.disabled
                : theme.palette.text.secondary,
            }}
          >
            {title}
          </div>
          {selected && (
            <div
              className="text-sm text-gray-500 line-clamp-5"
              style={{ color: theme.palette.text.secondary }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
