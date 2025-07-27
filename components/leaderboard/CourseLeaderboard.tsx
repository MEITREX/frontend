import React, { useState } from "react";
import Leaderboard from "./Leaderboard";

type CourseLeaderboardsProps = {
  courseID: string; // Großes D!
  currentUserId: string;
  currentUserName: string;
  currentUserProfileImage?: string;
};

const PERIODS = {
  weekly: {
    title: "Weekly Leaderboard",
    periodLabel: "23.06.2025 – 29.06.2025",
    key: "weekly",
  },
  monthly: {
    title: "Monthly Leaderboard",
    periodLabel: "Juni 2025",
    key: "monthly",
  },
  overall: {
    title: "All Time Leaderboard",
    periodLabel: "",
    key: "allTime",
  },
};

const CourseLeaderboards: React.FC<CourseLeaderboardsProps> = ({
  courseID,
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
            {PERIODS[tab].title}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <Leaderboard
        title={PERIODS[activeTab].title}
        periodLabel={PERIODS[activeTab].periodLabel}
        onPrevious={handlePrevious}
        period={activeTab === "overall" ? "allTime" : activeTab}
      />
    </div>
  );
};

export default CourseLeaderboards;
