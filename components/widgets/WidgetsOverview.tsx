import { Box, Grid } from "@mui/material";
import OpenQuestionWidget from "@/components/widgets/components/OpenQuestionWidget";
import ForumActivityWidget from "@/components/widgets/components/ForumActivityWidget";
import * as React from "react";
import AchievementWidgetOverview from "./components/achievement/AchievementWidgetOverview";

type Properties = {
  userId: string;
  courseId: string;
}

export default function WidgetsOverview ({userId, courseId}: Properties) {
  return (
    <Box
      sx={{
      border: "1px solid #e0e0e0",
      borderRadius: 2,
      p: 2,
      }}
    >
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
          <AchievementWidgetOverview userId={userId} courseId={courseId} />
        </Grid>

        <Grid item xs={6}>
            <OpenQuestionWidget />
        </Grid>

        <Grid item xs={6}>
          <ForumActivityWidget />
        </Grid>

        <Grid item xs={6}></Grid>
      </Grid>
    </Box>
  );
}