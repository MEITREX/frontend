"use client";

import { pagePrivateProfileStudentAchievementsQuery } from "@/__generated__/pagePrivateProfileStudentAchievementsQuery.graphql";
import { pageUserAchievementsQuery } from "@/__generated__/pageUserAchievementsQuery.graphql";
import AchievementList from "@/components/profile/AchievementList";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

const tabs = [
  { label: "General", path: "general" },
  { label: "Achievements", path: "achievements" },
  { label: "Forum", path: "forum" },
  { label: "Badges", path: "badges" },
];

export default function GeneralPageWrapper() {
  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = tabs.findIndex((tab) => pathname.includes(tab.path));

  const handleChange = (_: any, newValue: number) => {
    router.push(`/profile/${tabs[newValue].path}`);
  };

  const { currentUserInfo } =
    useLazyLoadQuery<pagePrivateProfileStudentAchievementsQuery>(
      graphql`
        query pagePrivateProfileStudentAchievementsQuery {
          currentUserInfo {
            id
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
    { id: currentUserInfo.id },
    {
      fetchPolicy: "network-only", // <-- wichtig!
    }
  );

  console.log(achievementsByUserId);

  const mutableAchievements = [...achievementsByUserId];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Hi, {currentUserInfo.userName}
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Welcome to your profile. Use the tabs to navigate.
      </Typography>

      <Tabs
        value={activeIndex}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3, ".MuiTabs-indicator": { display: "none" } }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.path}
            value={index}
            label={tab.label}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              color: "text.primary",
              borderRadius: "10px",
              border:
                index === activeIndex
                  ? "2px solid #00a9d6"
                  : "2px solid transparent",
              backgroundColor:
                index === activeIndex
                  ? "rgba(0, 169, 214, 0.1)"
                  : "transparent",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(0, 169, 214, 0.1)",
              },
            }}
          />
        ))}
      </Tabs>

      {/* Eigentliche Page-Inhalte */}
      <AchievementList
        achievements={mutableAchievements}
        profileTypeSortString={"not-achieved"}
      />
    </Box>
  );
}
