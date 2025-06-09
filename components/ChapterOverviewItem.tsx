import { ChapterOverviewItemFragment$key } from "@/__generated__/ChapterOverviewItemFragment.graphql";
import { DoneRounded, LockOutlined } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
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
              color: selected ? "#F27900" : "#84BFE6",
            }}
          />
        )}
        {(disabled && (
          <LockOutlined className="absolute w-9 h-9 text-gray-300" />
        )) ||
          (progress >= 0 && progress < 100 && (
            <div
              className="absolute text-sm font-bold"
              style={{ color: selected ? "#F27900" : "#84BFE6" }}
            >
              {progress}%
            </div>
          )) ||
          (progress == 100 && (
            <DoneRounded
              className="absolute w-10 h-10"
              style={{ color: selected ? "#F27900" : "#84BFE6" }}
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
            style={{ color: selected ? "#F27900" : "#1F2937" }}
          >
            {title}
          </div>
          {selected && (
            <div className="text-sm text-gray-500 line-clamp-5">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
