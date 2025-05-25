import React, { useState } from "react";
import { DoneRounded, LockOutlined } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";

export function ChapterOverviewItem({
  progress,
  disabled,
  initiallySelected,
  title,
  description,
}: {
  progress: number;
  disabled: boolean;
  initiallySelected: boolean;
  title: string;
  description: string;
}): JSX.Element {
  const [selected, setSelected] = useState(initiallySelected);

  const handleClick = () => {
    if (disabled) return;
    setSelected((prev) => !prev);
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-100 h-auto">
      <div
        onClick={() => handleClick()}
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
              style={{ color: "#84BFE6" }}
            />
          ))}
      </div>
      <div
        onClick={() => handleClick()}
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
          {selected && (
            <div className="text-sm text-gray-500">{description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
