import React from "react";
import type { StaticImageData } from "next/image";
import defaultUserImage from "../../assets/logo.svg";
import { HoverCard } from "../HoverCard";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useParams } from "next/navigation";
import { LeaderboardQuery } from "../../__generated__/LeaderboardQuery.graphql";

function getImageSrc(image?: string | StaticImageData): string {
  if (typeof image === "string") {
    return image;
  }
  if (image && typeof image === "object" && "src" in image) {
    return image.src;
  }
  return defaultUserImage.src;
}

// 1. Pokal-SVGs definieren
const trophies = [
  // Gold
  <svg key="gold" width="36" height="36" viewBox="0 0 36 36">
    <ellipse cx="18" cy="32" rx="8" ry="3" fill="#c2a200" opacity="0.25"/>
    <rect x="14" y="26" width="8" height="6" rx="2" fill="#FFD700" stroke="#c2a200" strokeWidth="1"/>
    <path d="M12 30h12" stroke="#c2a200" strokeWidth="2"/>
    <path d="M9 8c0 7 3 12 9 12s9-5 9-12H9z" fill="#FFD700" stroke="#c2a200" strokeWidth="2"/>
    <polygon points="18,13 19.4,16.6 23.3,16.6 20.2,18.8 21.6,22.2 18,20 14.4,22.2 15.8,18.8 12.7,16.6 16.6,16.6" fill="#fff59d" stroke="#c2a200" strokeWidth="0.5"/>
    <circle cx="9" cy="12" r="4" fill="none" stroke="#c2a200" strokeWidth="2"/>
    <circle cx="27" cy="12" r="4" fill="none" stroke="#c2a200" strokeWidth="2"/>
  </svg>,
  // Silber
  <svg key="silver" width="36" height="36" viewBox="0 0 36 36">
    <ellipse cx="18" cy="32" rx="8" ry="3" fill="#aaa" opacity="0.20"/>
    <rect x="14" y="26" width="8" height="6" rx="2" fill="#C0C0C0" stroke="#888" strokeWidth="1"/>
    <path d="M12 30h12" stroke="#888" strokeWidth="2"/>
    <ellipse cx="18" cy="15" rx="9" ry="9" fill="#C0C0C0" stroke="#888" strokeWidth="2"/>
    <ellipse cx="18" cy="14" rx="5" ry="6" fill="#e9e9e9"/>
    <rect x="16" y="24" width="4" height="4" rx="1" fill="#e9e9e9"/>
  </svg>,
  // Bronze
  <svg key="bronze" width="36" height="36" viewBox="0 0 36 36">
    <ellipse cx="18" cy="32" rx="8" ry="3" fill="#ad6d2f" opacity="0.15"/>
    <rect x="15" y="26" width="6" height="6" rx="1.5" fill="#c97f4a" stroke="#ad6d2f" strokeWidth="1"/>
    <path d="M12 30h12" stroke="#ad6d2f" strokeWidth="2"/>
    <ellipse cx="18" cy="16" rx="8" ry="7" fill="#C96F33" stroke="#ad6d2f" strokeWidth="2"/>
    <rect x="13" y="20" width="10" height="3" rx="1.5" fill="#e8b288"/>
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
  users?: User[];
};

export default function Leaderboard({
  title,
  periodLabel,
  onPrevious,
  users = [],
}: LeaderboardProps) {
  const { courseId } = useParams();

  const { scoreboard, currentUserInfo } = useLazyLoadQuery<LeaderboardQuery>(
    graphql`
      query LeaderboardQuery($id: UUID!) {
        scoreboard(courseId: $id) {
          user {
            id
            userName
          }
          powerScore
        }
        currentUserInfo {
          id
          userName
        }
      }
    `,
    { id: courseId }
  );

  type ScoreboardEntry = Exclude<
    NonNullable<LeaderboardQuery["response"]["scoreboard"]>[number],
    null | undefined
  > & { user: { id: string; userName: string } | null };

  const mappedUsers: User[] = (scoreboard ?? [])
    .filter((entry): entry is ScoreboardEntry => !!entry?.user?.id)
    .map((entry, idx) => ({
      id: entry.user!.id,
      name: entry.user!.userName,
      points: entry.powerScore,
      rank: idx + 1,
      isCurrentUser: entry.user!.id === currentUserInfo?.id,
    }));

  const displayUsers = mappedUsers.length > 0 ? mappedUsers : users;
  const topThree = displayUsers.filter((u) => u.rank <= 3);
  const others   = displayUsers.filter((u) => u.rank > 3);

  const currentUserRef     = React.useRef<HTMLDivElement | null>(null);
  const othersContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (currentUserRef.current && othersContainerRef.current) {
      const parent = othersContainerRef.current;
      const target = currentUserRef.current;
      const pr = parent.getBoundingClientRect();
      const tr = target.getBoundingClientRect();
      parent.scrollTop += (tr.top - pr.top) - parent.clientHeight/2 + target.clientHeight/2;
    }
  }, [displayUsers]);

  return (
    <div
      style={{
        background: "#dde3ec",
        borderRadius: 24,
        padding: 32,
        width: "100%",
        maxWidth: 1280,
        minHeight: "80vh",
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
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
          marginBottom: 24,
          gap: 16,
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
              padding: "8px 16px 8px 12px",
              display: "flex",
              alignItems: "center",
              fontWeight: 500,
              fontSize: 17,
              cursor: "pointer",
              gap: 8,
              boxShadow: "0 1px 2px rgba(80,80,80,0.07)",
            }}
          >
            <span role="img" aria-label="Clock">⏰</span>{" "}
            PREVIOUS
          </button>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 36,
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
              fontSize: 22,
              letterSpacing: ".7px",
              color: "#79869a",
              width: "100%",
            }}
          >
            {periodLabel}
          </div>
        </div>
        <div style={{ flex: "none", width: 110 }} />
      </div>

      {/* Top 3 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "0 0 28px",
          position: "relative",
          zIndex: 2,
          boxShadow: "0 8px 32px -4px rgba(80,80,120,0.13)",
        }}
      >
        {topThree.map((user, idx) => {
          const isCurrent = user.isCurrentUser;
          return (
            <HoverCard key={user.id} card={
              <div>
                <img
                  src={getImageSrc(user.profileImage)}
                  alt={user.name}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    objectFit: "cover",
                    margin: "0 auto 10px",
                    boxShadow: "0 2px 8px #0001",
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 18, color: "#79869a" }}>
                  Points: {user.points}
                </div>
                <div style={{ fontSize: 15, color: "#a1a6b2", marginTop: 8 }}>
                  Profilinfos folgen…
                </div>
              </div>
            } position="bottom">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: 18,
                  padding: "16px 44px",
                  minHeight: 78,
                  fontSize: 26,
                  background:
                    idx === 0
                      ? "linear-gradient(90deg,#f9f9f9 60%,#fff4cc 100%)"  // goldstich
                      : idx === 1
                      ? "linear-gradient(90deg,#f0f0f0 60%,#e0e0e0 100%)"  // silberstich
                      : "linear-gradient(90deg,#e6e6e6 60%,#e4d0c1 100%)", // bronzestich
                  border: isCurrent ? "4px solid #222" : "2px solid #e1e6ea",
                  fontWeight: isCurrent ? 900 : 700,
                  boxShadow: isCurrent ? "0 2px 12px rgba(40,40,40,0.13)" : undefined,
                  marginBottom: 12,
                }}
                tabIndex={0}
              >
                {/* 2. Pokal anzeigen */}
                <div style={{ minWidth: 48, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ marginRight: 10 }}>{trophies[idx]}</span>
                  <span>{user.rank}.</span>
                </div>

                {/* Profilbild */}
                <div style={{ marginRight: 20 }}>
                  <img
                    src={getImageSrc(user.profileImage)}
                    alt={user.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      border: isCurrent ? "4px solid #222" : "3px solid #ddd",
                      objectFit: "cover",
                      boxShadow: "0 1px 5px #0001",
                    }}
                  />
                </div>

                {/* Username */}
                <div style={{
                  flex: 1,
                  textAlign: "center",
                  fontWeight: isCurrent ? 900 : 700,
                  color: isCurrent ? "#0b0b0b" : "#2f3541",
                  fontSize: isCurrent ? 28 : 26,
                  letterSpacing: ".5px",
                }}>
                  {user.name}
                </div>

                {/* Punkte */}
                <div style={{
                  minWidth: 120,
                  textAlign: "right",
                  color: isCurrent ? "#222" : "#79869a",
                  fontWeight: isCurrent ? 900 : 700,
                  fontSize: isCurrent ? 26 : 24,
                }}>
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
          margin: "0 -32px -32px -32px",
          background: "#c7ccda",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          padding: "28px 0",
          boxShadow: "inset 0 2px 0 #b2b9c9",
          maxHeight: "60vh",
          overflowY: others.length > 0 ? "auto" : undefined,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "0 32px" }}>
          {others.map((user) => {
            const isCurrent = user.isCurrentUser;
            return (
              <HoverCard key={user.id} card={
                <div>
                  <img
                    src={getImageSrc(user.profileImage)}
                    alt={user.name}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 10,
                      objectFit: "cover",
                      margin: "0 auto 10px",
                      boxShadow: "0 2px 8px #0001",
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{user.name}</div>
                  <div style={{ fontSize: 16, color: "#79869a" }}>Points: {user.points}</div>
                  <div style={{ fontSize: 14, color: "#a1a6b2", marginTop: 6 }}>Profilinfos folgen…</div>
                </div>
              } position="bottom">
                <div
                  ref={isCurrent ? currentUserRef : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 14,
                    padding: "14px 36px",
                    minHeight: 54,
                    fontSize: 22,
                    background: "#fff",
                    border: isCurrent ? "3px solid #222" : "2px solid #e1e6ea",
                    fontWeight: isCurrent ? 800 : 600,
                    boxShadow: isCurrent ? "0 2px 8px rgba(60,60,60,0.11)" : undefined,
                    cursor: "pointer",
                    backgroundImage: user.backgroundImage ? `url(${user.backgroundImage})` : undefined,
                    backgroundSize: user.backgroundImage ? "cover" : undefined,
                    backgroundRepeat: user.backgroundImage ? "repeat" : undefined,
                  }}
                  tabIndex={0}
                >
                  <div style={{ minWidth: 42, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>{user.rank}.</span>
                  </div>
                  <div style={{ marginRight: 16 }}>
                    <img
                      src={getImageSrc(user.profileImage)}
                      alt={user.name}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        border: isCurrent ? "2.5px solid #222" : "2.5px solid #ddd",
                        objectFit: "cover",
                        boxShadow: "0 1px 4px #0001",
                      }}
                    />
                  </div>
                  <div style={{
                    flex: 1,
                    textAlign: "center",
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? "#000" : "#21262b",
                    fontSize: isCurrent ? 22 : 21,
                    letterSpacing: ".5px",
                  }}>{user.name}</div>
                  <div style={{
                    minWidth: 100,
                    textAlign: "right",
                    color: isCurrent ? "#222" : "#79869a",
                    fontWeight: isCurrent ? 800 : 600,
                    fontSize: isCurrent ? 22 : 21,
                  }}>{user.points} points</div>
                </div>
              </HoverCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}