import { Box, Grid, Typography } from "@mui/material";
import AchievementCard from "./AchievementCard";
import { Achievement } from "./types";

interface LatestAchievementsProps {
  openAchievements: (achievement: Achievement) => void;
  achievements: Achievement[];
}

export default function LatestAchievements({
  openAchievements,
  achievements,
}: LatestAchievementsProps) {
  if (achievements.length === 0) {
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
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            p: 4,
            mb: 4,
            textAlign: "center",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            There are no achievements which can be displayed
          </Typography>
        </Box>
      </Box>
    );
  }

  return achievements.length > 0 ? (
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
  ) : null;
}
