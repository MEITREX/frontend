import type { LeaderboardWidgetQuery } from "@/__generated__/LeaderboardWidgetQuery.graphql";
import React, { useEffect, useMemo, useRef } from "react";
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useRelayEnvironment,
} from "react-relay";
//import defaultUserImage from "../../assets/logo.svg";
import { LeaderboardWidgetRowInventoryByUserQuery } from "@/__generated__/LeaderboardWidgetRowInventoryByUserQuery.graphql";
import { LeaderboardWidgetRowPublicInfoQuery } from "@/__generated__/LeaderboardWidgetRowPublicInfoQuery.graphql";
import { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";
import defaultUserImage from "@/assets/logo.svg";
import { getPublicProfileItemsMergedCustomID } from "@/components/items/logic/GetItems";
import WidgetFeedback from "@/components/widgets/common/WidgetFeedback";
import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";

interface Props {
  courseID: string;
  date?: string;
  currentUserID: string;
  openFeedback?: boolean;
  category?: GamificationCategory;
}

// Helpers to compute correct dates for backend
const toLocalISODate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const startOfWeekMonday = (date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const LeaderboardWidget: React.FC<Props> = ({
  courseID,
  date,
  currentUserID,
  openFeedback,
  category,
}) => {
  // Compute the date we have to send (must be the Monday of the week)
  const weeklyDateISO = useMemo(() => {
    // Always normalize to Monday of the week (local time)
    const base = date ? new Date(date) : new Date();
    return toLocalISODate(startOfWeekMonday(base));
  }, [date]);

  const data = useLazyLoadQuery<LeaderboardWidgetQuery>(
    graphql`
      query LeaderboardWidgetQuery($courseID: ID!, $date: String!) {
        weekly: getWeeklyCourseLeaderboards(courseID: $courseID, date: $date) {
          startDate
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
    `,
    { courseID: courseID ?? "", date: weeklyDateISO }
  );

  const InventoryByUserQuery = graphql`
    query LeaderboardWidgetRowInventoryByUserQuery($userIds: [UUID!]!) {
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

  const PublicInfoQuery = graphql`
    query LeaderboardWidgetRowPublicInfoQuery($id: [UUID!]!) {
      findUserInfos(ids: $id) {
        nickname
      }
    }
  `;

  const weeklyList = data.weekly ?? [];
  const selectedWeekly =
    weeklyList.find((lb) => lb?.startDate?.slice(0, 10) === weeklyDateISO) ||
    weeklyList[0];
  const rawScores = selectedWeekly?.userScores ?? [];
  const noData = rawScores.length === 0;

  const sorted = React.useMemo(
    () => [...rawScores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
    [rawScores]
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !currentRef.current) return;
    if (!sorted.length) return;
    const parent = containerRef.current;
    const target = currentRef.current;
    parent.scrollTop =
      target.offsetTop - parent.clientHeight / 2 + target.clientHeight / 2;
  }, [sorted]);

  const topThree = sorted.slice(0, 3);
  const userIndex = sorted.findIndex((us) => us.user?.id === currentUserID);
  const noCourse = !courseID;

  let windowList: typeof sorted = [];
  if (userIndex === -1) {
    // current user not found, show ranks 4 to 8
    windowList = sorted.slice(3, 8);
  } else if (userIndex < 3) {
    // current user is in top 3, show ranks 4 and 5 (2 after 3rd)
    windowList = sorted.slice(3, 5);
  } else if (userIndex >= 3 && userIndex <= 4) {
    // current user is 4th or 5th, show from rank 4 to userIndex+2
    windowList = sorted.slice(3, userIndex + 3);
  } else {
    // show 2 before and 2 after current user
    const start = Math.max(0, userIndex - 2);
    windowList = sorted.slice(start, userIndex + 3);
  }

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

  const ids = useMemo(() => {
    const arr = sorted.map((u) => u.user?.id).filter(Boolean) as string[];

    return Array.from(new Set(arr)).sort();
  }, [sorted]);

  const idsKey = useMemo(() => ids.join("|"), [ids]);

  useEffect(() => {
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
        // 2) Einmalige batched Requests
        const [invRes, nickRes] = await Promise.all([
          fetchQuery<LeaderboardWidgetRowInventoryByUserQuery>(
            env,
            InventoryByUserQuery,
            { userIds: ids }
          ).toPromise(),
          fetchQuery<LeaderboardWidgetRowPublicInfoQuery>(
            env,
            PublicInfoQuery,
            { id: ids }
          ).toPromise(),
        ]);

        if (cancelled) return;

        // Maps aufbauen
        const picsMap: Record<string, Asset | null> = {};
        const framesMap: Record<string, Asset | null> = {};
        const colorsMap: Record<string, ColorTheme | null> = {};
        const patternsMap: Record<string, PatternTheme | null> = {};
        const nicksMap: Record<string, string | null> = {};

        const invList = invRes?.inventoriesForUsers ?? [];
        for (const inv of invList) {
          const uid = inv?.userId ?? "";
          const items = inv?.items ?? [];
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

          picsMap[uid] = pics.find((it: any) => it.equipped) ?? null;
          framesMap[uid] = frames.find((it: any) => it.equipped) ?? null;
          colorsMap[uid] = colors.find((it: any) => it.equipped) ?? null;
          patternsMap[uid] = patterns.find((it: any) => it.equipped) ?? null;
        }

        const infos = nickRes?.findUserInfos ?? [];
        // Falls findUserInfos nicht in gleicher Reihenfolge zurückkommt:
        for (let i = 0; i < infos.length; i++) {
          const info = infos[i];
          // Du brauchst hier ggf. die ID im Payload.
          // Wenn sie nicht enthalten ist, musst du via Position/ids[i] mappen:
          const uid = ids[i] ?? "";
          nicksMap[uid] = info?.nickname ?? null;
        }

        // Optional: nur setState, wenn sich wirklich was geändert hat (shallow compare)
        setUserProfilePics((prev) => (prev === picsMap ? prev : picsMap));
        setUserProfileFrames((prev) => (prev === framesMap ? prev : framesMap));
        setUserColorThemes((prev) => (prev === colorsMap ? prev : colorsMap));
        setUserPatternThemes((prev) =>
          prev === patternsMap ? prev : patternsMap
        );
        setUserNickname((prev) => (prev === nicksMap ? prev : nicksMap));
      } catch (e) {
        console.warn("[Leaderboard] batched fetch failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [idsKey, env]); // <— nicht an 'ids' (Array-Ref), sondern an stabilen Schlüssel

  console.log(userProfilePics, userProfileFrames);

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

  return (
    <WidgetWrapper
      title="Leaderboard"
      linkHref="/profile/leaderboard"
      linkLabel="Leaderboards"
      overflow="auto"
    >
      <WidgetFeedback openFeedback={openFeedback} category={category} />
      {noCourse ? (
        <div style={{ padding: 8, color: "#666" }}>No course selected.</div>
      ) : noData ? (
        <div style={{ padding: 8, color: "#666" }}>
          No leaderboard data for {weeklyDateISO}.
        </div>
      ) : (
        <>
          <div style={{ width: "100%" }}>
            {topThree.map((us, idx) => (
              <div
                key={us.user?.id ?? idx}
                style={userCardStyle(us.user?.id ?? "",{
                  display: "flex",
                  alignItems: "center",
                  border:
                    idx === 0
                      ? "2px solid gold"
                      : idx === 1
                      ? "2px solid silver"
                      : "2px solid peru",
                  borderRadius: 6,
                  padding: "6px 8px",
                  marginBottom: 4,
                  height: 36,
                })}
              >
                <span style={{ marginRight: 8, width: 20, textAlign: "right" }}>
                  {idx + 1}.
                </span>
                <div
                  style={{
                    position: "relative",
                    width: 24,
                    height: 24,
                    marginRight: 8,
                    border: "0px solid #ddd",
                    objectFit: "cover",
                    boxShadow: "0 1px 5px #0001",
                  }}
                >
                  {assetSrc(userProfileFrames[us.user?.id ?? ""]) && (
                    <img
                      src={assetSrc(userProfileFrames[us.user?.id ?? ""])}
                      alt={us.user?.id}
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
                      assetSrc(userProfilePics[us.user?.id ?? ""], defaultUserImage.src)!
                    }
                    alt={us.user?.id}
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
                <span style={{ fontWeight: 600 }}>
                  {userNickname[us.user?.id ?? ""] ??
                    us.user?.name ??
                    "Unknown"}
                </span>
                <span style={{ marginLeft: "auto" }}>{us.score}</span>
              </div>
            ))}
          </div>

          <div
            ref={containerRef}
            style={{
              marginTop: 12,
              maxHeight: 160,
              overflowY: "auto",
              width: "100%",
            }}
          >
            {windowList.map((us, idx) => {
              const rank =
                sorted.findIndex((item) => item.user?.id === us.user?.id) + 1;
              const isCurrent = us.user?.id === currentUserID;
              return (
                <div
                  key={us.user?.id ?? `row-${idx}`}
                  ref={isCurrent ? currentRef : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    height: 32,
                    background: isCurrent ? "#eef" : "transparent",
                    border: isCurrent ? "2px solid #000" : "none",
                    borderRadius: 2,
                    marginBottom: 2,
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ width: 20, textAlign: "right" }}>{rank}.</span>
                  <div
                  style={{
                    position: "relative",
                    width: 24,
                    height: 24,
                    margin: "0 auto 10px",
                    border: "0px solid #ddd",
                    objectFit: "cover",
                    boxShadow: "0 1px 5px #0001",
                  }}
                >
                  {assetSrc(userProfileFrames[us.user?.id ?? ""]) && (
                    <img
                      src={assetSrc(userProfileFrames[us.user?.id ?? ""])}
                      alt={us.user?.id}
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
                      assetSrc(userProfilePics[us.user?.id ?? ""], defaultUserImage.src)!
                    }
                    alt={us.user?.id}
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
                  <span style={{ flex: 1, textAlign: "left" }}>
                    {userNickname[us.user?.id ?? ""] ??
                      us.user?.name ??
                      "Unknown"}
                  </span>
                  <span style={{ marginLeft: 8 }}>{us.score}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </WidgetWrapper>
  );
};

export default LeaderboardWidget;
