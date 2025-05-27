import React, { useState, useEffect } from "react";
import { ChapterOverviewItem } from "./ChapterOverviewItem";
import { graphql, useFragment } from "react-relay";
import { ChapterOverviewFragment$key } from "@/__generated__/ChapterOverviewFragment.graphql";
import _ from "lodash";
import { StudentChapter } from "./StudentChapter";

const ChapterFragment = graphql`
  fragment ChapterOverviewFragment on ChapterPayload {
    elements {
      id
      startDate
      title
      number
      ...ChapterOverviewItemFragment
      ...StudentChapterFragment
    }
  }
`;

function generateSinePath(
  width: number,
  height: number,
  amplitude: number,
  waves: number
) {
  const points = 200;
  const centerY = height / 2;

  let path = "";
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const radians = (i / points) * waves * 2 * Math.PI;
    const y = centerY + Math.sin(radians) * amplitude;
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }

  return path;
}

export function ChapterOverview({
  _chapters,
}: {
  _chapters: ChapterOverviewFragment$key;
}) {
  const chapters = useFragment(ChapterFragment, _chapters);
  const sortedChapters = _.orderBy(chapters.elements, [
    (x) => new Date(x.startDate).getTime(),
    "number",
  ]);
  const anzahl = sortedChapters.length;

  const height = 300;
  const amplitude = 50;
  const spacing = 160;
  const waves = 2; // Number of sine waves
  const totalWidth = spacing * (anzahl - 1);

  const points = Array.from({ length: anzahl }, (_, i) => {
    const x = spacing * i;
    const radians = (i / (anzahl - 1 || 1)) * 2 * waves * Math.PI;
    const y = height / 2 + Math.sin(radians) * amplitude;
    return { x, y };
  });

  const sinePath = generateSinePath(totalWidth, height, amplitude, waves);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <div className="w-full overflow-y-hidden border border-slate-200s border-4 rounded-3xl px-24 pb-10 mb-8">
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
          <path d={sinePath} fill="none" stroke="#E4E4E4" strokeWidth={16} />
        </svg>

        {points.map(({ x, y }, i) => (
          <div
            key={i}
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
            />
          </div>
        ))}
      </div>
      <div>
        <StudentChapter key={sortedChapters[selectedIndex].id} _chapter={sortedChapters[selectedIndex]} standardExpand={true}/>
      </div>
    </div>
  );
}
