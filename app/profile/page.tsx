"use client";

import AchievementList from "@/components/profile/AchievementList";
import { Box, TextField, Typography } from "@mui/material";
import { achievementsData } from "../../components/profile/AchievementData";

export default function ProfilePage() {
    // Beispiel-Daten – im echten Fall holst du die aus auth.user?.profile oder einem Query
    const profileData = {
        firstName: "Max",
        lastName: "Mustermann",
        email: "max.mustermann@example.com",
    };


    return (
        <>
            <Typography variant="h4" gutterBottom>
                My Profile
            </Typography>

            <AchievementList achievements={achievementsData} />

            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 3 }}>
                <TextField
                    label="First Name"
                    value={profileData.firstName}
                    InputProps={{ readOnly: true }}
                    fullWidth
                />
                <TextField
                    label="Last Name"
                    value={profileData.lastName}
                    InputProps={{ readOnly: true }}
                    fullWidth
                />
                <TextField
                    label="Email"
                    value={profileData.email}
                    InputProps={{ readOnly: true }}
                    fullWidth
                />
            </Box>

        </>

    );
}
