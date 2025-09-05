import React, { useEffect, useRef } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import defaultUserImage from "../../assets/logo.svg";
import type { LeaderboardWidgetQuery } from "@/__generated__/LeaderboardWidgetQuery.graphql";
//"../__generated__/LeaderboardWidgetQuery.graphql";

interface Props {
  courseID: string;
  date: string;
  currentUserID: string;
}

const LeaderboardWidget: React.FC<Props> = ({
  courseID,
  date,
  currentUserID,
}) => {
  const data = useLazyLoadQuery<LeaderboardWidgetQuery>(
    graphql`
      query LeaderboardWidgetQuery($courseID: ID!, $date: String!) {
        weekly: getWeeklyCourseLeaderboards(courseID: $courseID, date: $date) {
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
    { courseID, date }
  );

  const rawScores =
    data.weekly && data.weekly.length > 0
      ? data.weekly[0].userScores ?? []
      : [];
  const sorted = [...rawScores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current && currentRef.current) {
      const parent = containerRef.current;
      const target = currentRef.current;
      parent.scrollTop =
        target.offsetTop - parent.clientHeight / 2 + target.clientHeight / 2;
    }
  }, [sorted]);

  const topThree = sorted.slice(0, 3);
  const userIndex = sorted.findIndex((us) => us.user?.id === currentUserID);

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

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 800,
        margin: "0 auto",
        fontFamily: "Roboto, Arial, sans-serif",
        fontSize: 14,
      }}
    >
      <div style={{ width: "100%" }}>
        {topThree.map((us, idx) => (
          <div
            key={us.user?.id}
            style={{
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
            }}
          >
            <span style={{ marginRight: 8, width: 20, textAlign: "right" }}>
              {idx + 1}.
            </span>
            <img
              src={defaultUserImage.src}
              alt={us.user?.name}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                marginRight: 8,
              }}
            />
            <span style={{ fontWeight: 600 }}>{us.user?.name}</span>
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
              key={us.user?.id}
              ref={isCurrent ? currentRef : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "4px 8px",
                height: 32,
                background: isCurrent ? "#eef" : "transparent",
                border: isCurrent ? "2px solid #000" : "none",
                borderRadius: 4,
                marginBottom: 2,
                justifyContent: "space-between",
              }}
            >
              <span style={{ width: 20, textAlign: "right" }}>{rank}.</span>
              <img
                src={defaultUserImage.src}
                alt={us.user?.name}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  margin: "0 8px",
                }}
              />
              <span style={{ flex: 1, textAlign: "left" }}>
                {us.user?.name}
              </span>
              <span style={{ marginLeft: 8 }}>{us.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardWidget;
