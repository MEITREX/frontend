"use client";

import { pagePrivateProfileLeaderboardsQuery } from "@/__generated__/pagePrivateProfileLeaderboardsQuery.graphql";
import type { pageLeaderboardDataQuery as PageLeaderboardDataQuery } from "@/__generated__/pageLeaderboardDataQuery.graphql";
import ProfileLeaderboardPositions from "@/app/profile/leaderboard/ProfileLeaderboardPositions";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import OwnProfileCustomHeader from "@/components/profile/header/OwnProfileCustomHeader";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";
import XpOverview from "../xpoverview/XpOverview";

const tabs = [
  { label: "General", path: "general" },
  { label: "Forum", path: "forum" },
  { label: "Achievements", path: "achievements" },
  { label: "Leaderboards", path: "leaderboard" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const activeIndex = tabs.findIndex((tab) => pathname.includes(tab.path));

  const handleChange = (_: any, newValue: number) => {
    router.push(`/profile/${tabs[newValue].path}`);
  };

  // 1) Load current user incl. memberships so we can pick a courseID for the LB query
  const { currentUserInfo } =
    useLazyLoadQuery<pagePrivateProfileLeaderboardsQuery>(
      graphql`
        query pagePrivateProfileLeaderboardsQuery {
          currentUserInfo {
            id
            userName
            nickname
            courseMemberships {
              courseId
              course {
                id
                title
              }
            }
          }
        }
      `,
      {}
    );

  // Some schema generations might not include courseMemberships on currentUserInfo yet.
  // Use a defensive cast to read memberships if present; otherwise default to [].
  const memberships: Array<{
    courseId: string;
    course?: { id: string; title: string };
  }> =
    ((currentUserInfo as any)?.courseMemberships as Array<{
      courseId: string;
      course?: { id: string; title: string };
    }>) ?? [];
  const SAFE_DEMO_COURSE_ID = "00000000-0000-0000-0000-000000000000";
  const firstCourseId = memberships[0]?.courseId ?? SAFE_DEMO_COURSE_ID;
  const date = new Date().toISOString().slice(0, 10);

  const leaderboardData = useLazyLoadQuery<PageLeaderboardDataQuery>(
    graphql`
      query pageLeaderboardDataQuery($courseID: ID!, $date: String!) {
        weekly: getWeeklyCourseLeaderboards(courseID: $courseID, date: $date) {
          id
          title
          userScores {
            id
            score
            user {
              id
              name
            }
          }
        }
        monthly: getMonthlyCourseLeaderboards(
          courseID: $courseID
          date: $date
        ) {
          id
          title
          userScores {
            id
            score
            user {
              id
              name
            }
          }
        }
        allTime: getAllTimeCourseLeaderboards(
          courseID: $courseID
          date: "1970-01-01"
        ) {
          id
          title
          userScores {
            id
            score
            user {
              id
              name
            }
          }
        }
        currentUserInfo {
          id
        }
      }
    `,
    { courseID: firstCourseId, date }
  );

  void leaderboardData; // avoid unused var warning

  return (
    <Box sx={{ p: 2 }}>
      <GamificationGuard>
        <OwnProfileCustomHeader displayName={currentUserInfo.nickname} />
      </GamificationGuard>

      <GamificationGuard>
        <XpOverview userId={currentUserInfo.id} />
      </GamificationGuard>

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
              "&:hover": { backgroundColor: "rgba(0, 169, 214, 0.1)" },
            }}
          />
        ))}
      </Tabs>

      <ProfileLeaderboardPositions />
    </Box>
  );
}
