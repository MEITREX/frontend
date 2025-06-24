import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import {
  Box,
  Card,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from "@mui/material";

interface AllAchievementsProps {
  courses: any[];
  filter: any;
  handleChange: (
    event: React.MouseEvent<HTMLElement>,
    newFilter: "achieved" | "not-achieved" | null
  ) => void;
  achievements: any[];
  selectedCourse: any;
  handleChangeCourse: (event: any, value: any) => void;
  filteredAchievements: any[];
  handleOpenAchievement: (a: any) => void;
}

export default function AllAchievements({
  courses,
  filter,
  handleChange,
  selectedCourse,
  handleChangeCourse,
  filteredAchievements,
  handleOpenAchievement,
  achievements,
}: AllAchievementsProps) {
  const groupedAchievements = filteredAchievements.reduce(
    (acc, achievement) => {
      const course = achievement.courseId || "Unknown Course";
      if (!acc[course]) {
        acc[course] = [];
      }
      acc[course].push(achievement);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const coursesNames = [
    { id: "course1", name: "Physics 202" },
    { id: "course2", name: "Informatik" },
    { id: "course3", name: "DSA" },
    { id: "course4", name: "PSE" },
    { id: "course5", name: "Theo I" },
    { id: "course6", name: "Mathe II" },
    { id: "course7", name: "MCI" },
    { id: "course8", name: "Mathe I" },
  ];

  return (
    <Box
      sx={{
        border: "1px solid #ccc", // hellgrau
        borderRadius: 2, // leicht gerundete Ecken
        p: 0, // etwas Innenabstand
        mb: 4,
        maxHeight: "800px", // maximale Höhe
        overflowY: "auto", // vertikales Scrollen bei Overflow
        paddingRight: 1, // optional: verhindert abgeschnittene Scrollbar
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          px: 2,
          position: "sticky",
          top: 0,
          backgroundColor: "white", // wichtig, sonst ist es transparent
          zIndex: 1, // über Scroll-Content
          p: 2,
          borderBottom: "1px solid #eee",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          All Achievements
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Filter: Achieved / Not Achieved */}
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleChange}
            sx={{ mb: 2 }}
            size="small"
          >
            <ToggleButton
              value="achieved"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#009bde", // dein Blauton
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#009bde",
                  },
                },
              }}
            >
              <EmojiEventsIcon sx={{ mr: 1 }} />
              Achieved
            </ToggleButton>
            <ToggleButton
              value="not-achieved"
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#009bde", // dein Blauton
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#009bde",
                  },
                },
              }}
            >
              <EmojiEventsOutlinedIcon sx={{ mr: 1 }} />
              Not Achieved
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box mt={0} mb={4}>
        <Tabs
          value={selectedCourse}
          onChange={handleChangeCourse}
          variant="scrollable"
          scrollButtons="auto"
        >
          {courses.map((courseId) => {
            const course = coursesNames.find(c => c.id === courseId);
            return (
              <Tab
                key={courseId}
                value={courseId}
                label={course ? course.name : courseId}
              />
            );
          })}
        </Tabs>
      </Box>

      {Object.entries(groupedAchievements).map(
        ([course, courseAchievements]: any) => {
          const sortedAchievements = courseAchievements.sort((a: any, b: any) => {
            const dateA = a.achieved ? new Date(a.achievedAt).getTime() : null;
            const dateB = b.achieved ? new Date(b.achievedAt).getTime() : null;

            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return 1; // a ist "schlechter", kommt später
            if (dateB === null) return -1; // b ist "schlechter", kommt später

            return dateB - dateA; // neuestes zuerst
          });

          const visibleAchievements = sortedAchievements.slice(0, 11);
          const hasMore = sortedAchievements.length > 11;

          console.log(filter, selectedCourse, course);

          return (
            <Box sx={{ px: 2, pt: 2, mb: 2 }}>
              <Grid
                container
                spacing={2}
                sx={{
                  marginLeft: 0,
                  marginRight: 0,
                  width: '100%',
                  paddingLeft: 0
                }}
              >

                {sortedAchievements.map((a: any, index: any) => {
                  const isCountable = a.targetCount !== undefined && a.currentCount !== undefined;
                  const showProgress = isCountable && !a.achieved;
                  const progressValue = isCountable
                    ? Math.min((a.currentCount / a.targetCount) * 100, 100)
                    : 0;

                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      key={a.id}
                      onClick={() => handleOpenAchievement(a)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Card variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item>
                            <Box
                              fontSize="2.5rem"
                              sx={{ opacity: a.achieved ? 1 : 0.4 }}
                            >
                              {a.icon}
                            </Box>
                          </Grid>
                          <Grid item xs>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {a.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {a.description}
                            </Typography>

                            {/* Fortschrittsbalken einfügen */}
                            {showProgress && (
                              <Box mt={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={progressValue}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {a.currentCount}/{a.targetCount}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  );
                })}

              </Grid>
            </Box>

          );
        }
      )}
    </Box>
  );
}
