"use client";

import { pagePublicProfileStudentQuery } from "@/__generated__/pagePublicProfileStudentQuery.graphql";
import { achievementsData } from "@/components/profile/AchievementData";
import AchievementList from "@/components/profile/AchievementList";
import { Avatar, Box, Tab, Tabs, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

export default function PublicProfilePage() {
  const publicTabs = ["Achievements", "Forum", "Badges"];
  const [tabIndex, setTabIndex] = useState(0);

  const params = useParams();
  const userId = params?.userId as string;
  console.log("User ID aus URL:", userId);

  const profileData = {
    firstName: "Max",
    lastName: "Mustermann",
    email: "max.mustermann@example.com",
    nickname: "nickname",
  };

  const { findPublicUserInfos } =
    useLazyLoadQuery<pagePublicProfileStudentQuery>(
      graphql`
        query pagePublicProfileStudentQuery($id: [UUID!]!) {
          findPublicUserInfos(ids: $id) {
            userName
          }
        }
      `,
      { id: [userId] }
    );

  return (
    <Box sx={{ p: 4 }}>
      {/* Kopfbereich: Bild + Name */}
      <Box display="flex" alignItems="center" gap={3} mb={3}>
        <Avatar sx={{ width: 80, height: 80, fontSize: 32 }}>
          {findPublicUserInfos[0]?.userName}
        </Avatar>
        <Box>
          <Typography variant="h5">
            @{findPublicUserInfos[0]?.userName}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(e, newVal) => setTabIndex(newVal)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 3,
          ".MuiTabs-indicator": { display: "none" },
        }}
      >
        {publicTabs.map((tab, index) => (
          <Tab
            key={tab}
            value={index}
            label={tab}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "16px",
              px: 3,
              py: 1,
              border:
                tabIndex === index
                  ? "2px solid #00a9d6"
                  : "2px solid transparent",
              backgroundColor:
                tabIndex === index ? "rgba(0,169,214,0.1)" : "transparent",
              "&:hover": {
                backgroundColor: "rgba(0,169,214,0.1)",
              },
            }}
          />
        ))}
      </Tabs>

      {/* Tab-Inhalte */}
      <Box>
        {tabIndex === 0 && (
          <AchievementList
            achievements={achievementsData.filter((a) => a.achieved)}
            profileTypeSortString={"achieved"}
          />
        )}
      </Box>
    </Box>
  );
}
