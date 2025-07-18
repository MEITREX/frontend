import { Box, Grid, Typography } from "@mui/material";
import AchievementCard from "./AchievementCard";

interface LatestAchievementsProps {
  openAchievements: (achievement: any) => void;
  achievements: any[];
}

export default function LatestAchievements({
  openAchievements,
  achievements,
}: LatestAchievementsProps) {
  return (
    <Box
      sx={{
        border: "1px solid #ccc", // hellgrau
        borderRadius: 2, // leicht gerundete Ecken
        p: 2, // etwas Innenabstand
        mb: 4,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Latest Achievements
      </Typography>
      <Grid container spacing={2}>
        {achievements.map((a, index) => (
          <Grid item xs={6} key={index}>
            <AchievementCard
              achievement={a}
              onClick={() => openAchievements(a)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
