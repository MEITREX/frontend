import { Box, Button, Grid, Tooltip, Typography } from "@mui/material";
import Link from "next/link";

interface LatestAchievementsProps {
    openAchievements: (achievement: any) => void;
    achievements: any[];
}

export default function LatestAchievements({
    openAchievements,
    achievements,
}: LatestAchievementsProps) {

    const top4Achievements = achievements.slice(0, 4); // oder .filter(...) nach Wunsch

    function doHeadings(index: number) {
        if (index == 0) {
            return "You completed"
        } else if (index == 1) {
            return "You advanced"
        } else if (index == 2) {
            return "You just unlocked"
        } else {
            return "Don't forget"
        }

    }

    return (
        <Box
            sx={{
                border: "1px solid #ccc",
                borderRadius: 2,
                p: 2,
                mb: 4,
                maxWidth: 450,
                maxHeight: 400
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Achievements</Typography>
                <Link href="/profile" passHref>
                    <Button size="small" variant="outlined"
                        sx={{
                            backgroundColor: "#009bde",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "#3369ad",
                            },
                        }}>
                        All Achievements
                    </Button>
                </Link>
            </Box>
            <Grid container spacing={2}>
                {top4Achievements.map((a, index) => (
                    <Grid item xs={6} key={a.id}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        }}>
                            <Typography sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                                fontWeight={"bold"}>{doHeadings(index)}</Typography>
                            <Tooltip title={a.title}>
                                <Box
                                    onClick={() => openAchievements(a)}
                                    sx={{
                                        fontSize: 40,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "transform 0.3s ease",
                                        "&:hover": {
                                            transform: "scale(1.1)",
                                        },

                                    }}
                                >
                                    {a.icon}
                                </Box>
                            </Tooltip>
                        </Box>

                    </Grid>
                ))}
            </Grid>
        </Box>
    );


}
