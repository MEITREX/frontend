import { WidgetApiCurrentUserInfoQuery } from "@/__generated__/WidgetApiCurrentUserInfoQuery.graphql";
import { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";
import { WidgetApiSettingsQuery } from "@/__generated__/WidgetApiSettingsQuery.graphql";
import {
  widgetApiCurrentUserInfoQuery,
  widgetApiSettingsQuery,
} from "@/components/widgets/api/WidgetApi";
import WidgetSettings from "@/components/widgets/common/WidgetSettings";
import ForumActivityWidget from "@/components/widgets/components/forum/ForumActivityWidget";
import ItemWidget from "@/components/widgets/components/item/ItemWidget";
import LotteryWidget from "@/components/widgets/components/lottery/LotteryWidget";
import OpenQuestionWidget from "@/components/widgets/components/question/OpenQuestionWidget";
import TutorWidget from "@/components/widgets/components/tutor/TutorWidget";
import { Box } from "@mui/material";
import * as React from "react";
import { useLazyLoadQuery } from "react-relay";
import AchievementWidgetOverview from "./components/achievement/AchievementWidgetOverview";

type Properties = {
  userId: string;
  courseId: string;
};

// Use this to mock widgets
type MockedRecommendation = {
  category: GamificationCategory;
  requestFeedback: boolean;
};

const mockedRecommendations: MockedRecommendation[] = [
  {
    category: "ALTRUISM",
    requestFeedback: false,
  },
  {
    category: "CUSTOMIZATION",
    requestFeedback: false,
  },
  {
    category: "RISK_REWARD",
    requestFeedback: false,
  },
  {
    category: "ASSISTANCE",
    requestFeedback: false,
  },
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
    {
      category: "IMMERSION" as GamificationCategory,
      key: "tutor",
      component: <TutorWidget />,
    },
  ];

  const data = useLazyLoadQuery<WidgetApiCurrentUserInfoQuery>(
    widgetApiCurrentUserInfoQuery,
    {},
    { fetchPolicy: "network-only" }
  );

  const courseMembership = data.currentUserInfo?.courseMemberships?.find(
    (m) => m.courseId === courseId
  );

  const recommendations = courseMembership?.course?.widgetRecommendations ?? [];

  const { currentUserWidgetSettings } =
    useLazyLoadQuery<WidgetApiSettingsQuery>(widgetApiSettingsQuery, {
      fetchPolicy: "store-or-network",
    });

  const [numWidgetsToShow, setNumWidgetsToShow] = React.useState(
    currentUserWidgetSettings?.numberOfRecommendations ?? 2
  );

  if (!data || !currentUserWidgetSettings) {
    return <p>Loading Wigets...</p>;
  }

  // Map User preferred categories to Widget-Components
  // Testing: Use mockedRecommendations
  const selectedWidgets = widgets
    .map((w) => {
      const recommendation = recommendations.find(
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
