import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
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
  setSelectedCourse: (value: any) => void;
  filteredAchievements: any[];
  handleOpenAchievement: (a: any) => void;
}

export default function AllAchievements({
  courses,
  filter,
  handleChange,
  selectedCourse,
  setSelectedCourse,
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

          {/* Dropdown für Kurse */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="course-select-label">Course</InputLabel>
            <Select
              labelId="course-select-label"
              value={selectedCourse}
              label="Course"
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {Object.entries(groupedAchievements).map(
        ([course, courseAchievements]: any) => {
          const sortedAchievements = courseAchievements.sort((a: any, b: any) => {
            const dateA = a.achievedAt ? new Date(a.achievedAt).getTime() : null;
            const dateB = b.achievedAt ? new Date(b.achievedAt).getTime() : null;

            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return 1; // a ist "schlechter", kommt später
            if (dateB === null) return -1; // b ist "schlechter", kommt später

            return dateB - dateA; // neuestes zuerst
          });

          const visibleAchievements = sortedAchievements.slice(0, 11);
          const hasMore = sortedAchievements.length > 11;

          console.log(filter, selectedCourse, course);

          if (selectedCourse != "all" && selectedCourse == course) {
            console.log("HIIIIIIIIIIIIIIIIIIIs");
            return (
              <Box key={course} mb={4} px={2}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  {courses.find((c) => c.id === course)?.name ?? course}
                </Typography>
                <Grid container spacing={1}>
                  {sortedAchievements.map((a: any) => (
                    <Grid item xs={2} key={a.id}>
                      {" "}
                      {/* 6 Elemente pro Zeile */}
                      <Tooltip title={a.title} arrow>
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
                          onClick={() => handleOpenAchievement(a)}
                        >
                          {a.icon}
                        </Box>
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          } else {
            return (
              <Box key={course} mb={4} px={2}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  {courses.find((c) => c.id === course)?.name ?? course}
                </Typography>
                <Grid container spacing={1}>
                  {visibleAchievements.map((a: any) => (
                    <Grid item xs={2} key={a.id}>
                      {" "}
                      {/* 6 Elemente pro Zeile */}
                      <Tooltip title={a.title} arrow>
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
                          onClick={() => handleOpenAchievement(a)}
                        >
                          {a.icon}
                        </Box>
                      </Tooltip>
                    </Grid>
                  ))}
                  {hasMore && (
                    <Grid item xs={2}>
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ minWidth: 100 }}
                          onClick={() => setSelectedCourse(course)}
                        >
                          Show all
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            );
          }
        }
      )}
    </Box>
  );
}
