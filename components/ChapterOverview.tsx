import React, { useState, useEffect } from "react";
import { ChapterOverviewItem } from "./ChapterOverviewItem";

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

export function ChapterOverview({ anzahl }: { anzahl: number }) {
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

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
              progress={67}
              disabled={true}
              selected={i === selectedIndex}
              onClick={() => setSelectedIndex(i)}
              title={`Kapitel ${i + 1}`}
              description={`Beschreibung für Kapitel ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
