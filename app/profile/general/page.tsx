"use client";

import { pagePrivateProfileStudentGeneralQuery } from "@/__generated__/pagePrivateProfileStudentGeneralQuery.graphql";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import GeneralPage from "../GeneralPage";

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
  // Dummy level data until backend provides currentUserLevelInfo
  const currentUserLevelInfo = {
    level: 3,
    xpInLevel: 240,
    xpRequired: 500,
  };

  const levelIconSrc =
    "/levels/level_" + String(currentUserLevelInfo.level ?? 0) + ".svg";

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Hi, {currentUserInfo.userName}
      </Typography>

      {/* Level + XP overview */}
      {currentUserLevelInfo && (
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <img
              src={levelIconSrc}
              alt={`Level ${currentUserLevelInfo.level}`}
              width={48}
              height={48}
              style={{ display: "block" }}
            />
            <Typography variant="body2" color="text.secondary">
              {currentUserLevelInfo.xpInLevel} /{" "}
              {currentUserLevelInfo.xpRequired} XP
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  (currentUserLevelInfo.xpInLevel /
                    Math.max(currentUserLevelInfo.xpRequired, 1)) *
                    100
                )
              )
            )}
            sx={{ height: 10, borderRadius: 999 }}
          />
        </Box>
      )}

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
      <GeneralPage studentData={currentUserInfo} />
    </Box>
  );
}
