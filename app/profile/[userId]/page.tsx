"use client";

import { pagePublicProfileStudentQuery } from "@/__generated__/pagePublicProfileStudentQuery.graphql";
import { SortProvider } from "@/app/contexts/SortContext";
import { pageUserAchievementsPublicQuery } from "@/__generated__/pageUserAchievementsPublicQuery.graphql";
import { pageUserAchievementsPublicQuery } from "@/__generated__/pageUserAchievementsQuery.graphql";
import AchievementList from "@/components/profile/AchievementList";
import OtherUserProfileForumActivity from "@/components/profile/forum/OtherUserProfileForumActivity";
import { Avatar, Box, Tab, Tabs, Typography, Grid } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import UserProfileCustomHeader from "@/components/profile/header/UserProfileCustomHeader";
import { ForumApiUserInfoByIdQuery } from "@/__generated__/ForumApiUserInfoByIdQuery.graphql";
import { forumApiUserInfoByIdQuery } from "@/components/forum/api/ForumApi";
import {
  CombinedLeaderboardCard,
  fetchCourseLeaderboards,
} from "@/app/profile/leaderboard/ProfileLeaderboardPositions";

export default function PublicProfilePage() {
  const publicTabs = ["Achievements", "Forum", "Badges", "Leaderboards"];
  const [tabIndex, setTabIndex] = useState(0);

  const params = useParams();
  const userId = params?.userId as string;

  // 👉 Query nur mit Feldern, die es sicher gibt (Backend down / PublicUserInfo ohne memberships)
  const data = useLazyLoadQuery<pagePublicProfileStudentQuery>(
    graphql`
      query pagePublicProfileStudentQuery($id: [UUID!]!) {
        findPublicUserInfos(ids: $id) {
          id
          userName
        }
        currentUserInfo {
          id
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

  const findPublicUserInfos = data.findPublicUserInfos;
  // Fallback to empty object when backend is down
  const currentUserInfo = (data as any).currentUserInfo ?? {
    id: "",
    userName: "",
  };

  const [sharedLeaderboards, setSharedLeaderboards] = useState<
    Record<string, any>
  >({});
  const [loadingLB, setLoadingLB] = useState(false);

  const viewed =
    findPublicUserInfos && findPublicUserInfos.length > 0
      ? findPublicUserInfos[0]
      : null;
  // Fallback to empty object when backend is down
  const viewedSafe = viewed ?? { id: "", userName: "" };

  const isViewingOther = !!(
    currentUserInfo &&
    viewedSafe &&
    currentUserInfo.id !== viewedSafe.id
  );

  // Shared memberships is an empty array until backend integration is complete
  const sharedMemberships: any[] = [];

  // Load dummy leaderboards per shared course, highlighting the VIEWED user
  async function loadShared() {
    try {
      setLoadingLB(true);
      const today = new Date().toISOString().slice(0, 10);
      const result: Record<string, any> = {};
      for (const m of sharedMemberships) {
        result[m.courseId] = await fetchCourseLeaderboards(m.courseId, today, {
          id: (viewedSafe as any).id,
          name: (viewedSafe as any).userName,
        });
      }
      setSharedLeaderboards(result);
    } finally {
      setLoadingLB(false);
    }
  }

  // Load once when memberships are available
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => {
    loadShared();
    return undefined;
  });

  /*
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
  */

  return (
    <Box sx={{ p: 4 }}>
      <UserProfileCustomHeader
        displayName={userInfos.findUserInfos[0]?.nickname as string}
      />
      {/* Kopfbereich: Bild + Name */}
      <Box display="flex" alignItems="center" gap={3} mb={3}>
        <Avatar sx={{ width: 80, height: 80, fontSize: 32 }}>
          {viewedSafe.userName}
        </Avatar>
        <Box>
          <Typography variant="h5">@{viewedSafe.userName}</Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(e, newVal) => setTabIndex(newVal)}
        aria-label="Public profile tabs"
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
              fontWeight: 600,
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
        {tabIndex === 0 &&
          // Achievements (kept disabled until backend is ready)
          null}

        {tabIndex === 1 && <OtherUserProfileForumActivity />}
        {tabIndex === 2 && (
          // Badges placeholder
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No badges to display yet.
            </Typography>
          </Box>
        )}

        {tabIndex === 3 && (
          <Box sx={{ mt: 2 }}>
            {loadingLB && (
              <Typography variant="body2">Loading leaderboards…</Typography>
            )}
            {!loadingLB && sharedMemberships.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Ihr habt aktuell keine gemeinsamen Kurse – keine
                Leaderboard-Überschneidungen.
              </Typography>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {sharedMemberships.map((m: any) => {
                const lb = sharedLeaderboards[m.courseId];
                const weekly = lb?.weekly?.[0]?.userScores ?? [];
                const monthly = lb?.monthly?.[0]?.userScores ?? [];
                const allTime = lb?.allTime?.[0]?.userScores ?? [];
                return (
                  <Grid item xs={12} md={6} key={m.courseId}>
                    <CombinedLeaderboardCard
                      title={m.course.title}
                      weekly={weekly}
                      monthly={monthly}
                      allTime={allTime}
                      {...(isViewingOther
                        ? {
                            currentUserId: viewedSafe.id, // highlight the viewed user
                            limitToUserIds: [viewedSafe.id],
                            scoreCompareMode: "vsCurrentPlayer",
                            viewerUserId: currentUserInfo.id,
                          }
                        : {
                            currentUserId: viewedSafe.id,
                          })}
                    />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}
