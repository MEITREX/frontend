"use client";

import AchievementList from "@/components/profile/AchievementList";
import { Avatar, Box, TextField, Typography } from "@mui/material";
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
        Hi, {profileData.firstName}
      </Typography>

      <Box display="flex" gap={4} py={4}>
        {/* Profilbild-Platzhalter */}
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: 40,
            }}
          >
            {/* Initialen oder Icon */}M
          </Avatar>
          <Box mt={1} color="text.secondary">
            Profile picture
          </Box>
        </Box>

        {/* Eingabefelder */}
        <Box flex={1} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="First Name"
            value={profileData.firstName}
            fullWidth
          />
          <TextField label="Last Name" value={profileData.lastName} fullWidth />
          <TextField label="Email" value={profileData.email} fullWidth />
        </Box>
      </Box>

      <AchievementList achievements={achievementsData} />
    </>
  );
}
