"use client";

import { pagePrivateProfileStudentGeneralQuery } from "@/__generated__/pagePrivateProfileStudentGeneralQuery.graphql";
import { pagePrivateProfileStudentGeneral_GetUserXPQuery } from "@/__generated__/pagePrivateProfileStudentGeneral_GetUserXPQuery.graphql";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import GeneralPage from "../GeneralPage";
import OwnProfileCustomHeader from "@/components/profile/header/OwnProfileCustomHeader";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";
import { useAuth } from "react-oidc-context";

type UserLevelInfo = {
  level: number;
  requiredXP: number;
  exceedingXP: number; // XP gathered within current level
};

const getUserXPQuery = graphql`
  query pagePrivateProfileStudentGeneral_GetUserXPQuery($userID: ID!) {
    getUser(userID: $userID) {
      id
      xpValue
      requiredXP
      exceedingXP
      level
    }
  }
`;

export default function GeneralPageWrapper() {
  // TODO: Do this for every Route --> if this would be a layout component we would only need to do it once...
  const auth = useAuth();
  const displayGamification =
    auth.user?.profile.gamification_type === "gamification";

  const baseTabs = [
    { label: "General", path: "general" },
    { label: "Forum", path: "forum" },
  ];

  const gamificationTabs = [
    { label: "Achievements", path: "achievements" },
    { label: "Badges", path: "badges" },
    { label: "Leaderboards", path: "leaderboard" },
  ];

  const tabs = displayGamification
    ? [...baseTabs, ...gamificationTabs]
    : baseTabs;

  const router = useRouter();
  const pathname = usePathname();

  const activeIndex = tabs.findIndex((tab) => pathname.includes(tab.path));

  const handleChange = (_: any, newValue: number) => {
    router.push(`/profile/${tabs[newValue].path}`);
  };

  // 1) UserID stabil über Relay
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

  const xpData =
    useLazyLoadQuery<pagePrivateProfileStudentGeneral_GetUserXPQuery>(
      getUserXPQuery,
      { userID: currentUserInfo.id },
      { fetchPolicy: "network-only" }
    );

  const levelInfo = useMemo<UserLevelInfo>(() => {
    const payload: any = xpData?.getUser;
    const u = Array.isArray(payload) ? payload[0] : payload;
    return {
      level: Number(u?.level ?? 0),
      requiredXP: Math.max(1, Math.round(Number(u?.requiredXP ?? 1))),
      exceedingXP: Math.max(0, Math.round(Number(u?.exceedingXP ?? 0))),
    };
  }, [xpData]);

  const levelIconSrc = useMemo(() => {
    const lvl = Math.max(0, Math.min(99, levelInfo.level));
    return `/levels/level_${String(lvl)}.svg`;
  }, [levelInfo.level]);

  const progressPct = useMemo(() => {
    const required = Math.max(1, levelInfo.requiredXP);
    const have = Math.max(0, levelInfo.exceedingXP);
    return Math.max(0, Math.min(100, Math.round((have / required) * 100)));
  }, [levelInfo.requiredXP, levelInfo.exceedingXP]);

  return (
    <Box sx={{ p: 2 }}>
      <GamificationGuard>
        <OwnProfileCustomHeader displayName={currentUserInfo.nickname} />
      </GamificationGuard>

      {/* Level + XP overview */}
      <GamificationGuard>
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <img
              src={levelIconSrc}
              alt={`Level ${levelInfo.level}`}
              width={48}
              height={48}
              style={{ display: "block" }}
            />
            <Typography variant="body2" color="text.secondary">
              {`Level ${levelInfo.level} · ${Math.round(
                levelInfo.exceedingXP
              )} / ${Math.max(1, Math.round(levelInfo.requiredXP))} XP`}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{ height: 10, borderRadius: 999 }}
          />
        </Box>
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
