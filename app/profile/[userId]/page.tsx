"use client";

import { ForumApiUserInfoByIdQuery } from "@/__generated__/ForumApiUserInfoByIdQuery.graphql";
import { pagePublicProfileStudentQuery } from "@/__generated__/pagePublicProfileStudentQuery.graphql";
import { pageUserAchievementsPublicProfileQuery } from "@/__generated__/pageUserAchievementsPublicProfileQuery.graphql";
import { SortProvider } from "@/app/contexts/SortContext";
import { CombinedLeaderboardCard } from "@/app/profile/leaderboard/ProfileLeaderboardPositions";
import { forumApiUserInfoByIdQuery } from "@/components/forum/api/ForumApi";
import AchievementList from "@/components/profile/AchievementList";
import OtherUserProfileForumActivity from "@/components/profile/forum/OtherUserProfileForumActivity";
import UserProfileCustomHeader from "@/components/profile/header/UserProfileCustomHeader";
import ProfileInventorySection from "@/components/profile/items/ProfileInventorySection";
import { NavigateBefore } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  LinearProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { fetchQuery, useLazyLoadQuery, useRelayEnvironment } from "react-relay";

import { pagePublicProfileUserXPQuery } from "@/__generated__/pagePublicProfileUserXPQuery.graphql";
import { graphql } from "relay-runtime";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

function toLocalISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeekMonday(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay(); // 0=Sun,1=Mon,...
  const diff = (day + 6) % 7; // days since Monday
  date.setDate(date.getDate() - diff);
  return date;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const PublicProfileUserXPQueryGQL = graphql`
  query pagePublicProfileUserXPQuery($userID: ID!) {
    getUser(userID: $userID) {
      id
      xpValue
      requiredXP
      exceedingXP
      level
    }
  }
`;

const PagePublicProfileCourseLBQueryGQL = graphql`
  query pagePublicProfileCourseLBQuery(
    $courseID: ID!
    $weeklyDate: String!
    $monthlyDate: String!
    $allTimeDate: String!
  ) {
    weekly: getWeeklyCourseLeaderboards(
      courseID: $courseID
      date: $weeklyDate
    ) {
      id
      title
      startDate
      period
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
      date: $monthlyDate
    ) {
      id
      title
      startDate
      period
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
      date: $allTimeDate
    ) {
      id
      title
      startDate
      period
      userScores {
        id
        score
        user {
          id
          name
        }
      }
    }
  }
`;

const PagePublicProfileManyUserInfosQueryGQL = graphql`
  query pagePublicProfileManyUserInfosQuery($ids: [UUID!]!) {
    findUserInfos(ids: $ids) {
      id
      nickname
    }
  }
`;

/** Build id -> display name map (prefer explicit user.name if present; otherwise nickname from public info). */
function buildNameMap(
  fromScores: Array<any>[],
  publicInfos: Array<{ id: string; nickname: string }> = []
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const arr of fromScores) {
    for (const s of arr ?? []) {
      const id = s?.user?.id;
      const nm = s?.user?.name;
      if (id && nm) map[id] = nm;
    }
  }
  for (const pi of publicInfos ?? []) {
    if (pi?.id && pi?.nickname && !map[pi.id]) {
      map[pi.id] = pi.nickname;
    }
  }
  return map;
}

function enrichScoresWithNames(
  scores: any[],
  nameById: Record<string, string>
) {
  return (scores ?? []).map((s) => {
    const id = s?.user?.id;
    const existing = s?.user?.name;
    const name = existing ?? (id ? nameById[id] : undefined) ?? "Unknown";
    return {
      ...s,
      user: { ...(s?.user ?? {}), name },
    };
  });
}

export default function PublicProfilePage() {
  const router = useRouter(); // Hook holen

  const displayGamification = false;

  const baseTabs = [
    { label: "General", path: "general" },
    { label: "Forum", path: "forum" },
  ];

  const gamificationTabs = [
    { label: "Achievements", path: "achievements" },
    { label: "Badges", path: "badges" },
    { label: "Leaderboards", path: "leaderboard" },
  ];

  const publicTabs = displayGamification
    ? [...baseTabs, ...gamificationTabs]
    : baseTabs;

  const [tabIndex, setTabIndex] = useState(0);

  const params = useParams();
  const userId = params?.userId as string;
  const relayEnv = useRelayEnvironment();

  // Fetch XP/Level for the viewed user via Relay (no manual fetch)
  const xpData = useLazyLoadQuery<pagePublicProfileUserXPQuery>(
    PublicProfileUserXPQueryGQL,
    { userID: userId },
    { fetchPolicy: "network-only" }
  );
  // Backend may return either an object or an array; normalize it
  const xpPayload: any = Array.isArray((xpData as any)?.getUser)
    ? (xpData as any)?.getUser?.[0] ?? null
    : (xpData as any)?.getUser ?? null;

  const level: number = Number(xpPayload?.level ?? 0);
  const xpInLevel: number = Number(xpPayload?.exceedingXP ?? 0);
  const xpRequired: number = Math.max(1, Number(xpPayload?.requiredXP ?? 1));
  const xpPercent: number = Math.max(
    0,
    Math.min(100, Math.round((xpInLevel / xpRequired) * 100))
  );
  const fmtInt = (n: number) =>
    Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const levelIconSrc = `/levels/level_${Math.max(
    0,
    Math.min(99, Math.round(level || 0))
  )}.svg`;

  // 👉 Query nur mit Feldern, die es sicher gibt (PublicUserInfo + aktueller User)
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

  const { achievementsByUserId } =
    useLazyLoadQuery<pageUserAchievementsPublicProfileQuery>(
      graphql`
        query pageUserAchievementsPublicProfileQuery($id: UUID!) {
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
      { id: userId },
      {
        fetchPolicy: "network-only",
      }
    );

  console.log(achievementsByUserId);

  const mutableAchievements = [...achievementsByUserId];

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

  // TODO: Sobald Backend die gemeinsamen Kurse liefert, hier ersetzen.
  // Aktuell bleibt dies leer, der LB-Loader ist aber funktionsfähig.
  const sharedMemberships: any[] = [];

  // Load leaderboards per shared course, highlighting the VIEWED user
  async function loadShared() {
    try {
      setLoadingLB(true);

      const now = new Date();
      const weeklyDateISO = toLocalISODate(startOfWeekMonday(now));
      const monthlyDateISO = toLocalISODate(startOfMonth(now));
      const allTimeDateISO = monthlyDateISO; // AllTime initial an Monatsersten binden

      const result: Record<string, any> = {};

      for (const m of sharedMemberships) {
        const lbData = await fetchQuery(
          relayEnv,
          PagePublicProfileCourseLBQueryGQL,
          {
            courseID: m.courseId,
            weeklyDate: weeklyDateISO,
            monthlyDate: monthlyDateISO,
            allTimeDate: allTimeDateISO,
          }
        ).toPromise();

        const weeklyRaw = (lbData as any)?.weekly ?? [];
        const monthlyRaw = (lbData as any)?.monthly ?? [];
        const allTimeRaw = (lbData as any)?.allTime ?? [];

        // Collect all unique user ids from the three boards
        const idSet = new Set<string>();
        for (const board of [...weeklyRaw, ...monthlyRaw, ...allTimeRaw]) {
          for (const s of board?.userScores ?? []) {
            if (s?.user?.id) idSet.add(s.user.id);
          }
        }

        // Fetch public user infos for any ids we saw
        let publicInfos: Array<{ id: string; nickname: string }> = [];
        if (idSet.size > 0) {
          const piData = await fetchQuery(
            relayEnv,
            PagePublicProfileManyUserInfosQueryGQL,
            { ids: Array.from(idSet) }
          ).toPromise();
          publicInfos = ((piData as any)?.findPublicUserInfos ?? []) as Array<{
            id: string;
            nickname: string;
          }>;
        }

        // Build name map (prefer names coming directly from scores)
        const nameById = buildNameMap(
          [
            weeklyRaw.flatMap((b: any) => b?.userScores ?? []),
            monthlyRaw.flatMap((b: any) => b?.userScores ?? []),
            allTimeRaw.flatMap((b: any) => b?.userScores ?? []),
          ],
          publicInfos
        );

        // Enrich each leaderboard's userScores with resolved names
        const weeklyEnriched = weeklyRaw.map((b: any) => ({
          ...b,
          userScores: enrichScoresWithNames(b?.userScores ?? [], nameById),
        }));
        const monthlyEnriched = monthlyRaw.map((b: any) => ({
          ...b,
          userScores: enrichScoresWithNames(b?.userScores ?? [], nameById),
        }));
        const allTimeEnriched = allTimeRaw.map((b: any) => ({
          ...b,
          userScores: enrichScoresWithNames(b?.userScores ?? [], nameById),
        }));

        result[m.courseId] = {
          weekly: weeklyEnriched,
          monthly: monthlyEnriched,
          allTime: allTimeEnriched,
        };
      }

      setSharedLeaderboards(result);
    } finally {
      setLoadingLB(false);
    }
  }

  // Load once (and whenever sharedMemberships changes)
  useEffect(() => {
    loadShared();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sharedMemberships), viewedSafe.id, currentUserInfo.id]);

  const auth = useAuth();

  const tokenRef = React.useRef<string | undefined>(auth.user?.access_token);
  useEffect(() => {
    tokenRef.current = auth.user?.access_token;
  }, [auth.user?.access_token]);

  return (
    <Box sx={{ p: 4 }}>
      <Button
        onClick={() => router.back()}
        component="a"
        variant="text"
        startIcon={<NavigateBefore sx={{ color: "text.primary" }} />}
        sx={{ mb: 2, color: "#000000" }}
      >
        Back
      </Button>

      <UserProfileCustomHeader
        displayName={userInfos.findUserInfos[0]?.nickname as string}
      />

      {/* XP / Level overview for viewed user */}
      <Box
        sx={{ mt: 2, mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}
      >
        <img
          src={levelIconSrc}
          alt={`Level ${level}`}
          width={44}
          height={44}
          style={{ display: "block" }}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.src = "/levels/level_0.svg";
          }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <LinearProgress
            variant="determinate"
            value={xpPercent}
            sx={{ height: 8, borderRadius: 999 }}
          />
          <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
            {fmtInt(xpInLevel)} / {fmtInt(xpRequired)} XP
          </Typography>
        </Box>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ minWidth: 64, textAlign: "right" }}
        >
          Level {fmtInt(level)}
        </Typography>
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
        {tabIndex === 0 && (
          <AchievementList
            achievements={mutableAchievements}
            profileTypeSortString={"achieved"}
          />
        )}

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
                No common courses with the user can be found – no leaderboard
                entries available.
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

        {tabIndex === 4 && (
          <SortProvider>
            <ProfileInventorySection userId={userId} />
          </SortProvider>
        )}
      </Box>
    </Box>
  );
}
