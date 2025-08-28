import { IconButton, Typography, Paper, Box } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation } from "react-relay";
import { widgetApiRecommendationFeedbackMutation } from "@/components/widgets/api/WidgetApi";
import {
  GamificationCategory,
  RecommendationUserFeedback,
  WidgetApiRecommendationFeedbackMutation,
} from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";

type Props = {
  openFeedback?: boolean;
  category?: GamificationCategory;
};

export default function WidgetFeedback({ openFeedback, category }: Props) {
  const [recommendationFeedback] =
    useMutation<WidgetApiRecommendationFeedbackMutation>(
      widgetApiRecommendationFeedbackMutation
    );

  const [open, setOpen] = useState(openFeedback);

  const handleFeedback = (_: any, value: RecommendationUserFeedback) => {
    recommendationFeedback({
      variables: {
        category: category as GamificationCategory,
        feedback: value,
      },
      onCompleted() {
        setOpen(false);
      },
      onError(error) {
        console.error("Feedback failed", error);
      },
    });
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        backgroundColor: "#f5f5f5",
        top: "0px",
        left: "0px",
        p: 2.5,
        zIndex: 9999,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      <Typography variant="caption" align="center">
        <strong>How often do you want to see this widget?</strong>
      </Typography>
      <ToggleButtonGroup
        exclusive
        onChange={handleFeedback}
        size="small"
        fullWidth
      >
        <ToggleButton
          value="LESS_OFTEN"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            backgroundColor: "#ffcdd2",
            "&:hover": { backgroundColor: "#ef9a9a" },
          }}
        >
          <Typography sx={{ whiteSpace: "nowrap" }}>Less often</Typography>
          <SentimentVeryDissatisfiedIcon color="error" />
        </ToggleButton>

        <ToggleButton
          value="JUST_RIGHT"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            backgroundColor: "#fff9c4",
            "&:hover": { backgroundColor: "#fff59d" },
          }}
        >
          <Typography sx={{ whiteSpace: "nowrap" }}>Just right</Typography>
          <SentimentSatisfiedIcon color="warning" />
        </ToggleButton>

        <ToggleButton
          value="MORE_OFTEN"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            backgroundColor: "#c8e6c9",
            "&:hover": { backgroundColor: "#a5d6a7" },
          }}
        >
          <Typography sx={{ whiteSpace: "nowrap" }}>More often</Typography>
          <SentimentVerySatisfiedIcon color="success" />
        </ToggleButton>

        <IconButton
          size="small"
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </ToggleButtonGroup>
    </Box>
  );
}
