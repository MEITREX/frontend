import React, { useState } from "react";
import Leaderboard, { User } from "./Leaderboard";

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
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
    backgroundImage:
      "https://www.toptal.com/designers/subtlepatterns/patterns/memphis-mini.png",
  },
  {
    id: "2",
    name: "SilverFox",
    points: 2980,
    rank: 2,
    profileImage:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "3",
    name: "BronzeBear",
    points: 2860,
    rank: 3,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "4",
    name: "Player4",
    points: 2700,
    rank: 4,
    profileImage:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd7?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "5",
    name: "Player5",
    points: 2680,
    rank: 5,
    profileImage:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "6",
    name: "Player6",
    points: 2650,
    rank: 6,
    profileImage:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "7",
    name: "Player7",
    points: 2620,
    rank: 7,
    profileImage:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3fd7?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "8",
    name: "Hanes Juergen",
    points: 2130,
    rank: 15,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "9",
    name: "Player9",
    points: 2520,
    rank: 9,
    profileImage:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "10",
    name: "Player10",
    points: 2480,
    rank: 10,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "11",
    name: "Hans Juergen",
    points: 2480,
    rank: 11,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "12",
    name: "Hans Peter",
    points: 2480,
    rank: 12,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "13",
    name: "Hans Ludwig",
    points: 2480,
    rank: 13,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "14",
    name: "Hans Juergen",
    points: 2480,
    rank: 14,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "15",
    name: "Hans Juergen",
    points: 2480,
    rank: 15,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "16",
    name: "sHans Juergen",
    points: 2230,
    rank: 16,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "17",
    name: "Hanes Juergen",
    points: 2130,
    rank: 17,
    profileImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=128&q=80",
  },

  {
    id: "18",
    name: "JonathanWolp", // dein User
    points: 2555,
    rank: 18,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80",
    isCurrentUser: true,
  },
  {
    id: "19",
    name: "ExtraPlayer1",
    points: 2100,
    rank: 19,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "20",
    name: "ExtraPlayer2",
    points: 2080,
    rank: 20,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "21",
    name: "ExtraPlayer3",
    points: 2050,
    rank: 21,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "22",
    name: "ExtraPlayer4",
    points: 2030,
    rank: 22,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80",
  },
  {
    id: "23",
    name: "ExtraPlayer5",
    points: 2000,
    rank: 23,
    profileImage:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=facearea&w=128&q=80",
  },
];

const PERIODS = {
  weekly: {
    title: "Weekly Leaderboard",
    periodLabel: "23.06.2025 – 29.06.2025",
  },
  monthly: {
    title: "Monthly Leaderboard",
    periodLabel: "Juni 2025",
  },
  overall: {
    title: "All Time Leaderboard",
    periodLabel: "",
  },
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

  // Mappe Dummy-Users und markiere currentUser
  const users = demoUsers.map((u) => ({
    ...u,
    isCurrentUser: u.id === currentUserId || u.name === currentUserName,
    profileImage:
      (u.id === currentUserId || u.name === currentUserName) &&
      currentUserProfileImage
        ? currentUserProfileImage
        : u.profileImage,
  }));

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
        {(["weekly", "monthly", "overall"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontWeight: 600,
              fontSize: 17,
              padding: "7px 20px",
              borderRadius: 12,
              border: "none",
              background: activeTab === tab ? "#b9d7fd" : "#e8ecf3",
              cursor: "pointer",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <Leaderboard
        title={PERIODS[activeTab].title}
        periodLabel={PERIODS[activeTab].periodLabel}
        onPrevious={handlePrevious}
        users={users}
        // currentUserId={currentUserId}
      />
    </div>
  );
};

export default CourseLeaderboards;
