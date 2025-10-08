"use client";

import { pagePrivateProfileStudentGeneralQuery } from "@/__generated__/pagePrivateProfileStudentGeneralQuery.graphql";
import { Box, Tab, Tabs } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import GeneralPage from "../GeneralPage";
import OwnProfileCustomHeader from "@/components/profile/header/OwnProfileCustomHeader";
import XpOverview from "../xpoverview/XpOverview";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";
import { useAuth } from "react-oidc-context";

export default function GeneralPageWrapper() {
  // TODO: Do this for every Route --> if this would be a layout component we would only need to do it once...
  const auth = useAuth();
  const isGamificationDisabled =
    auth.user?.profile?.gamification_type === "none";

  const baseTabs = [
    { label: "General", path: "general" },
    { label: "Forum", path: "forum" },
  ];

  const gamificationTabs = [
    { label: "Achievements", path: "achievements" },
    { label: "Badges", path: "badges" },
    { label: "Leaderboards", path: "leaderboard" },
  ];

  const tabs = isGamificationDisabled
    ? baseTabs
    : [...baseTabs, ...gamificationTabs];

  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = tabs.findIndex((tab) => pathname.includes(tab.path));

  const handleChange = (_: any, newValue: number) => {
    router.push(`/profile/${tabs[newValue].path}`);
  };

  const { currentUserInfo } =
    useLazyLoadQuery<pagePrivateProfileStudentGeneralQuery>(
      graphql`
        query pagePrivateProfileStudentGeneralQuery {
          currentUserInfo {
            id
            lastName
            firstName
            userName
            nickname
          }
        }
      `,
      {}
    );

  return (
    <Box sx={{ p: 2 }}>
      <GamificationGuard>
        <OwnProfileCustomHeader displayName={currentUserInfo.nickname} />
      </GamificationGuard>

      {/* XP Overview Component - ersetzt die inline XP-Anzeige */}
      <GamificationGuard>
        <XpOverview userId={currentUserInfo.id} />
      </GamificationGuard>

      <Tabs
        value={activeIndex}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mt: 3, mb: 3, ".MuiTabs-indicator": { display: "none" } }}
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
              "&:hover": { backgroundColor: "rgba(0, 169, 214, 0.1)" },
            }}
          />
        ))}
      </Tabs>

      {/* Actual page content */}
      <GeneralPage studentData={currentUserInfo} />
    </Box>
  );
}
