import { Box, Tooltip, Typography } from "@mui/material";

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
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          overflow: "visible",
          cursor: "pointer",
        }}
      >
        {achievements.map((a) => (
          <Tooltip
            onClick={() => {
              openAchievements(a);
            }}
            title={a.title}
            key={a.id}
          >
            <Box
              key={a.id}
              sx={{
                fontSize: 40, // Icon-Größe
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: a.achieved ? "pointer" : "default",
                opacity: a.achieved ? 1 : 0.3,
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: a.achieved ? "scale(1.1)" : "none",
                },
                position: "relative",
              }}
              onClick={() => a.achieved && openAchievements(a)}
            >
              {a.icon}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
