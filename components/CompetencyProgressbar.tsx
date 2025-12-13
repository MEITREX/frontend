import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { useEffect, useState } from "react";

type CompetencyProgressbarProps = {
  competencyName: string;
  startProgress?:number;
  endProgress: number;
  height: number;
  color: string;
  onClick?: () => void;
};

export default function CompetencyProgressbar(
  props: CompetencyProgressbarProps
) {
  const { competencyName } = props;
  const { startProgress } = props;
  const { endProgress } = props;
  const { height } = props;
  const { color } = props;
  const { onClick } = props;

  const [progress, setProgress] = useState(startProgress ?? endProgress);

  useEffect(() => {
    if (startProgress == null || startProgress === endProgress) return;

    const steps = 25;
    const totalMs = 500;
    const intervalMs = Math.floor(totalMs / steps);
    const increment = (endProgress - startProgress) / steps;

    let current = startProgress;
    setProgress(current);

    const timer = setInterval(() => {
      current = Math.min(endProgress, current + increment);
      setProgress(current);
      if (current >= endProgress) {
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [startProgress, endProgress]);

  return (
    <Box sx={{ width: "95%" }} onClick={onClick}>
      <label>{competencyName}</label>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: height,
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
