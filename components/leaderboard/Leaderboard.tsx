import React from "react";
import { HoverCard } from "../HoverCard";

const trophies = [
  <svg width="32" height="32" viewBox="0 0 32 32" key="gold">
    <circle cx="16" cy="16" r="16" fill="#FFD700" />
    <text x="10" y="22" fontSize="14" fontWeight="bold" fill="#fff">
      🏆
    </text>
  </svg>,
  <svg width="32" height="32" viewBox="0 0 32 32" key="silver">
    <circle cx="16" cy="16" r="16" fill="#C0C0C0" />
    <text x="10" y="22" fontSize="14" fontWeight="bold" fill="#fff">
      🏆
    </text>
  </svg>,
  <svg width="32" height="32" viewBox="0 0 32 32" key="bronze">
    <circle cx="16" cy="16" r="16" fill="#C96F33" />
    <text x="10" y="22" fontSize="14" fontWeight="bold" fill="#fff">
      🏆
    </text>
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
  users: User[];
  currentUserId: string;
};

export default function Leaderboard({
  title,
  periodLabel,
  onPrevious,
  users,
  currentUserId,
}: LeaderboardProps) {
  // TOP 3 bleiben fix, Rest ist scrollbar
  const topThree = users.filter((u) => u.rank <= 3);
  const others = users.filter((u) => u.rank > 3);

  return (
    <div
      style={{
        background: "#dde3ec",
        borderRadius: 18,
        padding: 24,
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "Inter, Arial, sans-serif",
        boxShadow: "0 2px 16px rgba(80,80,80,0.13)",
      }}
    >
      {/* Buttonzeile */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: 8,
        }}
      >
        <button
          onClick={onPrevious}
          style={{
            background: "#f8fafc",
            border: "1px solid #d8dee3",
            borderRadius: 8,
            padding: "6px 14px 6px 10px",
            display: "flex",
            alignItems: "center",
            fontWeight: 500,
            fontSize: 15,
            cursor: "pointer",
            gap: 6,
          }}
        >
          <span role="img" aria-label="Clock">
            ⏰
          </span>{" "}
          PREVIOUS
        </button>
      </div>

      {/* Titel-Zeile wirklich zentriert */}
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: ".5px",
            width: "100%",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontWeight: 500,
            fontSize: 17,
            letterSpacing: ".5px",
            color: "#79869a",
            width: "100%",
          }}
        >
          {periodLabel}
        </div>
      </div>

      {/* Top 3 (fix) - mit Schatten auf das untere Panel */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 0,
          background: "transparent",
          borderRadius: 0,
          padding: "0 0 16px 0",
          position: "relative",
          zIndex: 2,
          boxShadow: "0 8px 24px -4px rgba(80,80,120,0.16)",
        }}
      >
        {topThree.map((user) => {
          const isCurrent = user.id === currentUserId || user.isCurrentUser;
          return (
            <HoverCard
              key={user.id}
              card={
                <div>
                  <img
                    src={
                      user.profileImage ||
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=ghost"
                    }
                    alt={user.name}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      objectFit: "cover",
                      margin: "0 auto 10px auto",
                      display: "block",
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
                  <div style={{ fontSize: 14, color: "#a1a6b2", marginTop: 6 }}>
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
                  padding: "10px 24px",
                  minHeight: 56,
                  fontSize: 20,
                  background: "#fff",
                  border: isCurrent ? "3px solid #222" : "1px solid #e1e6ea",
                  fontWeight: isCurrent ? 800 : 600,
                  boxShadow: isCurrent
                    ? "0 2px 8px rgba(60,60,60,0.11)"
                    : undefined,
                  position: "relative",
                  cursor: "pointer",
                  marginBottom: 8,
                  backgroundImage: user.backgroundImage
                    ? `url(${user.backgroundImage})`
                    : undefined,
                  backgroundSize: user.backgroundImage ? "cover" : undefined,
                  backgroundRepeat: user.backgroundImage ? "repeat" : undefined,
                }}
                tabIndex={0}
              >
                {/* Rang und Pokal */}
                <div
                  style={{
                    minWidth: 38,
                    textAlign: "left",
                    fontWeight: 700,
                    fontSize: 22,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {user.rank <= 3 ? (
                    <span style={{ marginRight: 6 }}>
                      {trophies[user.rank - 1]}
                    </span>
                  ) : null}
                  <span>{user.rank}.</span>
                </div>

                {/* Profilbild */}
                <div
                  style={{
                    marginRight: 14,
                  }}
                >
                  <img
                    src={
                      user.profileImage ||
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=ghost"
                    }
                    alt={user.name}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: isCurrent ? "3px solid #222" : "2px solid #ddd",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Username */}
                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? "#000" : "#21262b",
                    fontSize: isCurrent ? 21 : 20,
                    letterSpacing: ".5px",
                  }}
                >
                  {user.name}
                </div>

                {/* Punkte */}
                <div
                  style={{
                    minWidth: 90,
                    textAlign: "right",
                    color: isCurrent ? "#222" : "#79869a",
                    fontWeight: isCurrent ? 800 : 600,
                    fontSize: isCurrent ? 20 : 19,
                  }}
                >
                  {user.points} points
                </div>
              </div>
            </HoverCard>
          );
        })}
      </div>

      {/* Unterer Bereich (restliche Plätze) */}
      <div
        style={{
          margin: "0 -24px -24px -24px",
          background: "#c7ccda",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          padding: "16px 0 16px 0",
          boxShadow: "inset 0 1px 0 #b2b9c9",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: 320,
            overflowY: others.length > 0 ? "auto" : undefined,
            padding: "0 24px",
          }}
        >
          {others.map((user) => {
            const isCurrent = user.id === currentUserId || user.isCurrentUser;
            return (
              <HoverCard
                key={user.id}
                card={
                  <div>
                    <img
                      src={
                        user.profileImage ||
                        "https://api.dicebear.com/7.x/adventurer/svg?seed=ghost"
                      }
                      alt={user.name}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        objectFit: "cover",
                        margin: "0 auto 10px auto",
                        display: "block",
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 14,
                    padding: "10px 24px",
                    minHeight: 48,
                    fontSize: 19,
                    background: "#fff",
                    border: isCurrent ? "3px solid #222" : "1px solid #e1e6ea",
                    fontWeight: isCurrent ? 700 : 500,
                    boxShadow: isCurrent
                      ? "0 2px 8px rgba(60,60,60,0.11)"
                      : undefined,
                    position: "relative",
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
                  {/* Rang */}
                  <div
                    style={{
                      minWidth: 38,
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>{user.rank}.</span>
                  </div>

                  {/* Profilbild */}
                  <div
                    style={{
                      marginRight: 14,
                    }}
                  >
                    <img
                      src={
                        user.profileImage ||
                        "https://api.dicebear.com/7.x/adventurer/svg?seed=ghost"
                      }
                      alt={user.name}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        border: isCurrent ? "2px solid #222" : "2px solid #ddd",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* Username */}
                  <div
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? "#000" : "#21262b",
                      fontSize: isCurrent ? 20 : 19,
                      letterSpacing: ".5px",
                    }}
                  >
                    {user.name}
                  </div>

                  {/* Punkte */}
                  <div
                    style={{
                      minWidth: 90,
                      textAlign: "right",
                      color: isCurrent ? "#222" : "#79869a",
                      fontWeight: isCurrent ? 700 : 500,
                      fontSize: isCurrent ? 19 : 18,
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
