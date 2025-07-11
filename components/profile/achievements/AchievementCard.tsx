import { Box, Card, Grid, LinearProgress, Typography } from "@mui/material";
import { Achievement } from "./types";

interface AchievementProps {
  achievement: Achievement;
  showProgress?: boolean;
  onClick?: () => void;
}

export default function AchievementCard({
  achievement,
  showProgress = false,
  onClick,
}: AchievementProps) {

  let progressValue = 0
  console.log(achievement.imageUrl)

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
      sx={{ p: 2, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box
            fontSize="2.5rem"
            sx={{ opacity: achievement.completed ? 1 : 0.4 }}
          >
            {achievement.imageUrl}
          </Box>
        </Grid>
        <Grid item xs>
          <Typography variant="subtitle1" fontWeight="bold">
            {achievement.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {achievement.description}
          </Typography>

          {showProgress && (
            <Box mt={1}>
              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {achievement.completedCount}/{achievement.requiredCount}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}
