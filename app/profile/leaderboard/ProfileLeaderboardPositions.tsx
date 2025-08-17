"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
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
  Tabs,
  Tab,
  Button,
} from "@mui/material";
// Design-matched trophies (sizes and colors aligned to reference)
// Demo IDs / Names used across own & public profile to keep data consistent
const DEMO_SELF_ID = "1c13eeec-ac59-4f76-a48b-cef2091dd022"; // me
const DEMO_SELF_NAME = "joniwo";
const DEMO_OTHER_ID = "877d5a7b-6066-4bd4-8ebc-0efcddb97a15"; // viewed user
const DEMO_OTHER_NAME = "seconduser";
const designTrophies = [
  // Gold
  (
    <svg key="gold" width="30" height="30" viewBox="0 0 36 36">
      <ellipse cx="18" cy="32" rx="8" ry="3" fill="#c2a200" opacity="0.25" />
      <rect x="14" y="26" width="8" height="6" rx="2" fill="#FFD700" stroke="#c2a200" strokeWidth="1" />
      <path d="M12 30h12" stroke="#c2a200" strokeWidth="2" />
      <path d="M9 8c0 7 3 12 9 12s9-5 9-12H9z" fill="#FFD700" stroke="#c2a200" strokeWidth="2" />
      <polygon points="18,13 19.4,16.6 23.3,16.6 20.2,18.8 21.6,22.2 18,20 14.4,22.2 15.8,18.8 12.7,16.6 16.6,16.6" fill="#fff59d" stroke="#c2a200" strokeWidth="0.5" />
      <circle cx="9" cy="12" r="4" fill="none" stroke="#c2a200" strokeWidth="2" />
      <circle cx="27" cy="12" r="4" fill="none" stroke="#c2a200" strokeWidth="2" />
    </svg>
  ),
  // Silver
  (
    <svg key="silver" width="30" height="30" viewBox="0 0 36 36">
      <ellipse cx="18" cy="32" rx="8" ry="3" fill="#aaa" opacity="0.20" />
      <rect x="14" y="26" width="8" height="6" rx="2" fill="#C0C0C0" stroke="#888" strokeWidth="1" />
      <path d="M12 30h12" stroke="#888" strokeWidth="2" />
      <ellipse cx="18" cy="15" rx="9" ry="9" fill="#C0C0C0" stroke="#888" strokeWidth="2" />
      <ellipse cx="18" cy="14" rx="5" ry="6" fill="#e9e9e9" />
      <rect x="16" y="24" width="4" height="4" rx="1" fill="#e9e9e9" />
    </svg>
  ),
  // Bronze
  (
    <svg key="bronze" width="30" height="30" viewBox="0 0 36 36">
      <ellipse cx="18" cy="32" rx="8" ry="3" fill="#ad6d2f" opacity="0.15" />
      <rect x="15" y="26" width="6" height="6" rx="1.5" fill="#c97f4a" stroke="#ad6d2f" strokeWidth="1" />
      <path d="M12 30h12" stroke="#ad6d2f" strokeWidth="2" />
      <ellipse cx="18" cy="16" rx="8" ry="7" fill="#C96F33" stroke="#ad6d2f" strokeWidth="2" />
      <rect x="13" y="20" width="10" height="3" rx="1.5" fill="#e8b288" />
    </svg>
  ),
];

export function CombinedLeaderboardCard({
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
  /** When set, only these user IDs are rendered (e.g., viewed + me in public profile) */
  limitToUserIds?: string[];
  /** Switch score bar: default compares to best; 'vsCurrentPlayer' compares viewer vs currentUserId */
  scoreCompareMode?: 'best' | 'vsCurrentPlayer';
  /** Logged-in viewer id (required for vsCurrentPlayer) */
  viewerUserId?: string;
}) {
  const [tab, setTab] = useState<0 | 1 | 2>(0);
  const handleTab = (_: React.SyntheticEvent, v: number) => setTab(v as 0 | 1 | 2);

  const timeframeLabel = tab === 0 ? "This Week" : tab === 1 ? "This Month" : "All Time";
  const scores = useMemo(() => {
    const base = tab === 0 ? weekly : tab === 1 ? monthly : allTime;
    if (!limitToUserIds || limitToUserIds.length === 0) return base;
    const idSet = new Set(limitToUserIds);
    return base.filter((s) => s.user && idSet.has(s.user.id));
  }, [tab, weekly, monthly, allTime, limitToUserIds]);

  const topSorted = useMemo(() => [...scores].sort((a, b) => b.score - a.score), [scores]);
  const myRank = useMemo(() => rankOf(scores, currentUserId), [scores, currentUserId]);
  const myScore = topSorted.find((s) => s.user.id === currentUserId)?.score ?? 0;
  const best = topSorted[0]?.score ?? 0;

  // Score bar perspective
  let scoreBarMe = myScore;
  let scoreBarTop = best;
  let scoreBarLabel = `Your score vs. course best (${myScore} / ${best})`;
  let scoreBarFullIfGreater = false;

  if (scoreCompareMode === 'vsCurrentPlayer' && viewerUserId) {
    const viewerScore = topSorted.find((s) => s.user.id === viewerUserId)?.score ?? 0;
    const currentEntry = topSorted.find((s) => s.user.id === currentUserId);
    const currentScore = currentEntry?.score ?? 0;
    const currentName = currentEntry?.user?.name ?? 'player';
    scoreBarMe = viewerScore;
    scoreBarTop = currentScore;
    scoreBarLabel = `Your score vs. ${currentName} (${viewerScore} / ${currentScore})`;
    scoreBarFullIfGreater = true;
  }

  const contextIndexes = useMemo(() => {
    if (!myRank || myRank <= 3) return [] as number[];
    const candidates = [myRank - 1, myRank, myRank + 1];
    // Do not include Top 3 again; keep bounds
    return candidates.filter((r) => r >= 4 && r <= topSorted.length);
  }, [myRank, topSorted.length]);

  const contextRows = useMemo(() => contextIndexes.map((r) => ({ rank: r, item: topSorted[r - 1] })), [contextIndexes, topSorted]);

  const rangeLabel = useMemo(() => {
    if (tab === 0) {
      // Weekly: Monday–Sunday
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
      // Monthly: 1st–last day of current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const fmt = (d: Date) => d.toLocaleDateString("de-DE");
      return `${fmt(start)} – ${fmt(end)}`;
    }
    return undefined;
  }, [tab]);

  return (
    <Box
      sx={{
        background: '#dde3ec',
        borderRadius: 3,
        p: 3,
        width: '100%',
        maxWidth: 760,
        minHeight: 'auto',
        mx: 'auto',
        fontFamily: '"Roboto", "Arial", sans-serif',
        boxShadow: '0 2px 32px rgba(80,80,80,0.13)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Kopfbereich */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1.5, justifyContent: 'center', width: '100%' }}>
        <Box sx={{ flex: 'none' }}>
          <button
            onClick={() => { /* previous noop in demo */ }}
            style={{
              background: '#f8fafc',
              border: '1px solid #d8dee3',
              borderRadius: 10,
              padding: '7px 14px 7px 10px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500,
              fontSize: 16,
              cursor: 'pointer',
              gap: 8,
              boxShadow: '0 1px 2px rgba(80,80,80,0.07)'
            }}
          >
            <span role="img" aria-label="Clock">⏰</span>&nbsp;PREVIOUS
          </button>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography component="div" sx={{ fontWeight: 900, fontSize: 30, lineHeight: 1.1, color: '#0b0b0b', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography component="div" sx={{ fontWeight: 700, fontSize: 18, letterSpacing: '.5px', color: '#2f3541', mb: 0.5 }}>
            {timeframeLabel} Leaderboard
          </Typography>
          <Typography component="div" sx={{ fontWeight: 600, fontSize: 15, letterSpacing: '.5px', color: '#79869a' }}>
            {rangeLabel ?? ''}
          </Typography>
        </Box>
        <Box sx={{ flex: 'none', width: 60 }} />
      </Box>

      {/* Zeitraum-Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1.5 }}>
        <Button
          onClick={() => setTab(0)}
          disableRipple
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '12px',
            px: 1.5,
            py: 0.75,
            border: tab === 0 ? '2px solid #00a9d6' : '2px solid transparent',
            backgroundColor: tab === 0 ? 'rgba(0, 169, 214, 0.10)' : 'transparent',
            color: 'text.primary',
            transition: 'all .15s ease-in-out',
            '&:hover': { backgroundColor: 'rgba(0, 169, 214, 0.10)' },
          }}
        >
          Weekly Leaderboard
        </Button>
        <Button
          onClick={() => setTab(1)}
          disableRipple
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '12px',
            px: 1.5,
            py: 0.75,
            border: tab === 1 ? '2px solid #00a9d6' : '2px solid transparent',
            backgroundColor: tab === 1 ? 'rgba(0, 169, 214, 0.10)' : 'transparent',
            color: 'text.primary',
            transition: 'all .15s ease-in-out',
            '&:hover': { backgroundColor: 'rgba(0, 169, 214, 0.10)' },
          }}
        >
          Monthly Leaderboard
        </Button>
        <Button
          onClick={() => setTab(2)}
          disableRipple
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '12px',
            px: 1.5,
            py: 0.75,
            border: tab === 2 ? '2px solid #00a9d6' : '2px solid transparent',
            backgroundColor: tab === 2 ? 'rgba(0, 169, 214, 0.10)' : 'transparent',
            color: 'text.primary',
            transition: 'all .15s ease-in-out',
            '&:hover': { backgroundColor: 'rgba(0, 169, 214, 0.10)' },
          }}
        >
          All Time Leaderboard
        </Button>
      </Box>

      {/* Statistik oben (beibehalten) */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
        <RankChip label="Rank" value={myRank} />
        <Chip size="small" label={`Players: ${scores.length}`} />
        <Chip size="small" label={`Best: ${best}`} />
      </Stack>
      <ScoreBar me={scoreBarMe} top={scoreBarTop} label={scoreBarLabel} fullIfGreater={scoreBarFullIfGreater} />

      {/* Top 3 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pb: 2, position: 'relative', zIndex: 2, boxShadow: '0 8px 32px -4px rgba(80,80,120,0.13)' }}>
        {topSorted.slice(0,3).map((s, idx) => {
          const isCurrent = s.user.id === currentUserId;
          const bg = idx === 0
            ? 'linear-gradient(90deg,#f9f9f9 60%,#fff4cc 100%)'
            : idx === 1
            ? 'linear-gradient(90deg,#f0f0f0 60%,#e0e0e0 100%)'
            : 'linear-gradient(90deg,#e6e6e6 60%,#e4d0c1 100%)';
          return (
            <Box key={s.user.id} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderRadius: '14px', p: '8px 18px', minHeight: 60, fontSize: 18, background: bg, border: isCurrent ? '3px solid #222' : '2px solid #e1e6ea', fontWeight: isCurrent ? 900 : 700, boxShadow: isCurrent ? '0 2px 12px rgba(40,40,40,0.13)' : undefined }}>
              <Box sx={{ minWidth: 24, textAlign:'center', fontSize: 18, fontWeight: isCurrent ? 900 : 700 }}>{idx+1}.</Box>
              <Box sx={{ mr: 1.5 }}>
                <Avatar sx={{ width:38, height:38, borderRadius: 2, border: isCurrent ? '3px solid #222' : '2px solid #ddd', boxShadow: '0 1px 5px #0001' }}>{s.user.name?.slice(0,1)}</Avatar>
              </Box>
              <Box sx={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap: 0.75, fontWeight: isCurrent ? 900 : 700, color: isCurrent ? '#0b0b0b' : '#2f3541', fontSize: 18, letterSpacing: '.5px' }}>
                {designTrophies[idx]}
                {s.user.name}
              </Box>
              <Box sx={{ minWidth: 80, textAlign:'right', color: isCurrent ? '#222' : '#79869a', fontWeight: isCurrent ? 900 : 700, fontSize: 18 }}>
                {s.score} points
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Sonderfall: Wenn aktueller Nutzer auf Platz 3 ist, zeige zusätzlich Platz 4 darunter */}
      {myRank === 3 && topSorted[3] && (
        <Box sx={{ mx: -3, mb: -3, mt: 0, background:'#c7ccda', borderBottomLeftRadius: 3, borderBottomRightRadius: 3, p: '6px 0', boxShadow: 'inset 0 2px 0 #b2b9c9' }}>
          <Box sx={{ display:'flex', flexDirection:'column', gap: 1, px: 2 }}>
            {(() => {
              const item = topSorted[3]; // rank 4 is index 3
              const isCurrent = item.user.id === currentUserId;
              return (
                <Box key={item.user.id}
                  sx={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    borderRadius: 2, p: '8px 16px', minHeight: 52, fontSize: 18, background:'#fff',
                    border: isCurrent ? '3px solid #000' : '2px solid #e1e6ea',
                    fontWeight: isCurrent ? 800 : 600,
                    boxShadow: isCurrent ? '0 2px 8px rgba(60,60,60,0.11)' : undefined,
                  }}
                >
                  <Box sx={{ minWidth: 32, display:'flex', alignItems:'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 18 }}>4.</Typography>
                  </Box>
                  <Box sx={{ mr: 1.5 }}>
                    <Avatar sx={{ width:38, height:38, borderRadius: 2, border: isCurrent ? '2.5px solid #222' : '2.5px solid #ddd', boxShadow: '0 1px 4px #0001' }}>
                      {item.user.name?.slice(0,1)}
                    </Avatar>
                  </Box>
                  <Box sx={{ flex:1, textAlign:'center', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#000' : '#21262b', fontSize: 18, letterSpacing: '.5px' }}>
                    {item.user.name}
                  </Box>
                  <Box sx={{ minWidth: 80, textAlign:'right', color: isCurrent ? '#222' : '#79869a', fontWeight: isCurrent ? 800 : 600, fontSize: 18 }}>
                    {item.score} points
                  </Box>
                </Box>
              );
            })()}
          </Box>
        </Box>
      )}

      {/* Untere Plätze: Kontext um aktuellen Nutzer (Rang-1 / Rang / Rang+1), ohne Top 3 duplizieren */}
      {myRank && myRank > 3 && contextRows.length > 0 && (
        <Box sx={{ mx: -3, mb: -3, mt: 0, background:'#c7ccda', borderBottomLeftRadius: 3, borderBottomRightRadius: 3, p: '6px 0', boxShadow: 'inset 0 2px 0 #b2b9c9' }}>
          <Box sx={{ display:'flex', flexDirection:'column', gap: 1, px: 2 }}>
            {contextRows.map(({ rank, item }) => {
              const isCurrent = item.user.id === currentUserId;
              return (
                <Box key={item.user.id}
                  sx={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    borderRadius: 2, p: '8px 16px', minHeight: 52, fontSize: 18, background:'#fff',
                    border: isCurrent ? '3px solid #000' : '2px solid #e1e6ea',
                    fontWeight: isCurrent ? 800 : 600,
                    boxShadow: isCurrent ? '0 2px 8px rgba(60,60,60,0.11)' : undefined,
                  }}
                >
                  <Box sx={{ minWidth: 32, display:'flex', alignItems:'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 18 }}>{rank}.</Typography>
                  </Box>
                  <Box sx={{ mr: 1.5 }}>
                    <Avatar sx={{ width:38, height:38, borderRadius: 2, border: isCurrent ? '2.5px solid #222' : '2.5px solid #ddd', boxShadow: '0 1px 4px #0001' }}>
                      {item.user.name?.slice(0,1)}
                    </Avatar>
                  </Box>
                  <Box sx={{ flex:1, textAlign:'center', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#000' : '#21262b', fontSize: 18, letterSpacing: '.5px' }}>
                    {item.user.name}
                  </Box>
                  <Box sx={{ minWidth: 80, textAlign:'right', color: isCurrent ? '#222' : '#79869a', fontWeight: isCurrent ? 800 : 600, fontSize: 18 }}>
                    {item.score} points
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}

import RefreshIcon from "@mui/icons-material/Refresh";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat().format(n);
  } catch {
    return String(n);
  }
}

/**
 * =============================
 * GraphQL wiring (with dummy fallback)
 * =============================
 */

type PublicUserInfo = { id: string; name: string };

type UserScore = { score: number; user: PublicUserInfo };

type Course = { id: string; title: string };

type CourseMembership = { courseId: string; course: Course };

type CurrentUser = {
  id: string;
  userName: string;
  courseMemberships: CourseMembership[];
};

type CourseLeaderboardPayload = {
  weekly: { userScores: UserScore[] }[];
  monthly: { userScores: UserScore[] }[];
  allTime: { userScores: UserScore[] }[];
};

/**
 * Minimal GraphQL types & client
 */
type GraphQLUserInfo = {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  courseMemberships: Array<{
    userId: string;
    courseId: string;
    role: string;
    course: { id: string; title: string };
    user: PublicUserInfo | null;
  }>;
};

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? "/api/graphql";

async function gqlRequest<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors && json.errors.length) {
    const msg = json.errors.map((e: any) => e.message).join("; ");
    throw new Error(msg);
  }
  return json.data as T;
}

/**
 * Returns a stable list of 2 demo courses, or (if configured) loads actual user info from GraphQL.
 */
async function fetchCurrentUserInfo(): Promise<CurrentUser> {
  // Try real GraphQL first, fall back to deterministic demo data
  const currentUserId = process.env.NEXT_PUBLIC_CURRENT_USER_ID; // expected to be a UUID string
  if (currentUserId) {
    try {
      const query = `
        query FindUserInfos($ids: [UUID!]!) {
          findUserInfos(ids: $ids) {
            id
            userName
            firstName
            lastName
            courseMemberships {
              userId
              courseId
              role
              course { id title }
              user { id name }
            }
          }
        }
      `;
      type Resp = { findUserInfos: (GraphQLUserInfo | null)[] };
      const data = await gqlRequest<Resp>(query, { ids: [currentUserId] });
      const u = data.findUserInfos?.[0];
      if (u) {
        return {
          id: u.id,
          userName: u.userName,
          courseMemberships: (u.courseMemberships ?? []).map((m) => ({
            courseId: m.courseId,
            course: { id: m.course.id, title: m.course.title },
          })),
        };
      }
    } catch (e) {
      console.warn("GraphQL findUserInfos failed, using demo fallback:", e);
    }
  }

  // === Demo fallback (fixed IDs/Names for consistency) ===
  await delay(400);
  return {
    id: DEMO_SELF_ID,
    userName: DEMO_SELF_NAME,
    courseMemberships: [
      { courseId: "course-101", course: { id: "course-101", title: "Web Engineering" } },
      { courseId: "course-202", course: { id: "course-202", title: "Software Design" } },
    ],
  };
}

/**
 * Create some deterministic-looking demo scores per course & timeframe.
 */
export async function fetchCourseLeaderboards(
  courseID: string,
  _date: string,
  currentUser: PublicUserInfo
): Promise<CourseLeaderboardPayload> {
  await delay(350);

  // Normalize current to demo IDs if applicable
  const normalizedCurrent: PublicUserInfo =
    currentUser.id === DEMO_SELF_ID
      ? { id: DEMO_SELF_ID, name: DEMO_SELF_NAME }
      : currentUser.id === DEMO_OTHER_ID
      ? { id: DEMO_OTHER_ID, name: DEMO_OTHER_NAME }
      : currentUser;

  // Always include counterpart so both users appear in public-profile leaderboards
  const counterpart: PublicUserInfo =
    normalizedCurrent.id === DEMO_SELF_ID
      ? { id: DEMO_OTHER_ID, name: DEMO_OTHER_NAME }
      : { id: DEMO_SELF_ID, name: DEMO_SELF_NAME };

  // Base dummy users (exclude the two fixed if present)
  const baseOthers: PublicUserInfo[] = [
    { id: `u-${courseID}-2`, name: "Bianca" },
    { id: `u-${courseID}-3`, name: "Chris" },
    { id: `u-${courseID}-4`, name: "Dee" },
    { id: `u-${courseID}-5`, name: "Evan" },
    { id: `u-${courseID}-6`, name: "Fatima" },
    { id: `u-${courseID}-7`, name: "Gina" },
    { id: `u-${courseID}-8`, name: "Hassan" },
    { id: `u-${courseID}-9`, name: "Iris" },
    { id: `u-${courseID}-10`, name: "Jon" },
    { id: `u-${courseID}-11`, name: "Kim" },
    { id: `u-${courseID}-12`, name: "Luca" },
  ].filter(u => u.id !== normalizedCurrent.id && u.id !== counterpart.id);

  let users: PublicUserInfo[] = [normalizedCurrent, counterpart, ...baseOthers];

  // Pseudo-random based on courseID
  const rng = mulberry32(hashString(courseID));
  const makeScores = () =>
    users.map((u, i) => ({
      user: u,
      score: Math.round((i + 1) * 100 * rng()),
    }));

  let weeklyScores = shuffle(makeScores(), rng);
  let monthlyScores = shuffle(makeScores(), rng).map((s) => ({ ...s, score: Math.round(s.score * 1.4) }));
  let allTimeScores = shuffle(makeScores(), rng).map((s) => ({ ...s, score: Math.round(s.score * 2.2) }));

  function forceUserRank(scores: { user: PublicUserInfo; score: number }[], userId: string, targetRank: number) {
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    const targetIndex = Math.max(0, Math.min(sorted.length - 1, targetRank - 1));
    const lowerBound = sorted[targetIndex]?.score ?? 0;
    const upperBound = sorted[targetIndex + 1]?.score ?? Math.max(0, lowerBound - 1);
    const desired = upperBound + Math.max(1, Math.floor((lowerBound - upperBound) / 2));
    const idx = scores.findIndex((s) => s.user.id === userId);
    if (idx >= 0) scores[idx] = { ...scores[idx], score: desired };
    return scores.sort((a, b) => b.score - a.score);
  }

  // Variant placements for the current player (demo):
  // - course-101 (Web Engineering): weekly 3, monthly 3, allTime 4
  // - course-202 (Software Design): weekly 3, monthly 4, allTime 3
  // Always put seconduser (DEMO_OTHER_ID) at rank 1 across all timeframes.
  const targetRanks = (cid: string) => {
    if (cid === "course-101") return { weekly: 2, monthly: 3, allTime: 4 } as const;
    if (cid === "course-202") return { weekly: 3, monthly: 3, allTime: 2 } as const;
    return { weekly: 2, monthly: 3, allTime: 4 } as const;
  };
  const tr = targetRanks(courseID);

  const weeklyForced = forceUserRank(
    forceUserRank(weeklyScores, DEMO_OTHER_ID, 1),
    normalizedCurrent.id, tr.weekly
  );
  const monthlyForced = forceUserRank(
    forceUserRank(monthlyScores, DEMO_OTHER_ID, 1),
    normalizedCurrent.id, tr.monthly
  );
  const allTimeForced = forceUserRank(
    forceUserRank(allTimeScores, DEMO_OTHER_ID, 1),
    normalizedCurrent.id, tr.allTime
  );

  return {
    weekly: [{ userScores: weeklyForced }],
    monthly: [{ userScores: monthlyForced }],
    allTime: [{ userScores: allTimeForced }],
  };
}

/** Helpers */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const hashString = (s: string) =>
  s.split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function rankOf(scores: UserScore[], userId: string): number | undefined {
  const sorted = [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const idx = sorted.findIndex((s) => s.user?.id === userId);
  return idx >= 0 ? idx + 1 : undefined;
}


/** Visual helpers */
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

/**
 * =============================
 * UI Components
 * =============================
 */

function RankChip({ label, value }: { label: string; value?: number }) {
  const color = value ? (value <= 3 ? "success" : value <= 10 ? "primary" : "default") : "default";
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

function ScoreBar({ me, top, label, fullIfGreater }: { me: number; top: number; label?: string; fullIfGreater?: boolean }) {
  const pctRaw = Math.round((me / Math.max(top, 1)) * 100);
  const pct = Math.max(0, Math.min(100, fullIfGreater && me >= top ? 100 : pctRaw));
  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 10, borderRadius: 999 }}
      />
      <Typography variant="caption" sx={{ mt: 0.5, display: "block", letterSpacing: 0.2 }}>
        {label ?? `Your score vs. course best (${me} / {top})`}
      </Typography>
    </Box>
  );
}

function UserRow({ rank, score, user, highlight = false }: { rank: number; score: number; user: PublicUserInfo; highlight?: boolean }) {
  const initials = useMemo(() => (user.name ? user.name.split(" ").map((p) => p[0]).join("") : "?"), [user.name]);
  return (
    <ListItem
      sx={{
        px: 1,
        py: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: highlight ? 'primary.main' : 'divider',
        boxShadow: highlight ? 3 : 0,
        bgcolor:
          rank === 1
            ? 'linear-gradient(90deg, rgba(255,215,0,0.22) 0%, rgba(255,255,255,0) 70%)'
            : rank === 2
            ? 'linear-gradient(90deg, rgba(192,192,192,0.22) 0%, rgba(255,255,255,0) 70%)'
            : rank === 3
            ? 'linear-gradient(90deg, rgba(205,127,50,0.22) 0%, rgba(255,255,255,0) 70%)'
            : 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          mr: 0.5,
          bgcolor: 'background.default',
        }}
      >
        {rank}
      </Box>

      <ListItemAvatar>
        <Avatar sx={{ fontWeight: 700 }}>{initials}</Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" noWrap fontWeight={highlight ? 800 : 600}>
              {user.name}
            </Typography>
            <Trophy rank={rank} />
          </Box>
        }
        secondary={<Typography variant="caption" sx={{ opacity: 0.8 }}>#{user.id.slice(0, 6)}</Typography>}
        sx={{ mr: 1 }}
      />

      <Box sx={{ ml: 'auto' }}>
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
  const topSorted = useMemo(() => [...scores].sort((a, b) => b.score - a.score), [scores]);
  const myRank = useMemo(() => rankOf(scores, currentUserId), [scores, currentUserId]);
  const myScore = topSorted.find((s) => s.user.id === currentUserId)?.score ?? 0;
  const best = topSorted[0]?.score ?? 0;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        borderColor: "divider",
        boxShadow: 0,
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 60%)",
      }}
    >
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={800} letterSpacing={0.2}>
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
            {timeframeLabel}
          </Typography>
        }
        action={
          <Tooltip title="Refresh">
            <span>
              <IconButton size="small" disabled>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        }
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <RankChip label="Rank" value={myRank} />
          <Chip size="small" label={`Players: ${scores.length}`} />
          <Chip size="small" label={`Best: ${best}`} />
        </Stack>
        <ScoreBar me={myScore} top={best} />
        <Divider sx={{ my: 1 }} />
        <List dense sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
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
      </CardContent>
    </Card>
  );
}

/**
 * =============================
 * Page Component (Dummy-backed)
 * =============================
 */

export default function ProfileLeaderboardPositions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [leaderboards, setLeaderboards] = useState<Record<string, CourseLeaderboardPayload>>({});

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch Relay user data for id/userName only
      let currentUserInfo: { id: string; userName: string };
      // Use the same GraphQL query as fetchCurrentUserInfo, but just get id/userName
      const currentUserId = process.env.NEXT_PUBLIC_CURRENT_USER_ID;
      if (currentUserId) {
        try {
          const query = `
            query FindUserInfos($ids: [UUID!]!) {
              findUserInfos(ids: $ids) {
                id
                userName
              }
            }
          `;
          type Resp = { findUserInfos: ({ id: string; userName: string } | null)[] };
          const data = await gqlRequest<Resp>(query, { ids: [currentUserId] });
          const u = data.findUserInfos?.[0];
          if (u) {
            currentUserInfo = { id: u.id, userName: u.userName };
          } else {
            throw new Error("No user found");
          }
        } catch (e) {
          // fallback to demo (fixed IDs/Names)
          currentUserInfo = { id: DEMO_SELF_ID, userName: DEMO_SELF_NAME };
        }
      } else {
        // no env provided -> demo self
        currentUserInfo = { id: DEMO_SELF_ID, userName: DEMO_SELF_NAME };
      }
      // Always get courseMemberships from the dummy/demo function
      const me = {
        id: currentUserInfo.id,
        userName: currentUserInfo.userName,
        courseMemberships: (await fetchCurrentUserInfo()).courseMemberships,
      };
      setUser(me);

      const data: Record<string, CourseLeaderboardPayload> = {};
      for (const m of me.courseMemberships) {
        data[m.courseId] = await fetchCourseLeaderboards(
          m.courseId,
          today,
          { id: me.id, name: me.userName }
        );
      }
      setLeaderboards(data);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography color="error" gutterBottom>
          Failed to load leaderboard demo
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Chip label="Retry" onClick={load} clickable />
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Your leaderboard positions
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        General Overview of your current leaderboard positions across courses.
        <br />
        Use the tabs to switch between different timeframes.  
      </Typography>

      <Grid container spacing={2}>
        {user.courseMemberships.map((m) => {
          const lb = leaderboards[m.courseId];
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
                currentUserId={user.id}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}