"use client";

import { pagePublicProfileStudentQuery } from "@/__generated__/pagePublicProfileStudentQuery.graphql";
import { pageUserAchievementsPublicQuery } from "@/__generated__/pageUserAchievementsPublicQuery.graphql";
import { SortProvider } from "@/app/contexts/SortContext";
import AchievementList from "@/components/profile/AchievementList";
import OtherUserProfileForumActivity from "@/components/profile/forum/OtherUserProfileForumActivity";
import ProfileInventorySection from "@/components/profile/items/ProfileInventorySection";
import { Avatar, Box, Tab, Tabs, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import UserProfileCustomHeader from "@/components/profile/header/UserProfileCustomHeader";
import { ForumApiUserInfoByIdQuery } from "@/__generated__/ForumApiUserInfoByIdQuery.graphql";
import { forumApiUserInfoByIdQuery } from "@/components/forum/api/ForumApi";

export default function PublicProfilePage() {
  const publicTabs = ["Achievements", "Forum", "Items"];
  const [tabIndex, setTabIndex] = useState(0);

  const params = useParams();
  const userId = params?.userId as string;

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

  const userInfos = useLazyLoadQuery<ForumApiUserInfoByIdQuery>(
    forumApiUserInfoByIdQuery,
    {
      id: userId,
    }
  );

  const { achievementsByUserId } =
    useLazyLoadQuery<pageUserAchievementsPublicQuery>(
      graphql`
        query pageUserAchievementsPublicQuery($id: UUID!) {
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
      { id: userId }
    );

  return (
    <Box sx={{ p: 4 }}>
      <UserProfileCustomHeader displayName={userInfos.findUserInfos[0]?.nickname as string}/>
      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(e, newVal) => setTabIndex(newVal)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mt: 3,
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
            achievements={achievementsByUserId.filter((a) => a.completed)}
            profileTypeSortString={"achieved"}
          />
        )}
        {tabIndex === 1 && <OtherUserProfileForumActivity />}
        {tabIndex === 2 && (
          <SortProvider>
            <ProfileInventorySection userId={userId} />
          </SortProvider>
        )}
      </Box>
    </Box>
  );
}
