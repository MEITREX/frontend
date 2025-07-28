"use client";

import React, { useEffect, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import type { ProfileLeaderboardPositionsQuery } from "@/__generated__/ProfileLeaderboardPositionsQuery.graphql";
import { Box, Typography, CircularProgress, Divider } from "@mui/material";

type LeaderboardPosition = {
  courseId: string;
  courseTitle: string;
  weeklyPosition?: number;
  monthlyPosition?: number;
  overallPosition?: number;
};

export default function ProfileLeaderboardPositions() {
  const [positions, setPositions] = useState<LeaderboardPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const data = useLazyLoadQuery<ProfileLeaderboardPositionsQuery>(
    graphql`
      query ProfileLeaderboardPositionsQuery {
        currentUserInfo {
          id
          userName
          courseMemberships {
            courseId
            course {
              id
              title
            }
          }
        }
      }
    `,
    {}
  );

  useEffect(() => {
    if (!data?.currentUserInfo) return;
    const fetchPositions = async () => {
      setLoading(true);
      const userId = data.currentUserInfo.id;
      const userCourses = data.currentUserInfo.courseMemberships.map((m) => ({
        courseId: m.courseId,
        courseTitle: m.course.title,
      }));

      // Hier simulieren wir die Positionen. In echter Implementierung: getWeeklyCourseLeaderboards etc. abfragen.
      const fetchedPositions: LeaderboardPosition[] = userCourses.map((c) => ({
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        weeklyPosition: Math.floor(Math.random() * 20) + 1,
        monthlyPosition: Math.floor(Math.random() * 20) + 1,
        overallPosition: Math.floor(Math.random() * 20) + 1,
      }));

      setPositions(fetchedPositions);
      setLoading(false);
    };
    fetchPositions();
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (positions.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
        No leaderboard data found.
      </Typography>
    );
  }

  return (
    <Box>
      {positions.map((pos, idx) => (
        <Box key={pos.courseId} sx={{ mb: 3 }}>
          <Typography variant="h6">{pos.courseTitle}</Typography>
          <Typography variant="body2">
            Weekly Position: {pos.weeklyPosition}
          </Typography>
          <Typography variant="body2">
            Monthly Position: {pos.monthlyPosition}
          </Typography>
          <Typography variant="body2">
            Overall Position: {pos.overallPosition}
          </Typography>
          {idx < positions.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </Box>
  );
}