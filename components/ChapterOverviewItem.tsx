import { ChapterOverviewItemFragment$key } from "@/__generated__/ChapterOverviewItemFragment.graphql";
import { ContentPasteOffRounded, DoneRounded, LockOutlined } from "@mui/icons-material";
import {
  Chip,
  CircularProgress,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
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
  const startDate = Date.parse(chapter.startDate);
  const suggestedStartDate = Date.parse(
    chapter.suggestedStartDate ?? chapter.startDate
  );
  const suggestedEndDate = Date.parse(
    chapter.suggestedEndDate ?? chapter.endDate
  );
  const disabled = startDate.valueOf() > Date.now();
  const catchUp = suggestedEndDate.valueOf() < Date.now();
  const inFocus =
    suggestedStartDate.valueOf() <= Date.now() &&
    suggestedEndDate.valueOf() >= Date.now();
  const upComing =
    !disabled && suggestedStartDate.valueOf() > Date.now() && !catchUp;
  const done = !disabled && Math.round(chapter.userProgress.progress) === 100;
  const title = chapter.title;
  const description = chapter.description;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();

  return (
    <div className="relative flex flex-col items-center justify-center h-auto w-60">
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
          (anyContent && progress == 100 && (
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
            <ContentPasteOffRounded
              className="absolute w-8 h-8"
              style={{ color: theme.palette.grey[500] }}
            />
          ))}
      </div>
      <div
        onClick={!disabled ? onClick : undefined}
        className="absolute top-full mt-2 flex flex-col items-center w-full h-auto"
      >
        {/* Triangle */}
        <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />

        {/* Tooltip-Bubble */}
        <div className="flex flex-col gap-1  bg-white rounded-lg shadow-md px-3 py-2 text-start w-full">
          <Typography
            variant="subtitle2"
            sx={{
              textAlign: "center",
              display: "-webkit-box",
              overflow: "hidden",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
            color={
              selected
                ? theme.palette.secondary.light
                : disabled
                ? theme.palette.text.disabled
                : theme.palette.text.primary
            }
          >
            {title}
          </Typography>
          <Divider />
          <div className="flex flex-row items-start justify-between mt-2">
            <Typography
              variant="body2"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "clip",
                color: !disabled
                  ? theme.palette.text.secondary
                  : theme.palette.text.disabled,
              }}
            >
              {anyContent
                ? `${dayjs(suggestedStartDate).format("D. MMM")} - ${dayjs(
                    suggestedEndDate
                  ).format("D. MMM")}`
                : "No assessments available yet."}
            </Typography>
            {anyContent && (
              <Chip
                sx={{
                  fontSize: "0.75rem",
                  height: "1.25rem",
                  maxWidth: "250px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  outline: "solid 1px",
                  outlineColor: done
                    ? theme.palette.grey[500]
                    : catchUp
                    ? "#E6B78C" // dark peach
                    : inFocus
                    ? "#2ca2b0" // blue
                    : upComing
                    ? theme.palette.grey[500]
                    : theme.palette.grey[300],
                  backgroundColor: "#FFFFFF",
                  color: done
                    ? theme.palette.text.secondary
                    : catchUp
                    ? "#BE5505" // ginger
                    : inFocus
                    ? "#007B8A" // blue
                    : upComing
                    ? theme.palette.text.secondary
                    : theme.palette.text.disabled,
                }}
                label={
                  done
                    ? "Done"
                    : catchUp
                    ? "Catch Up"
                    : inFocus
                    ? "In Focus"
                    : upComing
                    ? "Upcoming"
                    : disabled
                    ? "Locked"
                    : "Unknown"
                }
              />
            )}
          </div>
          {selected && (
            <div
              className="text-sm text-gray-500 line-clamp-4 mt-1"
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
