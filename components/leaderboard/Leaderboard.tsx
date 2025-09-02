import { useParams } from "next/navigation";
import React from "react";
import type { StaticImageData } from "next/image";
import defaultUserImage from "../../assets/logo.svg";
import { HoverCard } from "../HoverCard";
import { graphql, useLazyLoadQuery } from "react-relay";
import { LeaderboardDataQuery } from "@/__generated__/LeaderboardDataQuery.graphql";

function getImageSrc(image?: string | StaticImageData): string {
  if (typeof image === "string") {
    return image;
  }
  if (image && typeof image === "object" && "src" in image) {
    return image.src;
  }
  return defaultUserImage.src;
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
  // courseID may be undefined, but we need to always call Relay hooks unconditionally (see below).
  const courseID = params?.courseId as string | undefined;
  const currentUserRef = React.useRef<HTMLDivElement | null>(null);
  const othersContainerRef = React.useRef<HTMLDivElement | null>(null);

  // New Relay query for all leaderboard periods (always declared)
  const LeaderboardDataQuery = graphql`
    query LeaderboardDataQuery($courseID: ID!, $date: String!) {
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
      monthly: getMonthlyCourseLeaderboards(courseID: $courseID, date: $date) {
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
      allTime: getAllTimeCourseLeaderboards(courseID: $courseID, date: $date) {
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
  `;

  // derive date as ISO yyyy-mm-dd
  const date = new Date().toISOString().slice(0, 10);

  // Always call useLazyLoadQuery unconditionally, even if courseID is missing.
  // To satisfy React hook rules (hooks must always be called in the same order, not conditionally),
  // we provide a fallback value for courseID (empty string) if not present.
  // We handle the UI rendering for missing courseID separately below.
  const data = useLazyLoadQuery<LeaderboardDataQuery>(LeaderboardDataQuery, {
    courseID: courseID ?? "",
    date,
  });

  // Scores depend on data, but keep logic unchanged
  const raw =
    period === "weekly"
      ? data?.weekly
      : period === "monthly"
      ? data?.monthly
      : data?.allTime;
  const scores =
    raw && raw.length > 0 && raw[0]?.userScores
      ? [...raw[0].userScores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      : [];

  // displayUsers logic unchanged
  const displayUsers: User[] = scores
    .filter((us) => us.user)
    .map((us, idx) => {
      const user = us.user!;
      return {
        id: user.id,
        name: user.name ?? "Unknown",
        points: us.score ?? 0,
        rank: idx + 1,
        isCurrentUser: user.id === data?.currentUserInfo?.id,
        profileImage: undefined,
        backgroundImage: undefined,
      };
    });
  const topThree = displayUsers.filter((u) => u.rank <= 3);
  const others = displayUsers.filter((u) => u.rank > 3);

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
              color: "#79869a",
              width: "100%",
            }}
          >
            {periodLabel}
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
          return (
            <HoverCard
              key={user.id}
              card={
                <div>
                  <img
                    src={getImageSrc(user.profileImage)}
                    alt={user.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      objectFit: "cover",
                      margin: "0 auto 10px",
                      boxShadow: "0 2px 8px #0001",
                    }}
                  />
                  <div
                    style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}
                  >
                    {user.name}
                  </div>
                  <div style={{ fontSize: 16, color: "#79869a" }}>
                    Points: {user.points}
                  </div>
                  <div style={{ fontSize: 15, color: "#a1a6b2", marginTop: 8 }}>
                    Profilinfos folgen…
                  </div>
                </div>
              }
              position="bottom"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 14,
                  padding: "8px 18px",
                  minHeight: 60,
                  fontSize: 18,
                  background:
                    idx === 0
                      ? "linear-gradient(90deg,#f9f9f9 60%,#fff4cc 100%)" // goldstich
                      : idx === 1
                      ? "linear-gradient(90deg,#f0f0f0 60%,#e0e0e0 100%)" // silberstich
                      : "linear-gradient(90deg,#e6e6e6 60%,#e4d0c1 100%)", // bronzestich
                  border: isCurrent ? "3px solid #222" : "2px solid #e1e6ea",
                  fontWeight: isCurrent ? 900 : 700,
                  boxShadow: isCurrent
                    ? "0 2px 12px rgba(40,40,40,0.13)"
                    : undefined,
                  marginBottom: 0,
                }}
                tabIndex={0}
              >
                {/* Rank number */}
                <div
                  style={{
                    minWidth: 24,
                    textAlign: "center",
                    fontSize: 18,
                    fontWeight: isCurrent ? 900 : 700,
                  }}
                >
                  {user.rank}.
                </div>
                {/* Profilbild */}
                <div style={{ marginRight: 12 }}>
                  <img
                    src={getImageSrc(user.profileImage)}
                    alt={user.name}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: isCurrent ? "3px solid #222" : "2px solid #ddd",
                      objectFit: "cover",
                      boxShadow: "0 1px 5px #0001",
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
                    color: isCurrent ? "#0b0b0b" : "#2f3541",
                    fontSize: 18,
                    letterSpacing: ".5px",
                  }}
                >
                  {trophies[idx]}
                  {user.name}
                </div>
                {/* Punkte */}
                <div
                  style={{
                    minWidth: 80,
                    textAlign: "right",
                    color: isCurrent ? "#222" : "#79869a",
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
            return (
              <HoverCard
                key={user.id}
                card={
                  <div>
                    <img
                      src={getImageSrc(user.profileImage)}
                      alt={user.name}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        objectFit: "cover",
                        margin: "0 auto 10px",
                        boxShadow: "0 2px 8px #0001",
                      }}
                    />
                    <div
                      style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}
                    >
                      {user.name}
                    </div>
                    <div style={{ fontSize: 16, color: "#79869a" }}>
                      Points: {user.points}
                    </div>
                    <div
                      style={{ fontSize: 14, color: "#a1a6b2", marginTop: 6 }}
                    >
                      Profilinfos folgen…
                    </div>
                  </div>
                }
                position="bottom"
              >
                <div
                  ref={isCurrent ? currentUserRef : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 12,
                    padding: "8px 16px",
                    minHeight: 60,
                    fontSize: 18,
                    background: "#fff",
                    border: isCurrent ? "3px solid #000" : "2px solid #e1e6ea",
                    fontWeight: isCurrent ? 800 : 600,
                    boxShadow: isCurrent
                      ? "0 2px 8px rgba(60,60,60,0.11)"
                      : undefined,
                    cursor: "pointer",
                    backgroundImage: user.backgroundImage
                      ? `url(${user.backgroundImage})`
                      : undefined,
                    backgroundSize: user.backgroundImage ? "cover" : undefined,
                    backgroundRepeat: user.backgroundImage
                      ? "repeat"
                      : undefined,
                  }}
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
                    <span style={{ fontSize: 18 }}>{user.rank}.</span>
                  </div>
                  <div style={{ marginRight: 12 }}>
                    <img
                      src={getImageSrc(user.profileImage)}
                      alt={user.name}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        border: isCurrent
                          ? "2.5px solid #222"
                          : "2.5px solid #ddd",
                        objectFit: "cover",
                        boxShadow: "0 1px 4px #0001",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? "#000" : "#21262b",
                      fontSize: 18,
                      letterSpacing: ".5px",
                    }}
                  >
                    {user.name}
                  </div>
                  <div
                    style={{
                      minWidth: 80,
                      textAlign: "right",
                      color: isCurrent ? "#222" : "#79869a",
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
