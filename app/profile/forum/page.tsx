"use client";

import { pagePrivateProfileStudentForumQuery } from "@/__generated__/pagePrivateProfileStudentForumQuery.graphql";
import ProfileForumActivity from "@/components/profile/forum/ProfileForumActivity";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import XpOverview from "../xpoverview/XpOverview";
import { usePathname, useRouter } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import OwnProfileCustomHeader from "@/components/profile/header/OwnProfileCustomHeader";

const tabs = [
  { label: "General", path: "general" },
  { label: "Achievements", path: "achievements" },
  { label: "Forum", path: "forum" },
  { label: "Badges", path: "badges" },
  { label: "Leaderboards", path: "leaderboard" },
];

export default function ForumPage() {
  const router = useRouter();
  const pathname = usePathname();
  const section = (pathname.split("/profile/")[1] || "").split("/")[0];
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => section === tab.path)
  );

  const handleChange = (_: any, newValue: number) => {
    router.push(`/profile/${tabs[newValue].path}`);
  };

  const { currentUserInfo } =
    useLazyLoadQuery<pagePrivateProfileStudentForumQuery>(
      graphql`
        query pagePrivateProfileStudentForumQuery {
          currentUserInfo {
            id
            userName
            nickname
          }
        }
      `,
      {}
    );

  return (
    <Box sx={{ p: 2 }}>
      <OwnProfileCustomHeader displayName={currentUserInfo.nickname} />
      <XpOverview userId={currentUserInfo.id} />

      <Tabs
        value={activeIndex}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
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

      {/* Dummy content */}
      <ProfileForumActivity />
    </Box>
  );
}
