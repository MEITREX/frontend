import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  Box,
  LinearProgress,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

export default function CompetencyProgressbar({
  competencyName,
  startProgress,
  endProgress,
  averageProgress = 0,
  small = false,
  color,
  onClick,
  isSelected = false,
  isDisabled = false,
  isUrgent = false,
  showAverageProgress = false,
  participantCount,
  courseMemberCount,
  openTaskCount,
}: {
  competencyName: string;
  startProgress: number;
  endProgress: number;
  averageProgress?: number;
  small?: boolean;
  color: string;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  isUrgent?: boolean;
  showAverageProgress?: boolean;
  participantCount: number;
  courseMemberCount: number;
  openTaskCount: number;
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
      onClick={onClick}
      sx={{
        transformOrigin: "left center",
        transform: !small && !isSelected ? "scale(0.95)" : "scale(1)",
        transition: "transform 0.5s ease",
        opacity: !isDisabled ? 1 : 0.5,
        width: "95%",
        p: !small ? 2 : 1.5,
        mb: 1,
        borderRadius: "14px",
        cursor: "pointer",
        outline: !small
          ? isSelected
            ? `4px solid ${color}`
            : "2px solid #E5E7EB"
          : isSelected
          ? `3px solid ${color}`
          : "2px solid #E5E7EB",
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
        position: "relative",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 8,
          right: 12,
          fontSize: !small ? 11 : 10,
          color: theme.palette.text.secondary,
          fontWeight: 500,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <b>{openTaskCount} open Tasks</b>
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: 1,
          fontWeight: !small
            ? isSelected
              ? 700
              : 450
            : isSelected
            ? 650
            : 450,
          fontSize: !small ? 16 : 14,
          color: theme.palette.text.primary,
        }}
      >
        <span>
          {competencyName} {!isDisabled && "-"}
        </span>

        {isMoving && <span>{`${startProgress}% →`}</span>}

        {!isDisabled && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "margin-left 0.5s ease",
            }}
          >
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
          <Box sx={{ position: "relative", width: "100%" }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: !small ? 15 : 12,
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

            {showAverageProgress && (
              <Tooltip
                arrow
                placement="top"
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2">
                      Average Progress: <b>{averageProgress} %</b>
                    </Typography>
                    <Typography variant="caption">
                      <b>
                        {participantCount} / {courseMemberCount} students
                        started working on this.
                      </b>
                    </Typography>
                  </Box>
                }
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: `${averageProgress}%`,
                    top: !small ? "-12px" : "-14px",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <GroupsIcon sx={{ fontSize: !small ? 36 : 34 }} />
                </Box>
              </Tooltip>
            )}
          </Box>
        )
      )}
    </Box>
  );
}
