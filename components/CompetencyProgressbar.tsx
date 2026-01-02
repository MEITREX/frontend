import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box, LinearProgress, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

export default function CompetencyProgressbar({
  competencyName,
  startProgress,
  endProgress,
  averageProgress,
  height,
  color,
  onClick,
  isSelected = false,
  isDisabled = false,
  isUrgent = false,
}: {
  competencyName: string;
  startProgress: number;
  endProgress: number;
  averageProgress?: number;
  height: number;
  color: string;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  isUrgent?: boolean;
}) {
  const [progress, setProgress] = useState(startProgress);
  const [showBar, setShowBar] = useState(startProgress !== 100);
  const [isMoving, setMoving] = useState(startProgress !== endProgress);

  useEffect(() => {
    setProgress(endProgress);
    if (startProgress !== endProgress && endProgress - startProgress > 1) {
      setMoving(true);
      setShowBar(true);
    } else {
      setMoving(false);
      setShowBar(endProgress !== 100);
    }
  }, [startProgress, endProgress]);

  const theme = useTheme();

  return (
    <Box
      onClick={!isDisabled ? onClick : undefined}
      sx={{
        width: "95%",
        p: 2,
        mb: 1,
        borderRadius: "14px",
        cursor: "pointer",
        outline: isSelected ? `4px solid ${color}` : "2px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
        boxShadow: isUrgent ? "0 0 15px rgba(211, 47, 47, 0.7)" : "none",
        animation: isUrgent ? "pulse-red 2s infinite" : "none",
        "@keyframes pulse-red": {
          "0%": {
            boxShadow: "0 0 0px 0px rgba(211, 47, 47, 0.7)",
          },
          "70%": {
            boxShadow: "0 0 0px 10px rgba(211, 47, 47, 0)",
          },
          "100%": {
            boxShadow: "0 0 0px 20px rgba(211, 47, 47, 0)",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: 1,
          fontWeight: !isDisabled ? (isSelected ? 700 : 450) : 450,
          color: isDisabled
            ? theme.palette.text.disabled
            : theme.palette.text.primary,
        }}
      >
        <span>
          {competencyName} {!isDisabled && "-"}
        </span>

        {isMoving && <span>{`${startProgress}% →`}</span>}

        {!isDisabled && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, transition: "margin-left 0.5s ease",}}>
            <span>{endProgress}%</span>
            {!showBar && (
              <EmojiEventsIcon fontSize="large" sx={{ color: "#F59E0B" }} />
            )}
          </Box>
        )}
      </Box>

      {isDisabled ? (
        <Typography color={theme.palette.text.disabled}>
          No progress possible yet.
        </Typography>
      ) : (
        showBar && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: height,
              borderRadius: "20px",
              backgroundColor: "#E5E7EB",
              "& .MuiLinearProgress-bar": {
                backgroundColor: color,
                transition: "transform 2s ease-out",
              },
              border: isMoving ? "2px solid" : "none",
              borderColor: "gold",
            }}
            onTransitionEnd={(e) => {
              if (
                e.propertyName === "transform" &&
                (e.target as HTMLElement).classList.contains(
                  "MuiLinearProgress-bar"
                )
              ) {
                setMoving(false);
                if (endProgress === 100) {
                  setShowBar(false);
                }
              }
            }}
          />
        )
      )}
    </Box>
  );
}
