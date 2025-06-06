import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Tooltip,
    Typography
} from "@mui/material";
import { useState } from "react";

const AchievementList = ({ achievements }) => {

    const achieved = achievements
        .filter((a) => a.achieved)
        .sort((a, b) => b.achievedAt?.getTime()! - a.achievedAt?.getTime()!) // neueste zuerst
        .slice(0, 5); // z.B. 5 letzte

    const [selectedCourse, setSelectedCourse] = useState('all');

    const courses = [
        { id: 'all', name: 'All' },
        { id: 'course1', name: 'Physics 202' },
        { id: 'course2', name: 'Informatik' },
    ];

    const [selectedStatus, setSelectedStatus] = useState('achieved');

    const states = [
        { id: 'achieved', name: 'Achieved' },
        { id: 'notAchieved', name: 'Not achieved' },
        { id: 'all', name: 'All' },
    ];

    const filteredAchievements = achievements
        .filter(a => selectedCourse === 'all' || a.courseId === selectedCourse)
        .filter(a => {
            if (selectedStatus === 'achieved') return a.achieved;
            if (selectedStatus === 'notAchieved') return !a.achieved;
            return true;
        });

    const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);
    const [openAchievementDialog, setOpenDialog] = useState(false);

    const handleOpenAchievement = (achievement: any) => {
        setSelectedAchievement(achievement);
        setOpenDialog(true);
    };

    const handleCloseAchievement = () => {
        setOpenDialog(false);
    };

    return (
        <>
            <Box>
                <Box sx={{
                    border: '1px solid #ccc',  // hellgrau
                    borderRadius: 2,               // leicht gerundete Ecken
                    p: 2,                          // etwas Innenabstand
                    mb: 4,

                }}>
                    <Typography variant="h6" gutterBottom>
                        Latest Achievements
                    </Typography>
                    <Box sx={{
                        display: "flex",
                        gap: 2,
                        overflowX: "auto",
                        overflow: 'visible',
                        cursor: 'pointer'
                    }}>
                        {achieved.map((a) => (
                            <Tooltip onClick={() => { handleOpenAchievement(a) }} title={a.title} key={a.id}>
                                <Box
                                    key={a.id}
                                    sx={{
                                        fontSize: 40, // Icon-Größe
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: a.achieved ? 'pointer' : 'default',
                                        opacity: a.achieved ? 1 : 0.3,
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: a.achieved ? 'scale(1.1)' : 'none',
                                        },
                                        position: 'relative',
                                    }}
                                    onClick={() => a.achieved && handleOpenAchievement(a)}
                                >
                                    {a.icon}
                                </Box>
                            </Tooltip>
                        ))}
                    </Box>
                </Box>

                <Box
                    sx={{
                        border: '1px solid #ccc',  // hellgrau
                        borderRadius: 2,               // leicht gerundete Ecken
                        p: 2,                          // etwas Innenabstand
                        mb: 4,

                    }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            px: 2,
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold">
                            All Achievements
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Filter: Achieved / Not Achieved */}
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel id="status-select-label">Status</InputLabel>
                                <Select
                                    labelId="status-select-label"
                                    value={selectedStatus}
                                    label="Status"
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    {states.map((state) => (
                                        <MenuItem key={state.id} value={state.id}>
                                            {state.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

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


                    <Grid container spacing={1} >
                        {filteredAchievements.map((a) => (
                            <Grid item xs={2} key={a.id}> {/* 6 Elemente pro Zeile */}
                                <Tooltip title={a.title} arrow>
                                    <Box
                                        key={a.id}
                                        sx={{
                                            fontSize: 40, // Icon-Größe
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: a.achieved ? 'pointer' : 'default',
                                            opacity: a.achieved ? 1 : 0.3,
                                            transition: 'transform 0.3s ease',
                                            '&:hover': {
                                                transform: a.achieved ? 'scale(1.1)' : 'none',
                                            },
                                            position: 'relative',
                                        }}
                                        onClick={() => a.achieved && handleOpenAchievement(a)}
                                    >
                                        {a.icon}
                                    </Box>
                                </Tooltip>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

            </Box>

            <Dialog open={openAchievementDialog} onClose={handleCloseAchievement} maxWidth="sm" fullWidth>
                <DialogTitle textAlign="center">
                    {selectedAchievement?.title}
                </DialogTitle>

                <DialogContent>
                    <Box textAlign="center" py={3}>
                        <Box fontSize={60}>{selectedAchievement?.icon}</Box>

                        <Typography mt={2} variant="body1">
                            {selectedAchievement?.description}
                        </Typography>

                        <Typography mt={2} color="textSecondary">
                            <strong>Completed:</strong>{' '}
                            {selectedAchievement?.achievedAt
                                ? new Date(selectedAchievement.achievedAt).toLocaleString()
                                : 'Not yet completed'}
                        </Typography>

                        <Typography mt={1} color="textSecondary">
                            <strong>Course:</strong> {selectedAchievement?.courseId}
                        </Typography>
                    </Box>

                    <Box display="flex" justifyContent="center" mt={2}>
                        <Button onClick={handleCloseAchievement} variant="contained">
                            Close
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

        </>
    );
};

export default AchievementList;
