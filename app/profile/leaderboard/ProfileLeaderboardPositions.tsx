"use client";

import React, { useEffect, useState } from "react";
import { graphql, useLazyLoadQuery, fetchQuery } from "react-relay";
import { useRelayEnvironment } from "react-relay/hooks";
import type { ProfileLeaderboardPositionsQuery } from "@/__generated__/ProfileLeaderboardPositionsQuery.graphql";
import { Box, Typography, CircularProgress, Divider } from "@mui/material";

type LeaderboardPosition = {
  courseId: string;
  courseTitle: string;
  weeklyPosition?: number;
  monthlyPosition?: number;
  overallPosition?: number;
};

const CourseLeaderboardQuery = graphql`
  query ProfileCourseLeaderboardQuery($courseID: ID!, $date: String!) {
    weekly: getWeeklyCourseLeaderboards(courseID: $courseID, date: $date) {
      userScores {
        score
        user {
          id
          name
        }
      }
    }
    monthly: getMonthlyCourseLeaderboards(courseID: $courseID, date: $date) {
      userScores {
        score
        user {
          id
          name
        }
      }
    }
    allTime: getAllTimeCourseLeaderboards(courseID: $courseID, date: $date) {
      userScores {
        score
        user {
          id
          name
        }
      }
    }
  }
`;

export default function ProfileLeaderboardPositions() {
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

  const environment = useRelayEnvironment();
  const [positions, setPositions] = useState<LeaderboardPosition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!data?.currentUserInfo) return;

    const fetchPositions = async () => {
      setLoading(true);
      const userId = data.currentUserInfo.id;
      const userCourses = data.currentUserInfo.courseMemberships.map((m) => ({
        courseId: m.courseId,
        courseTitle: m.course.title,
      }));

      const today = new Date().toISOString().slice(0, 10);

      const fetchedPositions: LeaderboardPosition[] = [];

      for (const c of userCourses) {
        try {
          const lbData = (await fetchQuery(
            environment,
            CourseLeaderboardQuery,
            { courseID: c.courseId, date: today }
          ).toPromise()) as any;

          const findPosition = (scores: any[]) => {
            const sorted = [...(scores ?? [])].sort(
              (a, b) => (b.score ?? 0) - (a.score ?? 0)
            );
            return (
              sorted.findIndex((s) => s.user?.id === userId) + 1 || undefined
            );
          };

          fetchedPositions.push({
            courseId: c.courseId,
            courseTitle: c.courseTitle,
            weeklyPosition: findPosition(lbData?.weekly?.[0]?.userScores),
            monthlyPosition: findPosition(lbData?.monthly?.[0]?.userScores),
            overallPosition: findPosition(lbData?.allTime?.[0]?.userScores),
          });
        } catch (e) {
          console.error("Error fetching leaderboard for course", c.courseId, e);
        }
      }

      setPositions(fetchedPositions);
      setLoading(false);
    };

    fetchPositions();
  }, [data, environment]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {positions.length === 0 ? (
        <Typography variant="body1">No leaderboard positions available.</Typography>
      ) : (
        positions.map((pos) => (
          <Box key={pos.courseId} sx={{ mb: 2 }}>
            <Typography variant="h6">{pos.courseTitle}</Typography>
            <Typography variant="body2">
              Weekly Position: {pos.weeklyPosition ?? "N/A"}
            </Typography>
            <Typography variant="body2">
              Monthly Position: {pos.monthlyPosition ?? "N/A"}
            </Typography>
            <Typography variant="body2">
              Overall Position: {pos.overallPosition ?? "N/A"}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))
      )}
    </Box>
  );
}