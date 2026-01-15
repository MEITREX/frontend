import { ChapterOverviewFragment$key } from "@/__generated__/ChapterOverviewFragment.graphql";
import { useTheme } from "@mui/material/styles";
import _ from "lodash";
import { useRef, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { ChapterOverviewItem } from "./ChapterOverviewItem";
import { StudentChapter } from "./StudentChapter";

const ChapterFragment = graphql`
  fragment ChapterOverviewFragment on Course {
    id
    chapters {
      elements {
        id
        startDate
        title
        number
        userProgress {
          progress
        }
        contents {
          id
        }
        ...ChapterOverviewItemFragment
        ...StudentChapterFragment
      }
    }
  }
`;

function generateSinePath(
  width: number,
  height: number,
  amplitude: number,
  waves: number,
  start: number,
  end: number,
  totalPoints: number
) {
  const centerY = height / 2;

  let path = "";
  for (let i = start; i <= end; i++) {
    const x = (i / totalPoints) * width;
    const radians = (i / totalPoints) * waves * 2 * Math.PI;
    const y = centerY + Math.sin(radians) * amplitude;
    path += i === start ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  return path;
}

export function ChapterOverview({
  _chapters,
}: {
  _chapters: ChapterOverviewFragment$key;
}) {
  const course = useFragment(ChapterFragment, _chapters);
  const sortedChapters = _.orderBy(course.chapters.elements, [
    (x) => new Date(x.startDate).getTime(),
    "number",
  ]);
  const numberOfChapters = sortedChapters.length;

  const firstIncompleteChapter = sortedChapters.findIndex(
    (chapter) => chapter.userProgress.progress < 100
  );
  const startIndex =
    firstIncompleteChapter < 0 ? numberOfChapters - 1 : firstIncompleteChapter;
  const [selectedIndex, setSelectedIndex] = useState<number>(startIndex);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (numberOfChapters === 0) {
    return (
      <div className="text-left text-gray-500">No chapters in this course.</div>
    );
  }

  const totalPoints = 200;

  const firstIncompleteIndex = sortedChapters.findIndex(
    (chapter) => chapter.userProgress.progress < 100
  );

  const completedRatio =
    firstIncompleteIndex < 0
      ? 1
      : firstIncompleteIndex / (numberOfChapters - 1);

  const completedPoints = Math.round(completedRatio * totalPoints);

  const height = 300;
  const amplitude = 50;
  const spacing = 270;
  const waves = Math.round(numberOfChapters / 4); // Number of sine waves
  const totalWidth = spacing * (numberOfChapters - 1);

  const points = Array.from({ length: numberOfChapters }, (_, i) => {
    const x = spacing * i;
    const radians = (i / (numberOfChapters - 1 || 1)) * 2 * waves * Math.PI;
    const y = height / 2 + Math.sin(radians) * amplitude;
    return { x, y };
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();
  const coloredPath = generateSinePath(
    totalWidth,
    height,
    amplitude,
    waves,
    0,
    completedPoints,
    totalPoints
  );
  const grayPath = generateSinePath(
    totalWidth,
    height,
    amplitude,
    waves,
    completedPoints,
    totalPoints,
    totalPoints
  );

  return (
    <div className="w-full">
      <div className="w-full overflow-y-hidden overflow-x-auto px-32 pb-36 mb-8">
        <div
          style={{
            position: "relative",
            height,
            minWidth: totalWidth,
            maxWidth: "max-content",
          }}
        >
          <svg
            width={totalWidth}
            height={height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          >
            <path
              d={grayPath}
              fill="none"
              stroke={theme.palette.grey[300]}
              strokeWidth={16}
            />
            <path
              d={coloredPath}
              fill="none"
              stroke={theme.palette.primary.light}
              strokeWidth={16}
            />
          </svg>

          {points.map(({ x, y }, i) => (
            <div
              key={i}
              ref={(el) => (itemRefs.current[i] = el)}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <ChapterOverviewItem
                _chapter={sortedChapters[i]}
                selected={i === selectedIndex}
                onClick={() => setSelectedIndex(i)}
                anyContent={sortedChapters[i].contents.length > 0}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="w-full">
        <StudentChapter
          key={sortedChapters[selectedIndex].id}
          _chapter={sortedChapters[selectedIndex]}
          standardExpand={true}
        />
      </div>
    </div>
  );
}
