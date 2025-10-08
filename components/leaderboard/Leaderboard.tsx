"use client";

`use client`;
import { LeaderboardDataQuery } from "@/__generated__/LeaderboardDataQuery.graphql";

import { LeaderboardRowInventoryByUserQuery } from "@/__generated__/LeaderboardRowInventoryByUserQuery.graphql";
import { LeaderboardRowPublicInfoQuery } from "@/__generated__/LeaderboardRowPublicInfoQuery.graphql";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from "react-relay";
import defaultUserImage from "../../assets/logo.svg";
import { HoverCard } from "../HoverCard";
import { getPublicProfileItemsMergedCustomID } from "../items/logic/GetItems";

const buildProfileHref = (id: string) => `/profile/${id}`;

// Format today's date as YYYY-MM-DD in the user's local timezone (not UTC)
function formatLocalISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Return Monday (start of week) for a given date in local time
function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0=Sun,1=Mon,...
  const diff = day === 0 ? -6 : 1 - day; // if Sunday -> back 6 days, else back to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

// Return the first day of the month for a given date in local time
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Return Monday (start of LAST week) for a given date in local time
function startOfLastWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // go to this week's Monday first
  const thisWeekMonday = startOfWeekMonday(d);
  // then go back 7 days to land in last week's Monday
  thisWeekMonday.setDate(thisWeekMonday.getDate() - 7);
  return thisWeekMonday;
}

// dd.MM.yyyy formatting used for labels
function formatDE(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// 1. Pokal-SVGs definieren (angepasste Größe: 30x30 statt 36x36)
const trophies = [
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
  // Silber
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

export type User = {
  id: string;
  name: string;
  points: number;
  rank: number;
  profileImage?: string;
  backgroundImage?: string;
  isCurrentUser?: boolean;
};

export type LeaderboardProps = {
  title: string;
  periodLabel: string;
  onPrevious: () => void;
  period: "weekly" | "monthly" | "allTime";
};

export default function Leaderboard({
  title,
  periodLabel,
  onPrevious,
  period,
}: LeaderboardProps) {
  // Always call all hooks at the top in the same order
  const params = useParams();
  // Accept both `[courseId]` and `[courseID]` route params for robustness
  const courseID =
    (params?.courseID as string | undefined) ??
    (params?.courseId as string | undefined);
  const searchParams = useSearchParams();
  const currentUserRef = React.useRef<HTMLDivElement | null>(null);
  const othersContainerRef = React.useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  // New Relay query for all leaderboard periods (always declared)
  const LeaderboardDataQuery = graphql`
    query LeaderboardDataQuery($courseID: ID!, $date: String!) {
      weekly: getWeeklyCourseLeaderboards(courseID: $courseID, date: $date) {
        id
        title
        startDate
        period
        userScores {
          id
          score
          user {
            refUserID
            name
          }
        }
      }
      monthly: getMonthlyCourseLeaderboards(courseID: $courseID, date: $date) {
        id
        title
        startDate
        period
        userScores {
          id
          score
          user {
            refUserID
            name
          }
        }
      }
      allTime: getAllTimeCourseLeaderboards(courseID: $courseID, date: $date) {
        id
        title
        startDate
        period
        userScores {
          id
          score
          user {
            refUserID
            name
          }
        }
      }
      currentUserInfo {
        id
      }
    }
  `;

  const PublicInfoQuery = graphql`
    query LeaderboardRowPublicInfoQuery($id: [UUID!]!) {
      findUserInfos(ids: $id) {
        nickname
      }
    }
  `;

  const InventoryByUserQuery = graphql`
    query LeaderboardRowInventoryByUserQuery($userIds: [UUID!]!) {
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
  `;

  function getAvatarSrc(
    pics: Record<string, Asset | null>,
    userId: string,
    fallback: string
  ) {
    const pic = pics[userId];
    const raw = typeof pic === "string" ? pic : pic?.url ?? pic?.id;
    if (!raw) return fallback;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  // Allow optional ?date=YYYY-MM-DD override via URL, otherwise use local date
  const overrideDate = searchParams?.get("date");
  const base = overrideDate ? new Date(overrideDate) : new Date();
  let normalized;
  if (period === "weekly") {
    normalized = startOfWeekMonday(base);
  } else if (period === "monthly") {
    normalized = startOfMonth(base);
  } else if (period === "allTime") {
    // Für allTime immer den ersten Tag des Monats verwenden
    normalized = startOfMonth(base);
  } else {
    normalized = startOfLastWeekMonday(base);
  }
  const date = formatLocalISODate(normalized);

  // Always call useLazyLoadQuery unconditionally, even if courseID is missing.
  // To satisfy React hook rules (hooks must always be called in the same order, not conditionally),
  // we provide a fallback value for courseID (empty string) if not present.
  // We handle the UI rendering for missing courseID separately below.
  const variables = { courseID: courseID ?? "", date } as const;
  // Debug to verify the actual variables we send (see browser devtools)
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[Leaderboard] querying with", variables);
  }

  const data = useLazyLoadQuery<LeaderboardDataQuery>(
    LeaderboardDataQuery,
    variables,
    { fetchPolicy: "network-only" }
  );

  // Derive a period label from server data (startDate/period) for accurate ranges
  const firstLeaderboard =
    period === "weekly"
      ? data?.weekly?.[0]
      : period === "monthly"
      ? data?.monthly?.[0]
      : data?.allTime?.[0];

  const computedPeriodLabel = firstLeaderboard?.startDate
    ? (() => {
        const start = new Date(firstLeaderboard.startDate as unknown as string);
        if (firstLeaderboard.period === "WEEKLY") {
          const end = new Date(start);
          end.setDate(end.getDate() + 6);
          return `${formatDE(start)} — ${formatDE(end)}`;
        }
        if (firstLeaderboard.period === "MONTHLY") {
          return start.toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          });
        }
        return "All time";
      })()
    : periodLabel;

  // Scores depend on data, but keep logic unchanged
  const raw = React.useMemo(() => {
    if (period === "weekly") return data?.weekly ?? [];
    if (period === "monthly") return data?.monthly ?? [];
    if (period === "allTime") {
      // Wähle das Leaderboard mit den meisten User-Scores
      const all = data?.allTime ?? [];
      if (all.length === 0) return [];
      return [
        all.reduce(
          (best, curr) =>
            (curr.userScores?.length ?? 0) > (best.userScores?.length ?? 0)
              ? curr
              : best,
          all[0]
        ),
      ];
    }
    return [];
  }, [data, period]);

  const rawScores = React.useMemo(
    () => (raw.length > 0 && raw[0]?.userScores ? raw[0].userScores : []),
    [raw]
  );

  const scores = React.useMemo(
    () => [...rawScores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [rawScores]
  );

  const mapUserId = (user: any): string => {
    return user?.refUserID ?? user?.id ?? "";
  };

  // displayUsers logic unchanged
  const displayUsers = React.useMemo(
    () =>
      scores
        .filter((us) => us.user)
        .map((us, idx) => {
          const user = us.user!;
          const userId = mapUserId(user);
          return {
            id: userId,
            name: user.name ?? "Unknown",
            points: us.score ?? 0,
            rank: idx + 1,
            isCurrentUser: userId === data?.currentUserInfo?.id,
            profileImage: undefined,
            backgroundImage: undefined,
          };
        }),
    [scores, data?.currentUserInfo?.id]
  );
  const topThree = React.useMemo(
    () => displayUsers.filter((u) => u.rank <= 3),
    [displayUsers]
  );
  const others = React.useMemo(
    () => displayUsers.filter((u) => u.rank > 3),
    [displayUsers]
  );

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

  const [userProfilePics, setUserProfilePics] = React.useState<
    Record<string, Asset | null>
  >({});
  const [userProfileFrames, setUserProfileFrames] = React.useState<
    Record<string, Asset | null>
  >({});
  const [userColorThemes, setUserColorThemes] = React.useState<
    Record<string, ColorTheme | null>
  >({});
  const [userPatternThemes, setUserPatternThemes] = React.useState<
    Record<string, PatternTheme | null>
  >({});
  const [userNickname, setUserNickname] = React.useState<
    Record<string, string | null>
  >({});

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

  const env = useRelayEnvironment();

  const idsMemo = React.useMemo(() => {
    return Array.from(new Set(displayUsers.map((u) => u.id).filter(Boolean)));
  }, [displayUsers]);

  React.useEffect(() => {
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
              InventoryByUserQuery,
              { userIds: [userId] }
            ).toPromise();

            // Public Info Query
            const dataNick = await fetchQuery<LeaderboardRowPublicInfoQuery>(
              env,
              PublicInfoQuery,
              { id: [userId] }
            ).toPromise();

            // je nach Schema das erste Element nehmen:
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
        console.warn("[Leaderboard] per-user inventory fetch failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idsMemo]);

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

    const fg = col?.foreColor ?? pat?.foreColor; // ← wichtig: Pattern-Foreground berücksichtigen
    if (fg) style.color = fg;

    return style;
  }

  React.useEffect(() => {
    if (currentUserRef.current && othersContainerRef.current) {
      const parent = othersContainerRef.current;
      const target = currentUserRef.current;
      const pr = parent.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      parent.scrollTop +=
        tr.top - pr.top - parent.clientHeight / 2 + target.clientHeight / 2;
    }
  }, [displayUsers]);

  if (!courseID) {
    // UI handling for missing courseID, even though Relay hook is still called above.
    return <div>Kein Kurs ausgewählt!</div>;
  }

  return (
    <div
      style={{
        background: "#dde3ec",
        borderRadius: 24,
        padding: 24,
        width: "100%",
        maxWidth: 760,
        minHeight: "65vh",
        margin: "0 auto",
        fontFamily: '"Roboto", "Arial", sans-serif',
        boxShadow: "0 2px 32px rgba(80,80,80,0.13)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {/* Kopfbereich */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div style={{ flex: "none" }}>
          <button
            onClick={onPrevious}
            style={{
              background: "#f8fafc",
              border: "1px solid #d8dee3",
              borderRadius: 10,
              padding: "7px 14px 7px 10px",
              display: "flex",
              alignItems: "center",
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
              gap: 8,
              boxShadow: "0 1px 2px rgba(80,80,80,0.07)",
            }}
          >
            <span role="img" aria-label="Clock">
              ⏰
            </span>{" "}
            PREVIOUS
          </button>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: ".7px",
              width: "100%",
              textShadow: "0 2px 12px #fff7",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 17,
              letterSpacing: ".7px",
              color: "inherit",
              width: "100%",
            }}
          >
            {computedPeriodLabel}
          </div>
        </div>
        <div style={{ flex: "none", width: 60 }} />
      </div>

      {/* Top 3 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "0 0 16px",
          position: "relative",
          zIndex: 2,
          boxShadow: "0 8px 32px -4px rgba(80,80,120,0.13)",
        }}
      >
        {topThree.map((user, idx) => {
          const isCurrent = user.isCurrentUser;
          const goProfile = () => router.push(buildProfileHref(user.id));

          return (
            <HoverCard
              key={user.id}
              background={
                userColorThemes[user.id]?.backColor ??
                assetSrc(userPatternThemes[user.id]) ??
                "#ffffff"
              }
              foreground={
                userColorThemes[user.id]?.foreColor ??
                userColorThemes[user.id]?.foreColor ??
                "#000000ff"
              }
              nickname={userNickname[user.id] ?? "Unkown"}
              patternThemeBool={userPatternThemes[user.id]?.url != null}
              frameBool={assetSrc(userProfileFrames[user.id]) != null}
              frame={assetSrc(userProfileFrames[user.id]) ?? "Unknown"}
              profilePic={
                assetSrc(userProfilePics[user.id], defaultUserImage.src)! ??
                "Unkown"
              }
            >
              <div
                onClick={goProfile}
                style={userCardStyle(user.id, {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 14,
                  padding: "8px 18px",
                  cursor: "pointer",
                  minHeight: 60,
                  fontSize: 18,
                  background:
                    idx === 0
                      ? "linear-gradient(90deg,#f9f9f9 60%,#fff4cc 100%)" // goldstich
                      : idx === 1
                      ? "linear-gradient(90deg,#f0f0f0 60%,#e0e0e0 100%)" // silberstich
                      : "linear-gradient(90deg,#e6e6e6 60%,#e4d0c1 100%)", // bronzestich
                  border: isCurrent ? "3px solid #222" : "0px solid #e1e6ea",
                  fontWeight: isCurrent ? 900 : 700,
                  boxShadow: isCurrent
                    ? "0 2px 12px rgba(40,40,40,0.13)"
                    : undefined,
                  marginBottom: 0,
                })}
                tabIndex={0}
              >
                {/* Rank number */}
                <div
                  style={{
                    minWidth: 24,
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: isCurrent ? 900 : 700,
                    color: userCardStyle(user.id).color,
                  }}
                >
                  {user.rank}.
                </div>
                {/* Profilbild */}
                <div
                  style={{
                    position: "relative",
                    width: 48,
                    height: 48,
                    margin: "0 auto 10px",
                    border: isCurrent ? "3px solid #222" : "0px solid #ddd",
                    objectFit: "cover",
                    boxShadow: "0 1px 5px #0001",
                  }}
                >
                  {assetSrc(userProfileFrames[user.id]) && (
                    <img
                      src={assetSrc(userProfileFrames[user.id])}
                      alt={user.id}
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

                  {/* Profilbild */}
                  <img
                    src={
                      assetSrc(userProfilePics[user.id], defaultUserImage.src)!
                    }
                    alt={user.id}
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
                </div>
                {/* Trophy + Username */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontWeight: isCurrent ? 900 : 700,
                    color: userCardStyle(user.id).color,
                    fontSize: 18,
                    letterSpacing: ".5px",
                  }}
                >
                  {trophies[idx]}
                  {userNickname[user.id] ?? "Unkown"}
                </div>
                {/* Punkte */}
                <div
                  style={{
                    minWidth: 80,
                    textAlign: "right",
                    color: userCardStyle(user.id).color,
                    fontWeight: isCurrent ? 900 : 700,
                    fontSize: 18,
                  }}
                >
                  {user.points} points
                </div>
              </div>
            </HoverCard>
          );
        })}
      </div>

      {/* Untere Plätze */}
      <div
        ref={othersContainerRef}
        style={{
          margin: "0 -24px -24px -24px",
          background: "#c7ccda",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          padding: "18px 0",
          boxShadow: "inset 0 2px 0 #b2b9c9",
          maxHeight: "50vh",
          overflowY: others.length > 0 ? "auto" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "0 16px",
          }}
        >
          {others.map((user) => {
            const isCurrent = user.isCurrentUser;
            const goProfile = () => router.push(buildProfileHref(user.id));

            return (
              <HoverCard
                key={user.id}
                background={
                  userColorThemes[user.id]?.backColor ??
                  assetSrc(userPatternThemes[user.id]) ??
                  "#ffffff"
                }
                foreground={
                  userColorThemes[user.id]?.foreColor ??
                  userColorThemes[user.id]?.foreColor ??
                  "#000000ff"
                }
                nickname={userNickname[user.id] ?? "Unkown"}
                patternThemeBool={userPatternThemes[user.id]?.url != null}
                frameBool={assetSrc(userProfileFrames[user.id]) != null}
                frame={assetSrc(userProfileFrames[user.id]) ?? "Unknown"}
                profilePic={
                  assetSrc(userProfilePics[user.id], defaultUserImage.src)! ??
                  "Unkown"
                }
              >
                <div
                  onClick={goProfile}
                  ref={isCurrent ? currentUserRef : undefined}
                  style={userCardStyle(user.id, {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 14,
                    padding: "8px 18px",
                    minHeight: 60,
                    fontSize: 18,
                    cursor: "pointer",
                    border: isCurrent ? "3px solid #222" : "0px solid #e1e6ea",
                    fontWeight: isCurrent ? 900 : 700,
                    boxShadow: isCurrent
                      ? "0 2px 12px rgba(40,40,40,0.13)"
                      : undefined,
                    marginBottom: 0,
                  })}
                  tabIndex={0}
                >
                  <div
                    style={{
                      minWidth: 32,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 24,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: isCurrent ? 900 : 700,
                        color: userCardStyle(user.id).color,
                      }}
                    >
                      {user.rank}.
                    </div>
                    {/* Profilbild */}
                    <div
                      style={{
                        position: "relative",
                        width: 48,
                        height: 48,
                        margin: "0 auto 10px",
                        border: isCurrent ? "3px solid #222" : "0px solid #ddd",
                        objectFit: "cover",
                        boxShadow: "0 1px 5px #0001",
                      }}
                    >
                      {assetSrc(userProfileFrames[user.id]) && (
                        <img
                          src={assetSrc(userProfileFrames[user.id])}
                          alt={user.id}
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

                      {/* Profilbild */}
                      <img
                        src={
                          assetSrc(
                            userProfilePics[user.id],
                            defaultUserImage.src
                          )!
                        }
                        alt={user.id}
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
                    </div>
                  </div>

                  {/* Trophy + Username */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontWeight: isCurrent ? 900 : 700,
                      color: userCardStyle(user.id).color,
                      fontSize: 18,
                      letterSpacing: ".5px",
                    }}
                  >
                    {userNickname[user.id] ?? "Unkown"}
                  </div>

                  <div
                    style={{
                      minWidth: 80,
                      textAlign: "right",
                      color: userCardStyle(user.id).color,
                      fontWeight: isCurrent ? 800 : 600,
                      fontSize: 18,
                    }}
                  >
                    {user.points} points
                  </div>
                </div>
              </HoverCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
