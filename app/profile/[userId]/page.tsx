"use client";

import { pagePublicProfileStudentQuery } from "@/__generated__/pagePublicProfileStudentQuery.graphql";
import { pageUserAchievementsPublicQuery } from "@/__generated__/pageUserAchievementsPublicQuery.graphql";
import AchievementList from "@/components/profile/AchievementList";
import OtherUserProfileForumActivity from "@/components/profile/forum/OtherUserProfileForumActivity";
import { Avatar, Box, Tab, Tabs, Typography, Grid } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";
import { CombinedLeaderboardCard, fetchCourseLeaderboards } from "@/app/profile/leaderboard/ProfileLeaderboardPositions";

// Demo IDs & names to keep data consistent across own profile and public profile
const DEMO_SELF_ID = "1c13eeec-ac59-4f76-a48b-cef2091dd022"; // me
const DEMO_SELF_NAME = "joniwo";
const DEMO_OTHER_ID = "877d5a7b-6066-4bd4-8ebc-0efcddb97a15"; // viewed user
const DEMO_OTHER_NAME = "seconduser";

export default function PublicProfilePage() {
  const publicTabs = ["Achievements", "Forum", "Badges", "Leaderboards"];
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

  const findPublicUserInfos = data.findPublicUserInfos;
  // Fallback to demo self when backend is down
  const currentUserInfo = (data as any).currentUserInfo ?? { id: DEMO_SELF_ID, userName: DEMO_SELF_NAME };

  const [sharedLeaderboards, setSharedLeaderboards] = useState<Record<string, any>>({});
  const [loadingLB, setLoadingLB] = useState(false);

  const viewed = (findPublicUserInfos && findPublicUserInfos.length > 0) ? findPublicUserInfos[0] : null;
  // Fallback to demo other when backend is down
  const viewedSafe = viewed ?? { id: DEMO_OTHER_ID, userName: DEMO_OTHER_NAME };

  const isViewingOther = !!(currentUserInfo && viewedSafe && (currentUserInfo.id !== viewedSafe.id));

  // 👉 Gemeinsame Kurse: komplett Dummy-gesteuert
  const sharedMemberships = (() => {
    // Use the same demo course ids as the own-profile dummy so rankings stay consistent
    const COURSE_WE_ID = "course-101";
    const COURSE_WE_TITLE = "Web Engineering";
    const COURSE_SD_ID = "course-202";
    const COURSE_SD_TITLE = "Software Design";

    const memberships: any[] = [
      { courseId: COURSE_WE_ID, course: { id: COURSE_WE_ID, title: COURSE_WE_TITLE } },
      { courseId: COURSE_SD_ID, course: { id: COURSE_SD_ID, title: COURSE_SD_TITLE } },
    ];

    return memberships;
  })();

  // Load dummy leaderboards per shared course, highlighting the VIEWED user
  async function loadShared() {
    try {
      setLoadingLB(true);
      const today = new Date().toISOString().slice(0, 10);
      const result: Record<string, any> = {};
      for (const m of sharedMemberships) {
        result[m.courseId] = await fetchCourseLeaderboards(
          m.courseId,
          today,
          { id: (viewedSafe as any).id, name: (viewedSafe as any).userName }
        );
      }
      setSharedLeaderboards(result);
    } finally {
      setLoadingLB(false);
    }
  }

  // Load once when memberships are available
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => { loadShared(); return undefined; });

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
      {/* Kopfbereich: Bild + Name */}
      <Box display="flex" alignItems="center" gap={3} mb={3}>
        <Avatar sx={{ width: 80, height: 80, fontSize: 32 }}>
          {viewedSafe.userName}
        </Avatar>
        <Box>
          <Typography variant="h5">
            @{viewedSafe.userName}
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
          /* 
          <AchievementList
            achievements={achievementsByUserId.filter((a) => a.completed)}
            profileTypeSortString={"achieved"}
          />
          */
          null
        )} 
        {tabIndex === 1 && <OtherUserProfileForumActivity />}
        {tabIndex === 3 && (
          <Box sx={{ mt: 2 }}>
            {loadingLB && <Typography variant="body2">Loading leaderboards…</Typography>}
            {!loadingLB && sharedMemberships.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Ihr habt aktuell keine gemeinsamen Kurse – keine Leaderboard-Überschneidungen.
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
                      {...(isViewingOther ? {
                        currentUserId: viewedSafe.id, // highlight the viewed user
                        limitToUserIds: [viewedSafe.id, DEMO_SELF_ID],
                        scoreCompareMode: 'vsCurrentPlayer',
                        viewerUserId: DEMO_SELF_ID
                      } : {
                        currentUserId: viewedSafe.id
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