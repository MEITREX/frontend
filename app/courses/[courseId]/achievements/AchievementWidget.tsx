import { Achievement } from "@/components/profile/achievements/types";
import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import Link from "next/link";

interface LatestAchievementsProps {
  openAchievements: (achievement: Achievement) => void;
  achievements: Achievement[];
  course: string
}

export default function LatestAchievements({
  openAchievements,
  achievements,
  course
}: LatestAchievementsProps) {
  const top4Achievements = achievements.slice(0, 4); // oder .filter(...) nach Wunsch

  function doHeadings(index: number) {
    if (index == 0) {
      return "You completed";
    } else if (index == 1) {
      return "You advanced";
    } else if (index == 2) {
      return "You just unlocked";
    } else {
      return "Don't forget";
    }
  }

  function getFilteredAchievements(achievements: Achievement[], courseId: string) {

    console.log(achievements, 'ach')
    const courseAchievements = achievements.filter(
      (a) => a.courseId === courseId
    );

    console.log(courseAchievements, 'ach1')

    const completed = courseAchievements
      .filter((a) => a.trackingEndTime)
      .sort(
        (a, b) =>
          new Date(b.trackingEndTime!).getTime() - new Date(a.trackingEndTime!).getTime()
      );

    const usedIds = new Set<string>();
    const lastCompleted = completed[0] || null;
    if (lastCompleted) usedIds.add(lastCompleted.id!);

    const unlockedButNotCompleted = courseAchievements
      .filter((a: Achievement) => a.trackingStartTime && !a.trackingEndTime && !usedIds.has(a.id!))
      .sort(
        (a, b) =>
          new Date(b.trackingStartTime!).getTime() - new Date(a.trackingStartTime!).getTime()
      );

    const lastUnlocked = unlockedButNotCompleted[0] || null;
    if (lastUnlocked) usedIds.add(lastUnlocked.id!);

    const firstUnlockedPending =
      unlockedButNotCompleted
        .slice()
        .reverse()
        .find((a) => !usedIds.has(a.id!)) || null;
    if (firstUnlockedPending) usedIds.add(firstUnlockedPending.id!);

    const notCompleted = courseAchievements.filter(
      (a) => !a.completed && !usedIds.has(a.id!)
    );
    const randomNotCompleted =
      notCompleted.length > 0
        ? notCompleted[Math.floor(Math.random() * notCompleted.length)]
        : null;
    if (randomNotCompleted) usedIds.add(randomNotCompleted.id!);

    // Rückgabe: Nur Achievements, die existieren

    console.log(lastCompleted, lastUnlocked, randomNotCompleted, firstUnlockedPending)

    return [
      lastCompleted && {
        key: "lastCompleted",
        title: "Last completed",
        achievement: lastCompleted,
      },
      randomNotCompleted && {
        key: "randomNotCompleted",
        title: "Random uncompleted",
        achievement: randomNotCompleted,
      },
      lastUnlocked && {
        key: "lastUnlocked",
        title: "Last unlocked",
        achievement: lastUnlocked,
      },
      firstUnlockedPending && {
        key: "firstUnlockedPending",
        title: "Longest unlocked",
        achievement: firstUnlockedPending,
      },
    ].filter(Boolean); // entfernt alle null-Einträge
  }

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 2,
        p: 2,
        mb: 4,
        maxWidth: 450,
        maxHeight: 400,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Achievements</Typography>
        <Link href="/profile" passHref>
          <Button
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: "#009bde",
              color: "white",
              "&:hover": {
                backgroundColor: "#3369ad",
              },
            }}
          >
            Profile
          </Button>
        </Link>
      </Box>
      <Grid container spacing={2}>
        {getFilteredAchievements(achievements, course).map((a, index) => (
          <Grid item xs={6} key={a!.key}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <Typography
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                fontWeight={"bold"}
              >
                {a?.title}
              </Typography>
              <Tooltip title={a!.achievement.name}>
                <Box
                  onClick={() => openAchievements(a!.achievement)}
                  sx={{
                    fontSize: 40,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {a!.achievement.imageUrl}
                </Box>
              </Tooltip>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
