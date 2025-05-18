import * as React from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { progress } from "framer-motion";

type CompetencyProgressbarProps = {
  competencyName: string;
  progressValue: number;
  heightValue: number;
  color: string;
};

export default function CompetencyProgressbar(
  props: CompetencyProgressbarProps
) {
  const { competencyName } = props;
  const { progressValue } = props;
  const { heightValue } = props;
  const { color } = props;

  return (
    <Box sx={{ width: "100%" }}>
      <label>{competencyName}</label>
      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: heightValue,
          borderRadius: "20px",
          "& .MuiLinearProgress-bar": {
            backgroundColor: color, // Setzt die Farbe der gefüllten Progressbar
          },
          backgroundColor: "#e0e0e0", // Setzt die Hintergrundfarbe der Progressbar
        }}
      />
    </Box>
  );
}
