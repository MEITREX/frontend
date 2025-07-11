"use client";

import { pagePrivateProfileStudentQuery } from "@/__generated__/pagePrivateProfileStudentQuery.graphql";
import { pageUserAchievementsQuery } from "@/__generated__/pageUserAchievementsQuery.graphql";
import AchievementList from "@/components/profile/AchievementList";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import GeneralPage from "./GeneralPage";

export default function ProfilePage() {
  // Beispiel-Daten – im echten Fall holst du die aus auth.user?.profile oder einem Query
  const profileData = {
    firstName: "Max",
    lastName: "Mustermann",
    email: "max.mustermann@example.com",
    nickname: "nickname",
  };

  const { currentUserInfo } = useLazyLoadQuery<pagePrivateProfileStudentQuery>(
    graphql`
      query pagePrivateProfileStudentQuery {
        currentUserInfo {
          id
          lastName
          firstName
          userName
        }
      }
    `,
    {}
  );

  const { achievementsByUserId } = useLazyLoadQuery<pageUserAchievementsQuery>(
    graphql`
      query pageUserAchievementsQuery($id: UUID!) {
        achievementsByUserId(userId: $id) {
          id
          name
          imageUrl
          description
          courseId
          userId
          completed
          requiredCount
          completedCount
          trackingStartTime
          trackingEndTime
        }
      }
    `,
    { id: currentUserInfo.id }
  );

  console.log(achievementsByUserId)

  const mutableAchievements = [...achievementsByUserId]

  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_: any, newValue: number) => {
    setTabIndex(newValue);
  };

  const tabs = ["General", "Achievements", "Forum", "Badges"];

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Hi, {currentUserInfo.firstName}
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
            console.log(currentUserInfo);
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
        {tabIndex === 0 && <GeneralPage studentData={currentUserInfo} />}
        {tabIndex === 1 && (
          <AchievementList
            achievements={mutableAchievements}
            profileTypeSortString={"not-achieved"}
          />
        )}
      </Box>
    </>
  );
}
