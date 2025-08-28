import { Box } from "@mui/material";
import OpenQuestionWidget from "@/components/widgets/components/question/OpenQuestionWidget";
import ForumActivityWidget from "@/components/widgets/components/forum/ForumActivityWidget";
import * as React from "react";
import AchievementWidgetOverview from "./components/achievement/AchievementWidgetOverview";
import LotteryWidget from "@/components/widgets/components/lottery/LotteryWidget";
import ItemWidget from "@/components/widgets/components/item/ItemWidget";
import WidgetSettings from "@/components/widgets/common/WidgetSettings";
import {
  widgetApiCurrentUserInfoQuery,
  widgetApiSettingsQuery,
} from "@/components/widgets/api/WidgetApi";
import { useLazyLoadQuery } from "react-relay";
import { WidgetApiSettingsQuery } from "@/__generated__/WidgetApiSettingsQuery.graphql";
import { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";
import { WidgetApiCurrentUserInfoQuery } from "@/__generated__/WidgetApiCurrentUserInfoQuery.graphql";

type Properties = {
  userId: string;
  courseId: string;
};

type MockedRecommendation = {
  category: GamificationCategory;
  requestFeedback: boolean;
};

const mockedRecommendations: MockedRecommendation[] = [
  { category: "CUSTOMIZATION" as GamificationCategory, requestFeedback: false },
  { category: "ALTRUISM" as GamificationCategory, requestFeedback: false },
  { category: "RISK_REWARD" as GamificationCategory, requestFeedback: false },
  { category: "ASSISTANCE" as GamificationCategory, requestFeedback: false },
];

export default function WidgetsOverview({ userId, courseId }: Properties) {
  // ADD NEW WIDGETS HERE:
  const widgets = [
    {
      category: "INCENTIVE" as GamificationCategory,
      key: "achievements",
      component: (
        <AchievementWidgetOverview userId={userId} courseId={courseId} />
      ),
    },
    {
      category: "ALTRUISM" as GamificationCategory,
      key: "questions",
      component: <OpenQuestionWidget />,
    },
    {
      category: "ASSISTANCE" as GamificationCategory,
      key: "forum",
      component: <ForumActivityWidget />,
    },
    {
      category: "RISK_REWARD" as GamificationCategory,
      key: "lottery",
      component: <LotteryWidget />,
    },
    {
      category: "CUSTOMIZATION" as GamificationCategory,
      key: "item",
      component: <ItemWidget />,
    },
  ];

  /*
  const data = useLazyLoadQuery<WidgetApiCurrentUserInfoQuery>(
    widgetApiCurrentUserInfoQuery,
    {},
    { fetchPolicy: "network-only" }
  );
*/
  const { currentUserWidgetSettings } =
    useLazyLoadQuery<WidgetApiSettingsQuery>(widgetApiSettingsQuery, {
      fetchPolicy: "store-or-network",
    });

  const [numWidgetsToShow, setNumWidgetsToShow] = React.useState(
    currentUserWidgetSettings?.numberOfRecommendations ?? 2
  );

  /*
  if (!data || !currentUserWidgetSettings) {
    return <p>Loading Wigets...</p>;
  }
 */

  const selectedWidgets = widgets
    .map((w) => {
      const recommendation = mockedRecommendations.find(
        (r) => r.category === w.category
      );
      if (!recommendation) return null;
      return { ...w, requestFeedback: recommendation.requestFeedback };
    })
    .filter(
      (w): w is (typeof widgets)[0] & { requestFeedback: boolean } => w !== null
    )
    .slice(0, numWidgetsToShow);

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 3,
        position: "relative",
      }}
    >
      <WidgetSettings
        refreshInterval={
          currentUserWidgetSettings.recommendationRefreshInterval
        }
        numWidgets={numWidgetsToShow}
        onNumWidgetsChange={(n) => setNumWidgetsToShow(n)}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 450px)",
          gap: "16px",
          justifyContent: "center",
        }}
      >
        {selectedWidgets.map((w) => (
          <Box key={w.key}>
            {React.cloneElement(w.component, {
              openFeedback: w.requestFeedback,
              category: w.category,
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
