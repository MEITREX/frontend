"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
  fetchQuery,
} from "react-relay";
//import type { ProfileLeaderboardPositionsUserQuery } from "./__generated__/ProfileLeaderboardPositionsUserQuery.graphql";
import type { ProfileLeaderboardPositionsUserQuery } from "@/__generated__/ProfileLeaderboardPositionsUserQuery.graphql";
import type { ProfileLeaderboardPositionsCourseQuery } from "@/__generated__/ProfileLeaderboardPositionsCourseQuery.graphql";
import type { LeaderboardRowInventoryByUserQuery } from "@/__generated__/LeaderboardRowInventoryByUserQuery.graphql";
import type { LeaderboardRowPublicInfoQuery } from "@/__generated__/LeaderboardRowPublicInfoQuery.graphql";
import defaultUserImage from "@/assets/logo.svg";
import { getPublicProfileItemsMergedCustomID } from "@/components/items/logic/GetItems";
const designTrophies = [
  // Gold
  <svg key="gold" width="30" height="30" viewBox="0 0 36 36">
    <ellipse cx="18" cy="32" rx="8" ry="3" fill="#c2a200" opacity="0.25" />
    <rect
      x="14"
      y="26"
      width="8"
      height="6"
      rx="2"
      fill="#FFD700"
      stroke="#c2a200"
      strokeWidth="1"
    />
    <path d="M12 30h12" stroke="#c2a200" strokeWidth="2" />
    <path
      d="M9 8c0 7 3 12 9 12s9-5 9-12H9z"
      fill="#FFD700"
      stroke="#c2a200"
      strokeWidth="2"
    />
    <polygon
      points="18,13 19.4,16.6 23.3,16.6 20.2,18.8 21.6,22.2 18,20 14.4,22.2 15.8,18.8 12.7,16.6 16.6,16.6"
      fill="#fff59d"
      stroke="#c2a200"
      strokeWidth="0.5"
    />
    <circle cx="9" cy="12" r="4" fill="none" stroke="#c2a200" strokeWidth="2" />
    <circle
      cx="27"
      cy="12"
      r="4"
      fill="none"
      stroke="#c2a200"
      strokeWidth="2"
    />
  </svg>,
  // Silver
  <svg key="silver" width="30" height="30" viewBox="0 0 36 36">
    <ellipse cx="18" cy="32" rx="8" ry="3" fill="#aaa" opacity="0.20" />
    <rect
      x="14"
      y="26"
      width="8"
      height="6"
      rx="2"
      fill="#C0C0C0"
      stroke="#888"
      strokeWidth="1"
    />
    <path d="M12 30h12" stroke="#888" strokeWidth="2" />
    <ellipse
      cx="18"
      cy="15"
      rx="9"
      ry="9"
      fill="#C0C0C0"
      stroke="#888"
      strokeWidth="2"
    />
    <ellipse cx="18" cy="14" rx="5" ry="6" fill="#e9e9e9" />
    <rect x="16" y="24" width="4" height="4" rx="1" fill="#e9e9e9" />
  </svg>,
  // Bronze
  <svg key="bronze" width="30" height="30" viewBox="0 0 36 36">
    <ellipse cx="18" cy="32" rx="8" ry="3" fill="#ad6d2f" opacity="0.15" />
    <rect
      x="15"
      y="26"
      width="6"
      height="6"
      rx="1.5"
      fill="#c97f4a"
      stroke="#ad6d2f"
      strokeWidth="1"
    />
    <path d="M12 30h12" stroke="#ad6d2f" strokeWidth="2" />
    <ellipse
      cx="18"
      cy="16"
      rx="8"
      ry="7"
      fill="#C96F33"
      stroke="#ad6d2f"
      strokeWidth="2"
    />
    <rect x="13" y="20" width="10" height="3" rx="1.5" fill="#e8b288" />
  </svg>,
];

/**
 * =============================
 * Types
 * =============================
 */
type PublicUserInfo = { id: string; name: string };
type UserScore = { score: number; user: PublicUserInfo };

type Asset = { id: string; url?: string | null; equipped?: boolean };
type ColorTheme = {
  id: string;
  backColor?: string | null;
  foreColor?: string | null;
  equipped?: boolean;
};
type PatternTheme = {
  id: string;
  url?: string | null;
  foreColor?: string | null;
  equipped?: boolean;
};
// New: CourseLeaderboardPayload type
export type CourseLeaderboardPayload = {
  weekly: { userScores: UserScore[] }[];
  monthly: { userScores: UserScore[] }[];
  allTime: { userScores: UserScore[] }[];
};

/**
 * =============================
 * GraphQL Queries (Relay)
 * =============================
 */

// GraphQL HTTP helper and endpoint constant
const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "/api/graphql";
async function rawGqlRequest<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length)
    throw new Error(json.errors.map((e: any) => e.message).join("; "));
  return json.data as T;
}

// Exported async function to fetch course leaderboards (for [userId]/page.tsx etc)
export async function fetchCourseLeaderboards(
  courseID: string,
  date: string,
  _currentUser: { id: string; name: string }
): Promise<CourseLeaderboardPayload> {
  // Try backend first
  const query = `
    query FetchCourseLeaderboards($courseID: ID!, $date: String!) {
      weekly: getWeeklyCourseLeaderboards(courseID: $courseID, date: $date) {
        id
        title
        userScores { id score user { id name } }
      }
      monthly: getMonthlyCourseLeaderboards(courseID: $courseID, date: $date) {
        id
        title
        userScores { id score user { id name } }
      }
      allTime: getAllTimeCourseLeaderboards(courseID: $courseID, date: $date) {
        id
        title
        userScores { id score user { id name } }
      }
    }
  `;

  try {
    type Resp = {
      weekly?: { userScores: UserScore[] }[];
      monthly?: { userScores: UserScore[] }[];
      allTime?: { userScores: UserScore[] }[];
    };
    const data = await rawGqlRequest<Resp>(query, { courseID, date });
    return {
      weekly: data.weekly ?? [{ userScores: [] }],
      monthly: data.monthly ?? [{ userScores: [] }],
      allTime: data.allTime ?? [{ userScores: [] }],
    };
  } catch (e) {
    // Fallback: empty payload so UI can render gracefully
    return {
      weekly: [{ userScores: [] }],
      monthly: [{ userScores: [] }],
      allTime: [{ userScores: [] }],
    };
  }
}

// 1) User + seine Kurs-Mitgliedschaften
const UserQuery = graphql`
  query ProfileLeaderboardPositionsUserQuery {
    currentUserInfo {
      id
      userName
      courseMemberships {
        courseId
        course {
          id
          title
        }
      }
    }
  }
`;

// 2) Leaderboards für einen Kurs (alle Zeiträume)
const CourseQuery = graphql`
  query ProfileLeaderboardPositionsCourseQuery(
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

// 3) Public user infos for resolving user names
const PublicUserInfosQuery = graphql`
  query ProfileLeaderboardPositionsPublicUsersQuery($ids: [UUID!]!) {
    findUserInfos(ids: $ids) {
      id
      nickname
    }
  }
`;

/**
 * =============================
 * Helpers & UI
 * =============================
 */

function startOfWeekMonday(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // getDay(): 0=Sun,1=Mon,...; we want Monday as start
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.getFullYear(), date.getMonth(), diff);
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function toLocalISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat().format(n);
  } catch {
    return String(n);
  }
}

function rankOf(scores: UserScore[], userId: string): number | undefined {
  const sorted = [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const idx = sorted.findIndex((s) => s.user?.id === userId);
  return idx >= 0 ? idx + 1 : undefined;
}

function Trophy({ rank }: { rank: number }) {
  if (rank < 1 || rank > 3) return null;
  const color = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32";
  const title = rank === 1 ? "Gold" : rank === 2 ? "Silver" : "Bronze";
  return (
    <EmojiEventsIcon
      titleAccess={`${title} trophy`}
      sx={{ ml: 1, fontSize: 20, verticalAlign: "middle", color }}
    />
  );
}

function RankChip({ label, value }: { label: string; value?: number }) {
  const color = value
    ? value <= 3
      ? "success"
      : value <= 10
      ? "primary"
      : "default"
    : "default";
  return (
    <Chip
      size="small"
      label={`${label}: ${value ?? "N/A"}`}
      color={color as any}
      variant={value && value <= 10 ? "filled" : "outlined"}
      sx={{ fontWeight: 700, letterSpacing: 0.2 }}
    />
  );
}

function ScoreBar({
  me,
  top,
  label,
  fullIfGreater,
}: {
  me: number;
  top: number;
  label?: string;
  fullIfGreater?: boolean;
}) {
  const pctRaw = Math.round((me / Math.max(top, 1)) * 100);
  const pct = Math.max(
    0,
    Math.min(100, fullIfGreater && me >= top ? 100 : pctRaw)
  );
  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 10, borderRadius: 999 }}
      />
      <Typography
        variant="caption"
        sx={{ mt: 0.5, display: "block", letterSpacing: 0.2 }}
      >
        {label ?? `Your score vs. course best (${me} / ${top})`}
      </Typography>
    </Box>
  );
}
function assetSrc(
  a?: { url?: string | null; id?: string } | null,
  fallback?: string
) {
  const raw = a?.url ?? a?.id;
  if (!raw) return fallback;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function UserRow({
  rank,
  score,
  user,
  highlight = false,
}: {
  rank: number;
  score: number;
  user: PublicUserInfo;
  highlight?: boolean;
}) {
  const initials = useMemo(
    () =>
      user.name
        ? user.name
            .split(" ")
            .map((p) => p[0])
            .join("")
        : "?",
    [user.name]
  );
  return (
    <ListItem
      sx={{
        px: 1,
        py: 1,
        borderRadius: 2,
        border: "1px solid",
        borderColor: highlight ? "primary.main" : "divider",
        boxShadow: highlight ? 3 : 0,
        bgcolor:
          rank === 1
            ? "linear-gradient(90deg, rgba(255,215,0,0.22) 0%, rgba(255,255,255,0) 70%)"
            : rank === 2
            ? "linear-gradient(90deg, rgba(192,192,192,0.22) 0%, rgba(255,255,255,0) 70%)"
            : rank === 3
            ? "linear-gradient(90deg, rgba(205,127,50,0.22) 0%, rgba(255,255,255,0) 70%)"
            : "background.paper",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          mr: 0.5,
          bgcolor: "background.default",
        }}
      >
        {rank}
      </Box>

      <ListItemAvatar>
        <Avatar sx={{ fontWeight: 700 }}>{initials}</Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="body2"
              noWrap
              fontWeight={highlight ? 800 : 600}
            >
              {user.name}
            </Typography>
            <Trophy rank={rank} />
          </Box>
        }
        secondary={
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            #{user.id.slice(0, 6)}
          </Typography>
        }
        sx={{ mr: 1 }}
      />

      <Box sx={{ ml: "auto" }}>
        <Chip
          size="small"
          label={`${formatNumber(score)} points`}
          sx={{ fontWeight: 700 }}
          variant="outlined"
        />
      </Box>
    </ListItem>
  );
}

function LeaderboardCard({
  title,
  timeframeLabel,
  scores,
  currentUserId,
}: {
  title: string;
  timeframeLabel: string;
  scores: UserScore[];
  currentUserId: string;
}) {
  const topSorted = useMemo(
    () => [...scores].sort((a, b) => b.score - a.score),
    [scores]
  );
  const myRank = useMemo(
    () => rankOf(scores, currentUserId),
    [scores, currentUserId]
  );
  const myScore =
    topSorted.find((s) => s.user.id === currentUserId)?.score ?? 0;
  const best = topSorted[0]?.score ?? 0;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 60%)",
        p: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          letterSpacing={0.2}
          sx={{ flex: 1 }}
        >
          {title}
        </Typography>
        <Tooltip title="Refresh">
          <span>
            <IconButton size="small" disabled>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
      <Typography
        variant="caption"
        sx={{ textTransform: "uppercase", letterSpacing: 1, mb: 1 }}
      >
        {timeframeLabel}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
        <RankChip label="Rank" value={myRank} />
        <Chip size="small" label={`Players: ${scores.length}`} />
        <Chip size="small" label={`Best: ${best}`} />
      </Stack>
      <ScoreBar me={myScore} top={best} />
      <Divider sx={{ my: 1 }} />
      <List
        dense
        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}
      >
        {topSorted.slice(0, 3).map((s, i) => (
          <UserRow
            key={s.user.id}
            rank={i + 1}
            score={s.score}
            user={s.user}
            highlight={s.user.id === currentUserId}
          />
        ))}
        {myRank && myRank > 3 && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <UserRow
              key={currentUserId}
              rank={myRank}
              score={myScore}
              user={topSorted.find((s) => s.user.id === currentUserId)!.user}
              highlight
            />
          </>
        )}
      </List>
    </Box>
  );
}

/**
 * =============================
 * Combined card (keine Datenquelle, rein UI)
 * =============================
 */
function CombinedLeaderboardCard({
  title,
  weekly,
  monthly,
  allTime,
  currentUserId,
  limitToUserIds,
  scoreCompareMode,
  viewerUserId,
}: {
  title: string;
  weekly: UserScore[];
  monthly: UserScore[];
  allTime: UserScore[];
  currentUserId: string;
  limitToUserIds?: string[];
  scoreCompareMode?: "best" | "vsCurrentPlayer";
  viewerUserId?: string;
}) {
  const [tab, setTab] = useState<0 | 1 | 2>(0);

  const scores = useMemo(() => {
    const base = tab === 0 ? weekly : tab === 1 ? monthly : allTime;
    if (!limitToUserIds || limitToUserIds.length === 0) return base;
    const idSet = new Set(limitToUserIds);
    return base.filter((s) => s.user && idSet.has(s.user.id));
  }, [tab, weekly, monthly, allTime, limitToUserIds]);

  const topSorted = useMemo(
    () => [...scores].sort((a, b) => b.score - a.score),
    [scores]
  );

  const myRank = useMemo(
    () => rankOf(scores, currentUserId),
    [scores, currentUserId]
  );
  const myScore =
    topSorted.find((s) => s.user.id === currentUserId)?.score ?? 0;
  const best = topSorted[0]?.score ?? 0;

  // Item System State
  const [userProfilePics, setUserProfilePics] = useState<
    Record<string, Asset | null>
  >({});
  const [userProfileFrames, setUserProfileFrames] = useState<
    Record<string, Asset | null>
  >({});
  const [userColorThemes, setUserColorThemes] = useState<
    Record<string, ColorTheme | null>
  >({});
  const [userPatternThemes, setUserPatternThemes] = useState<
    Record<string, PatternTheme | null>
  >({});
  const [userNickname, setUserNickname] = useState<
    Record<string, string | null>
  >({});

  const env = useRelayEnvironment();
  const idsMemo = useMemo(() => {
    return Array.from(new Set(scores.map((s) => s.user.id).filter(Boolean)));
  }, [scores]);

  useEffect(() => {
    const ids = idsMemo;
    if (ids.length === 0) {
      setUserProfilePics({});
      setUserProfileFrames({});
      setUserColorThemes({});
      setUserPatternThemes({});
      setUserNickname({});
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          ids.map(async (userId) => {
            const invRes = await fetchQuery<LeaderboardRowInventoryByUserQuery>(
              env,
              graphql`
                query ProfileLeaderboardPositionsInventoryQuery(
                  $userIds: [UUID!]!
                ) {
                  inventoriesForUsers(userIds: $userIds) {
                    items {
                      equipped
                      catalogItemId: id
                      uniqueDescription
                      unlocked
                      unlockedTime
                    }
                    unspentPoints
                    userId
                  }
                }
              `,
              { userIds: [userId] }
            ).toPromise();

            const dataNick = await fetchQuery<LeaderboardRowPublicInfoQuery>(
              env,
              graphql`
                query ProfileLeaderboardPositionsPublicInfoQuery(
                  $id: [UUID!]!
                ) {
                  findUserInfos(ids: $id) {
                    nickname
                  }
                }
              `,
              { id: [userId] }
            ).toPromise();

            const nick = dataNick?.findUserInfos?.[0]?.nickname ?? null;
            const items = invRes?.inventoriesForUsers?.[0]?.items ?? [];

            const pics = getPublicProfileItemsMergedCustomID(
              items,
              "profilePics"
            );
            const frames = getPublicProfileItemsMergedCustomID(
              items,
              "profilePicFrames"
            );
            const colors = getPublicProfileItemsMergedCustomID(
              items,
              "colorThemes"
            );
            const patterns = getPublicProfileItemsMergedCustomID(
              items,
              "patternThemes"
            );

            const pic = pics.find((it: any) => it.equipped) ?? null;
            const frame = frames.find((it: any) => it.equipped) ?? null;
            const color = colors.find((it: any) => it.equipped) ?? null;
            const pattern = patterns.find((it: any) => it.equipped) ?? null;

            return [userId, pic, frame, color, pattern, nick] as const;
          })
        );

        if (!cancelled) {
          const picsMap: Record<string, Asset | null> = {};
          const framesMap: Record<string, Asset | null> = {};
          const colorsMap: Record<string, ColorTheme | null> = {};
          const patternsMap: Record<string, PatternTheme | null> = {};
          const nicksMap: Record<string, string | null> = {};

          for (const [id, pic, frame, color, pattern, nick] of results) {
            picsMap[id] = pic;
            framesMap[id] = frame;
            colorsMap[id] = color;
            patternsMap[id] = pattern;
            nicksMap[id] = nick;
          }

          setUserProfilePics(picsMap);
          setUserProfileFrames(framesMap);
          setUserColorThemes(colorsMap);
          setUserPatternThemes(patternsMap);
          setUserNickname(nicksMap);
        }
      } catch (e) {
        console.warn("[LeaderboardCard] per-user inventory fetch failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idsMemo, env]);

  function userCardStyle(
    userId: string,
    base: React.CSSProperties = {}
  ): React.CSSProperties {
    const col = userColorThemes[userId];
    const pat = userPatternThemes[userId];

    const style: React.CSSProperties = { ...base };

    if (col?.backColor) style.backgroundColor = col.backColor;

    const patUrl = assetSrc(pat);
    if (patUrl) {
      style.backgroundImage = `url(${patUrl})`;
      style.backgroundRepeat = "repeat";
      style.backgroundSize = "100%";
    }

    const fg = col?.foreColor ?? pat?.foreColor;
    if (fg) style.color = fg;

    return style;
  }

  let scoreBarMe = myScore;
  let scoreBarTop = best;
  let scoreBarLabel = `Your score vs. course best (${myScore} / ${best})`;
  let scoreBarFullIfGreater = false;

  if (scoreCompareMode === "vsCurrentPlayer" && viewerUserId) {
    const viewerScore =
      topSorted.find((s) => s.user.id === viewerUserId)?.score ?? 0;
    const currentEntry = topSorted.find((s) => s.user.id === currentUserId);
    const currentScore = currentEntry?.score ?? 0;
    const currentName = currentEntry?.user?.name ?? "player";
    scoreBarMe = viewerScore;
    scoreBarTop = currentScore;
    scoreBarLabel = `Your score vs. ${currentName} (${viewerScore} / ${currentScore})`;
    scoreBarFullIfGreater = true;
  }

  const rangeLabel = useMemo(() => {
    if (tab === 0) {
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(today);
      start.setDate(diff);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const fmt = (d: Date) => d.toLocaleDateString("de-DE");
      return `${fmt(start)} – ${fmt(end)}`;
    }
    if (tab === 1) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const fmt = (d: Date) => d.toLocaleDateString("de-DE");
      return `${fmt(start)} – ${fmt(end)}`;
    }
    return undefined;
  }, [tab]);

  const timeframeLabel =
    tab === 0 ? "This Week" : tab === 1 ? "This Month" : "All Time";

  return (
    <Box
      sx={{
        background: "#dde3ec",
        borderRadius: 3,
        p: 3,
        width: "100%",
        maxWidth: 760,
        mx: "auto",
        fontFamily: '"Roboto", "Arial", sans-serif',
        boxShadow: "0 2px 32px rgba(80,80,80,0.13)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2.5,
          gap: 1.5,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography
            component="div"
            sx={{
              fontWeight: 900,
              fontSize: 30,
              lineHeight: 1.1,
              color: "#0b0b0b",
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: ".5px",
              color: "#2f3541",
              mb: 0.5,
            }}
          >
            {timeframeLabel} Leaderboard
          </Typography>
          <Typography
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: ".5px",
              color: "#79869a",
            }}
          >
            {rangeLabel ?? ""}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1.5 }}>
        <Button
          onClick={() => setTab(0)}
          disableRipple
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "12px",
            px: 1.5,
            py: 0.75,
            border: "2px solid " + (tab === 0 ? "#00a9d6" : "transparent"),
            backgroundColor:
              tab === 0 ? "rgba(0, 169, 214, 0.10)" : "transparent",
            color: "text.primary",
            transition: "all .15s ease-in-out",
            "&:hover": { backgroundColor: "rgba(0, 169, 214, 0.10)" },
          }}
        >
          Weekly Leaderboard
        </Button>
        <Button
          onClick={() => setTab(1)}
          disableRipple
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "12px",
            px: 1.5,
            py: 0.75,
            border: "2px solid " + (tab === 1 ? "#00a9d6" : "transparent"),
            backgroundColor:
              tab === 1 ? "rgba(0, 169, 214, 0.10)" : "transparent",
            color: "text.primary",
            transition: "all .15s ease-in-out",
            "&:hover": { backgroundColor: "rgba(0, 169, 214, 0.10)" },
          }}
        >
          Monthly Leaderboard
        </Button>
        <Button
          onClick={() => setTab(2)}
          disableRipple
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "12px",
            px: 1.5,
            py: 0.75,
            border: "2px solid " + (tab === 2 ? "#00a9d6" : "transparent"),
            backgroundColor:
              tab === 2 ? "rgba(0, 169, 214, 0.10)" : "transparent",
            color: "text.primary",
            transition: "all .15s ease-in-out",
            "&:hover": { backgroundColor: "rgba(0, 169, 214, 0.10)" },
          }}
        >
          All Time Leaderboard
        </Button>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
        <RankChip label="Rank" value={myRank} />
        <Chip size="small" label={`Players: ${scores.length}`} />
        <Chip size="small" label={`Best: ${best}`} />
      </Stack>
      <ScoreBar
        me={scoreBarMe}
        top={scoreBarTop}
        label={scoreBarLabel}
        fullIfGreater={scoreBarFullIfGreater}
      />

      {/* Top 3 with Items */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          pb: 2,
          position: "relative",
          zIndex: 2,
          boxShadow: "0 8px 32px -4px rgba(80,80,120,0.13)",
        }}
      >
        {topSorted.slice(0, 3).map((s, idx) => {
          const isCurrent = s.user.id === currentUserId;
          const bg =
            idx === 0
              ? "linear-gradient(90deg,#f9f9f9 60%,#fff4cc 100%)"
              : idx === 1
              ? "linear-gradient(90deg,#f0f0f0 60%,#e0e0e0 100%)"
              : "linear-gradient(90deg,#e6e6e6 60%,#e4d0c1 100%)";

          return (
            <Box
              key={s.user.id}
              sx={userCardStyle(s.user.id, {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "14px",
                padding: "8px 18px",
                minHeight: 60,
                fontSize: 18,
                background: bg,
                border: isCurrent ? "3px solid #222" : "2px solid #e1e6ea",
                fontWeight: isCurrent ? 900 : 700,
                boxShadow: isCurrent
                  ? "0 2px 12px rgba(40,40,40,0.13)"
                  : undefined,
              })}
            >
              <Box
                sx={{
                  minWidth: 24,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: isCurrent ? 900 : 700,
                  color: userCardStyle(s.user.id).color,
                }}
              >
                {idx + 1}.
              </Box>

              <Box
                sx={{
                  position: "relative",
                  width: 48,
                  height: 48,
                  margin: "0 auto 10px",
                  border: isCurrent ? "3px solid #222" : "0px solid #ddd",
                  objectFit: "cover",
                  boxShadow: "0 1px 5px #0001",
                }}
              >
                {assetSrc(userProfileFrames[s.user.id]) && (
                  <img
                    src={assetSrc(userProfileFrames[s.user.id])}
                    alt={s.user.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: 10,
                      objectFit: "cover",
                      boxShadow: "0 2px 8px #0001",
                      zIndex: 1,
                    }}
                  />
                )}

                <img
                  src={
                    assetSrc(userProfilePics[s.user.id], defaultUserImage.src)!
                  }
                  alt={s.user.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                    objectFit: "cover",
                    boxShadow: "0 2px 8px #0001",
                    zIndex: 0,
                  }}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.75,
                  fontWeight: isCurrent ? 900 : 700,
                  color: userCardStyle(s.user.id).color,
                  fontSize: 18,
                  letterSpacing: ".5px",
                }}
              >
                {designTrophies[idx]} {userNickname[s.user.id] ?? s.user.name}
              </Box>

              <Box
                sx={{
                  minWidth: 80,
                  textAlign: "right",
                  color: userCardStyle(s.user.id).color,
                  fontWeight: isCurrent ? 900 : 700,
                  fontSize: 18,
                }}
              >
                {s.score} points
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Context ranks with Items */}
      {(() => {
        const sorted = [...scores].sort((a, b) => b.score - a.score);
        const myRank = rankOf(scores, currentUserId);
        if (!myRank || myRank <= 3) return null;
        const candidates = [myRank - 1, myRank, myRank + 1].filter(
          (r) => r >= 4 && r <= sorted.length
        );
        if (candidates.length === 0) return null;

        return (
          <Box
            sx={{
              mx: -3,
              mb: -3,
              mt: 0,
              background: "#c7ccda",
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
              p: "6px 0",
              boxShadow: "inset 0 2px 0 #b2b9c9",
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, px: 2 }}
            >
              {candidates.map((rank) => {
                const item = sorted[rank - 1];
                const isCurrent = item.user.id === currentUserId;
                return (
                  <Box
                    key={item.user.id}
                    sx={userCardStyle(item.user.id, {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: 2,
                      padding: "8px 16px",
                      minHeight: 52,
                      fontSize: 18,
                      background: "#fff",
                      border: isCurrent
                        ? "3px solid #000"
                        : "2px solid #e1e6ea",
                      fontWeight: isCurrent ? 800 : 600,
                      boxShadow: isCurrent
                        ? "0 2px 8px rgba(60,60,60,0.11)"
                        : undefined,
                    })}
                  >
                    <Box
                      sx={{
                        minWidth: 32,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 18,
                          color: userCardStyle(item.user.id).color,
                        }}
                      >
                        {rank}.
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        position: "relative",
                        width: 48,
                        height: 48,
                        margin: "0 auto 10px",
                        border: isCurrent ? "3px solid #222" : "0px solid #ddd",
                        objectFit: "cover",
                        boxShadow: "0 1px 5px #0001",
                      }}
                    >
                      {assetSrc(userProfileFrames[item.user.id]) && (
                        <img
                          src={assetSrc(userProfileFrames[item.user.id])}
                          alt={item.user.id}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            borderRadius: 10,
                            objectFit: "cover",
                            boxShadow: "0 2px 8px #0001",
                            zIndex: 1,
                          }}
                        />
                      )}

                      <img
                        src={
                          assetSrc(
                            userProfilePics[item.user.id],
                            defaultUserImage.src
                          )!
                        }
                        alt={item.user.id}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          borderRadius: 10,
                          objectFit: "cover",
                          boxShadow: "0 2px 8px #0001",
                          zIndex: 0,
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        textAlign: "center",
                        fontWeight: isCurrent ? 800 : 600,
                        color: userCardStyle(item.user.id).color,
                        fontSize: 18,
                        letterSpacing: ".5px",
                      }}
                    >
                      {userNickname[item.user.id] ?? item.user.name}
                    </Box>

                    <Box
                      sx={{
                        minWidth: 80,
                        textAlign: "right",
                        color: userCardStyle(item.user.id).color,
                        fontWeight: isCurrent ? 800 : 600,
                        fontSize: 18,
                      }}
                    >
                      {item.score} points
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })()}
    </Box>
  );
}

/**
 * =============================
 * Child: lädt Leaderboards für einen Kurs via Relay
 * =============================
 */
function CourseLeaderboardsForCourse({
  courseId,
  courseTitle,
  currentUserId,
}: {
  courseId: string;
  courseTitle: string;
  currentUserId: string;
}) {
  // Compute dates: weekly -> Monday of current week, monthly/allTime -> first day of current month
  const today = useMemo(() => new Date(), []);
  const weeklyDateISO = useMemo(
    () => toLocalISODate(startOfWeekMonday(today)),
    [today]
  );
  const monthStartISO = useMemo(
    () => toLocalISODate(startOfMonth(today)),
    [today]
  );

  const data = useLazyLoadQuery<ProfileLeaderboardPositionsCourseQuery>(
    CourseQuery,
    {
      courseID: courseId,
      weeklyDate: weeklyDateISO,
      monthlyDate: monthStartISO,
      allTimeDate: monthStartISO,
    }
  );

  const weekly = (data.weekly?.[0]?.userScores ?? []) as unknown as UserScore[];
  const monthly = (data.monthly?.[0]?.userScores ??
    []) as unknown as UserScore[];
  const allTime = (data.allTime?.[0]?.userScores ??
    []) as unknown as UserScore[];

  // Compute set of user IDs missing names
  const allScores = [...weekly, ...monthly, ...allTime];
  const idsNeedingName = Array.from(
    new Set(
      allScores.map((s) => s.user?.id).filter((id): id is string => Boolean(id))
    )
  );

  // Unconditionally call PublicUserInfosQuery
  const publicUsers = useLazyLoadQuery<any>(PublicUserInfosQuery, {
    ids: idsNeedingName,
  });

  // Build a map from id -> name (prefer user.name if present)
  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of allScores) {
      if (s.user?.id && s.user?.name) m.set(s.user.id, s.user.name);
    }
    for (const u of publicUsers.findUserInfos ?? []) {
      // Map nickname to name
      if (u?.id && u?.nickname && !m.has(u.id)) m.set(u.id, u.nickname);
    }
    return m;
  }, [allScores, publicUsers.findUserInfos]);

  // Helper to enrich scores with resolved names
  const enrich = (arr: UserScore[]): UserScore[] =>
    arr.map((s) => ({
      ...s,
      user: {
        id: s.user.id,
        name: s.user.name || nameById.get(s.user.id) || "Unknown",
      },
    }));

  const weeklyEnriched = useMemo(() => enrich(weekly), [weekly, nameById]);
  const monthlyEnriched = useMemo(() => enrich(monthly), [monthly, nameById]);
  const allTimeEnriched = useMemo(() => enrich(allTime), [allTime, nameById]);

  return (
    <CombinedLeaderboardCard
      title={courseTitle}
      weekly={weeklyEnriched}
      monthly={monthlyEnriched}
      allTime={allTimeEnriched}
      currentUserId={currentUserId}
    />
  );
}

/**
 * =============================
 * Page Component
 * =============================
 */
function ProfileLeaderboardPositions() {
  // User + Kurse laden
  const userData = useLazyLoadQuery<ProfileLeaderboardPositionsUserQuery>(
    UserQuery,
    {}
  );
  const currentUser = userData.currentUserInfo;

  if (!currentUser) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Your leaderboard positions
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        General overview of your current leaderboard positions across courses.
        <br />
        Use the tabs to switch between different timeframes.
      </Typography>

      <Grid container spacing={2}>
        {(currentUser.courseMemberships ?? []).map((m) => (
          <Grid item xs={12} md={6} key={m.courseId}>
            <CourseLeaderboardsForCourse
              courseId={m.courseId}
              courseTitle={m.course?.title ?? "Course"}
              currentUserId={currentUser.id}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export {
  ProfileLeaderboardPositions as default,
  ProfileLeaderboardPositions,
  CombinedLeaderboardCard,
  CourseLeaderboardsForCourse,
};
export type { UserScore, PublicUserInfo };
