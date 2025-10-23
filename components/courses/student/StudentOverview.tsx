"use client";

import WidgetsOverview from "@/components/widgets/WidgetsOverview";
import { ChapterOverview } from "@/components/ChapterOverview";
import GamificationGuard from "@/components/gamification-guard/GamificationGuard";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useParams } from "next/navigation";
import { StudentOverviewQuery } from "@/__generated__/StudentOverviewQuery.graphql";
import { StudentCourseNavigation } from "@/components/courses/student/StudentCourseNavigation";
import * as React from "react";
import QuestList from "@/app/courses/[courseId]/quests/QuestItem";


export const studentOverviewQuery = graphql`
  query StudentOverviewQuery($id: UUID!) {
    currentUserInfo {
      id
    }
    coursesByIds(ids: [$id]) {
      ...ChapterOverviewFragment
      suggestions(amount: 4) {
        ...SuggestionFragment
        content {
          id
        }
      }
      id
      title
      description
      rewardScores {
        ...RewardScoresFragment
      }
      chapters {
        elements {
          id
          number
          startDate
          ...StudentChapterFragment
          contents {
            ...ContentLinkFragment
            userProgressData {
              nextLearnDate
              lastLearnDate
            }
            id
            metadata {
              type
            }
          }
        }
      }
    }
  }
`;

export default function StudentOverview() {
  const { courseId } = useParams();

  const data = useLazyLoadQuery<StudentOverviewQuery>(
    studentOverviewQuery,
    { id: courseId },
    { fetchPolicy: "network-only" }
  );

  const course = data.coursesByIds?.[0];
  const userId = data.currentUserInfo?.id;

  if (!course || !userId) {
    return <p>Loading course data...</p>;
  }

  return (
    <>
      <GamificationGuard>
        <QuestList />
        <WidgetsOverview userId={userId} courseId={course.id} />
      </GamificationGuard>
      <ChapterOverview _chapters={course} />
    </>
  );
}
