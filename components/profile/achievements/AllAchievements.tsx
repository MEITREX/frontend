import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import {
  Box,
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
  return (
    <Box
      sx={{
        border: "1px solid #ccc", // hellgrau
        borderRadius: 2, // leicht gerundete Ecken
        p: 2, // etwas Innenabstand
        mb: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          px: 2,
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

      <Grid container spacing={1}>
        {filteredAchievements.map((a) => (
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
}
