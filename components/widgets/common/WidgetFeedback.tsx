import { IconButton, Typography, Paper, Box } from "@mui/material";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from "react";
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import CloseIcon from '@mui/icons-material/Close';

export default function WidgetFeedback() {
  const [interval, setInterval] = useState(6);
  const [open, setOpen] = useState(true);

  const handleFeedback = (_: any, value: number) => {
    // CALL API
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Box
      sx={{
      position:"absolute",
      width:"100%",
      backgroundColor: "#f5f5f5",
      top:"0px",
      left:"0px",
      p:2.5,
      zIndex:9999,
      borderRadius:2,
      display:"flex",
      flexDirection:"column",
      gap:0.75,
    }}>
      <Typography variant="caption" align="center">
        <strong>Would you like to get this widget recommended more often?</strong>
      </Typography>
      <ToggleButtonGroup
        value={interval}
        exclusive
        onChange={handleFeedback}
        size="small"
        fullWidth
      >
        <ToggleButton
          value="LESS_OFTEN"
          sx={{
            flex: 1,
            backgroundColor: "#ffcdd2",
            "&:hover": { backgroundColor: "#ef9a9a" },
          }}
        >
          <SentimentVeryDissatisfiedIcon color="error" />
        </ToggleButton>

        <ToggleButton
          value="MORE_OFTEN"
          sx={{
            flex: 1,
            backgroundColor: "#fff9c4",
            "&:hover": { backgroundColor: "#fff59d" },
          }}
        >
          <SentimentSatisfiedIcon color="warning" />
        </ToggleButton>

        <ToggleButton
          value="JUST_RIGHT"
          sx={{
            flex: 1,
            backgroundColor: "#c8e6c9",
            "&:hover": { backgroundColor: "#a5d6a7" },
          }}
        >
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