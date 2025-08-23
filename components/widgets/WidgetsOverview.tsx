import { Box, Grid } from "@mui/material";
import OpenQuestionWidget from "@/components/widgets/components/OpenQuestionWidget";
import ForumActivityWidget from "@/components/widgets/components/ForumActivityWidget";
import * as React from "react";
import AchievementWidgetOverview from "./components/achievement/AchievementWidgetOverview";
import LotteryWidget from "@/components/widgets/components/LotteryWidget";

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
  ];

  function getWidgets(order: string[]) {
    return order.map((key) => widgets.find((w) => w.key === key)!);
  }

  // This is the order from the backend
  const selectedWidgets = getWidgets(["forum", "achievements","questions", "lottery"]);

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
          <Grid item xs={6} key={w.key}>
            {w.component}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}