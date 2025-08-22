import AchievementWidget from "@/components/widgets/components/achievement/AchievementWidget";
import AchievementPopUp from "@/components/profile/achievements/AchievementPopUp";
import * as React from "react";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { studentUserAchievementsWidgetQuery } from "@/__generated__/studentUserAchievementsWidgetQuery.graphql";

type Properties = {
  userId: string;
  courseId: string;
}

export default function AchievementWidgetOverview({userId, courseId}: Properties) {
  const { achievementsByUserId } =
    useLazyLoadQuery<studentUserAchievementsWidgetQuery>(
      graphql`
        query studentUserAchievementsWidgetQuery($id: UUID!) {
          achievementsByUserId(userId: $id) {
            id
            name
            imageUrl
            description
            courseId
            userId
            completed
            requiredCount
            completedCount
            trackingStartTime
            trackingEndTime
          }
        }
      `,
      { id: userId },
      {
        fetchPolicy: "network-only",
      }
    );

  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(
    null
  );
  const [openAchievementDialog, setOpenDialog] = useState(false);

  const handleOpenAchievement = (achievement: any) => {
    setSelectedAchievement(achievement);
    setOpenDialog(true);
  };
  const handleCloseAchievement = () => {
    setOpenDialog(false);
  };

  const mutableAchievements = [...achievementsByUserId];

  return (
    <>
      <AchievementWidget
        achievements={mutableAchievements}
        openAchievements={handleOpenAchievement}
        course={courseId}
      />
      <AchievementPopUp
        open={openAchievementDialog}
        onClose={handleCloseAchievement}
        selectedAchievement={selectedAchievement}
      />
    </>
  );
}