"use client";

import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

export default function GamificationSettingsPage() {
  //TODO: Fetch current settings + set new settings
  const [setting, setSetting] = useState("adaptiveGamification");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSetting(event.target.value);
  };

  return (
    <FormControl>
      <FormLabel>Gamification Preferences</FormLabel>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Choose how gamification features should behave for your experience.
      </Typography>
      <RadioGroup value={setting} onChange={handleChange}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <FormControlLabel
            value="gamification"
            control={<Radio />}
            label="Gamification Enabled"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Gamification is the use of game-like elements such as games, badges,
            or leaderboards to increase engagement and motivation.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
          <FormControlLabel
            value="adaptiveGamification"
            control={<Radio />}
            label="Adaptive Gamification Enabled"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Adaptive gamification dynamically adjusts game-like elements based
            on each user&apos;s behavior and engagement to provide a more
            personalized experience.
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: "flex", flexDirection: "column" }}>
          <FormControlLabel
            value="gamificationDisabled"
            control={<Radio />}
            label="All Gamification Disabled"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Completely disables all gamification elements in the application.
          </Typography>
        </Box>
      </RadioGroup>
    </FormControl>
  );
}
