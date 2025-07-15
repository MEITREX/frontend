import { Box, Card, Grid, LinearProgress, Typography } from "@mui/material";

interface AchievementProps {
  achievement: any;
  showProgress?: boolean;
  onClick?: () => void;
}

export default function AchievementCard({
  achievement,
  showProgress = false,
  onClick,
}: AchievementProps) {
  const progressValue =
    achievement.targetCount > 0
      ? Math.min(
          (achievement.currentCount / achievement.targetCount) * 100,
          100
        )
      : 0;

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
            sx={{ opacity: achievement.achieved ? 1 : 0.4 }}
          >
            {achievement.icon}
          </Box>
        </Grid>
        <Grid item xs>
          <Typography variant="subtitle1" fontWeight="bold">
            {achievement.title}
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
                {achievement.currentCount}/{achievement.targetCount}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}
