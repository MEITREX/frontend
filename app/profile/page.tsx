"use client";

import AchievementList from "@/components/profile/AchievementList";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { achievementsData } from "../../components/profile/AchievementData";
import GeneralPage from "./GeneralPage";

export default function ProfilePage() {
  // Beispiel-Daten – im echten Fall holst du die aus auth.user?.profile oder einem Query
  const profileData = {
    firstName: "Max",
    lastName: "Mustermann",
    email: "max.mustermann@example.com",
    nickname: "nickname",
  };

  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_: any, newValue: number) => {
    setTabIndex(newValue);
  };

  const tabs = ["General", "Achievements", "Forum", "Progress", "Badges"];

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Hi, {profileData.firstName}
        </Typography>
        {/* Tabs oben */}
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            mb: 3,
            ".MuiTabs-indicator": {
              display: "none", // Unterstrich ausblenden
            },
          }}
        >
          {tabs.map((tab, index) => {
            return (
              <Tab
                key={tab}
                value={index}
                label={tab}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  color: "text.primary",
                  px: 2,
                  py: 1,
                  borderRadius: "10px",
                  border:
                    tabs.indexOf(tab) === tabIndex
                      ? "2px solid #00a9d6"
                      : "2px solid transparent",
                  backgroundColor:
                    tabs.indexOf(tab) === tabIndex
                      ? "rgba(0, 169, 214, 0.1)"
                      : "transparent",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(0, 169, 214, 0.1)",
                  },
                }}
              />
            );
          })}
        </Tabs>

        {/* Inhalt abhängig vom Tab */}
        {tabIndex === 0 && <GeneralPage studentData={profileData} />}
        {tabIndex === 1 && (
          <AchievementList
            achievements={achievementsData}
            profileTypeSortString={"not-achieved"}
          />
        )}
      </Box>
    </>
  );
}
