import AchievementParser from "@/components/AchievementParser";
import { Box, Card, LinearProgress, Typography } from "@mui/material";
import AchievementImage from "./AchievementImage";
import { Achievement } from "./types";

interface AchievementProps {
  achievement: Achievement;
  showProgress?: boolean;
  onClick?: () => void;
  compact?: boolean; // <- neu
}

export default function AchievementCard({
  achievement,
  showProgress = false,
  onClick,
  compact,
}: AchievementProps) {
  let progressValue = 0;

  if (achievement.requiredCount) {
    progressValue =
      achievement.requiredCount! > 0
        ? Math.min(
            (achievement.completedCount! / achievement.requiredCount!) * 100,
            100
          )
        : 0;
  }

  return (
    <Card
      variant="outlined"
      sx={{
        p: compact ? 1 : 2,
        cursor: onClick ? "pointer" : "default",
        height: compact ? 67 : "auto",
        display: "flex",
        alignItems: "center",
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flexShrink: 0, mr: compact ? 1 : 2 }}>
          <AchievementImage
            src={
              AchievementParser(achievement ? achievement.name : "none") ??
              undefined
            }
            alt={achievement.name}
            completed={achievement.completed}
            size={compact ? 40 : 60}
          />
        </Box>

        <Box sx={{ overflow: "hidden", minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            noWrap={compact}
            sx={{
              fontSize: compact ? "0.8rem" : "1rem",
              whiteSpace: compact ? "nowrap" : "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {achievement.name}
          </Typography>

          {!compact && (
            <Typography variant="body2" color="text.secondary">
              {achievement.description}
            </Typography>
          )}

          {showProgress && (
            <Box mt={1}>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{
                  height: compact ? 4 : 6,
                  borderRadius: 4,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: compact ? "0.65rem" : "0.75rem" }}
              >
                {achievement.completedCount}/{achievement.requiredCount}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}
