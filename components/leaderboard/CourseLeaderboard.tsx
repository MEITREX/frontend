import React, { useState } from "react";
import Leaderboard, { User } from "./Leaderboard";

// Props-Typ explizit deklarieren!
type CourseLeaderboardsProps = {
  courseId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserProfileImage?: string;
};

// Dummy-Daten für Leaderboard, dein User auf Platz 8
const demoUsers: User[] = [
  {
    id: "1",
    name: "GoldHero",
    points: 3125,
    rank: 1,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80", // Landschaft
    backgroundImage:
      "https://www.toptal.com/designers/subtlepatterns/patterns/memphis-mini.png",
  },
  {
    id: "2",
    name: "SilverFox",
    points: 2980,
    rank: 2,
    profileImage:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=128&q=80", // Berge
  },
  {
    id: "3",
    name: "BronzeBear",
    points: 2860,
    rank: 3,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80", // See
  },
  {
    id: "4",
    name: "Player4",
    points: 2700,
    rank: 4,
    profileImage:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd7?auto=format&fit=facearea&w=128&q=80", // Wald
  },
  {
    id: "5",
    name: "Player5",
    points: 2680,
    rank: 5,
    profileImage:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=facearea&w=128&q=80", // Blume
  },
  {
    id: "6",
    name: "Player6",
    points: 2650,
    rank: 6,
    profileImage:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=128&q=80", // Berge
  },
  {
    id: "7",
    name: "Player7",
    points: 2620,
    rank: 7,
    profileImage:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd7?auto=format&fit=facearea&w=128&q=80", // Wald
  },
  {
    id: "8",
    name: "JonathanWolp", // <-- dein User
    points: 2555,
    rank: 8,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80", // See ( currentUserProfileImage)
    isCurrentUser: true,
  },
  {
    id: "9",
    name: "Player9",
    points: 2520,
    rank: 9,
    profileImage:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=facearea&w=128&q=80", // Blume
  },
  {
    id: "10",
    name: "Player10",
    points: 2480,
    rank: 10,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80", // Landschaft
  },

  {
    id: "11",
    name: "Hans Juergen",
    points: 2480,
    rank: 10,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80", // Landschaft
  },
];

const PERIODS = {
  weekly: {
    title: "Weekly Leaderboard",
    periodLabel: "23.06.2025 – 29.06.2025",
  },
  monthly: { title: "Monthly Leaderboard", periodLabel: "Juni 2025" },
  overall: { title: "All Time Leaderboard", periodLabel: "" },
};

const CourseLeaderboards: React.FC<CourseLeaderboardsProps> = ({
  courseId,
  currentUserId,
  currentUserName,
  currentUserProfileImage,
}) => {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "overall">(
    "weekly"
  );

  const handlePrevious = () => {
    alert("Vorheriger Zeitraum (Demo)");
  };

  return (
    <div>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 28,
          marginTop: 10,
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setActiveTab("weekly")}
          style={{
            fontWeight: 600,
            fontSize: 17,
            padding: "7px 20px",
            borderRadius: 12,
            border: "none",
            background: activeTab === "weekly" ? "#b9d7fd" : "#e8ecf3",
            cursor: "pointer",
          }}
        >
          Weekly
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          style={{
            fontWeight: 600,
            fontSize: 17,
            padding: "7px 20px",
            borderRadius: 12,
            border: "none",
            background: activeTab === "monthly" ? "#b9d7fd" : "#e8ecf3",
            cursor: "pointer",
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => setActiveTab("overall")}
          style={{
            fontWeight: 600,
            fontSize: 17,
            padding: "7px 20px",
            borderRadius: 12,
            border: "none",
            background: activeTab === "overall" ? "#b9d7fd" : "#e8ecf3",
            cursor: "pointer",
          }}
        >
          All Time
        </button>
      </div>
      {/* Leaderboard */}
      <Leaderboard
        title={PERIODS[activeTab].title}
        periodLabel={PERIODS[activeTab].periodLabel}
        onPrevious={handlePrevious}
        users={demoUsers.map((u) => ({
          ...u,
          isCurrentUser: u.id === currentUserId || u.name === currentUserName,
          profileImage:
            (u.id === currentUserId || u.name === currentUserName) &&
            currentUserProfileImage
              ? currentUserProfileImage
              : u.profileImage,
        }))}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default CourseLeaderboards;
