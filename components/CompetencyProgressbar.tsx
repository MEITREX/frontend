import { Box, useTheme } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { useEffect, useState } from "react";

export default function CompetencyProgressbar({
  competencyName,
  startProgress,
  endProgress,
  height,
  color,
  onClick,
  isSelected,
  disabled,
}: {
  competencyName: string;
  startProgress: number;
  endProgress: number;
  height: number;
  color: string;
  onClick?: () => void;
  isSelected: boolean;
  disabled?: boolean;
}) {
  const [progress, setProgress] = useState(startProgress);

  useEffect(() => {
    if (startProgress === endProgress) return;

    const steps = 60;
    const totalMs = 3000;
    const intervalMs = Math.floor(totalMs / steps);
    const increment = (endProgress - startProgress) / steps;

    let current = startProgress;
    setProgress(current);

    const timer = setInterval(() => {
      current = Math.min(endProgress, current + increment);
      setProgress(current);
      if (current >= endProgress) {
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [startProgress, endProgress]);

  const theme = useTheme();

  return (
    <Box
      onClick={!disabled ? onClick : undefined}
      sx={{
        width: "95%",
        p: 2,
        mb: 1,
        borderRadius: "14px",
        cursor: "pointer",
        outline: !disabled
          ? isSelected
            ? "4px solid" + color
            : "2px solid #E5E7EB"
          : "2px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 1,
          fontWeight: !disabled ? (isSelected ? 700 : 450) : 450,
          color: disabled
            ? theme.palette.text.disabled
            : theme.palette.text.primary,
        }}
      >
        {competencyName + " - " + Math.floor(progress) + "%"}
      </Box>
      {!disabled ? (
        "No progress possible yet."
      ) : (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: height,
            borderRadius: "20px",
            backgroundColor: "#E5E7EB",
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        />
      )}
    </Box>
  );
}
