import {
  Box,
} from "@mui/material";
import OpenQuestionWidget from "@/components/widgets/components/question/OpenQuestionWidget";
import ForumActivityWidget from "@/components/widgets/components/forum/ForumActivityWidget";
import * as React from "react";
import AchievementWidgetOverview from "./components/achievement/AchievementWidgetOverview";
import LotteryWidget from "@/components/widgets/components/lottery/LotteryWidget";
import ItemWidget from "@/components/widgets/components/item/ItemWidget";
import WidgetSettings from "@/components/widgets/common/WidgetSettings";

type Properties = {
  userId: string;
  courseId: string;
}

export default function WidgetsOverview ({userId, courseId}: Properties) {
  const [numWidgetsToShow, setNumWidgetsToShow] = React.useState(2)

  const widgets = [
    { key: "achievements", component: <AchievementWidgetOverview userId={userId} courseId={courseId} /> },
    { key: "questions", component: <OpenQuestionWidget /> },
    { key: "forum", component: <ForumActivityWidget /> },
    { key: "lottery", component: <LotteryWidget />},
    { key: "item", component: <ItemWidget /> },
  ];

  function getWidgets(order: string[]) {
    return order.map((key) => widgets.find((w) => w.key === key)!);
  }

  const selectedWidgets = getWidgets(["item","lottery", "forum","questions", "lottery"]).slice(0, numWidgetsToShow);

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 3,
        position:"relative",
      }}
    >
      <WidgetSettings
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
            {w.component}
          </Box>
        ))}
      </Box>
    </Box>
  );
}