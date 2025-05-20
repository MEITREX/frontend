"use client";

import React, { useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Typography,
} from "@mui/material";

export default function NotificationSettingsPage() {
  //TODO: Fetch current settings + set new settings
  const [settings, setSettings] = useState({
    gamificationNotifications: true,
    lectureNotifications: true,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target);
    setSettings({
      ...settings,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Box>
      <FormLabel sx={{ mb: 1 }}>Notification Preferences</FormLabel>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Choose which types of notifications you would like to receive:
      </Typography>

      <FormGroup>
        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="gamificationNotifications"
                checked={settings.gamificationNotifications}
                onChange={handleChange}
              />
            }
            label="Gamification Notifications"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Get updates related to Gamification such as new badges,
            leaderboards, or games.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="lectureNotifications"
                checked={settings.lectureNotifications}
                onChange={handleChange}
              />
            }
            label="Lecture Notifications"
          />
          <Typography variant="caption" sx={{ ml: 4, color: "text.secondary" }}>
            Get updates related to lecture changes, such as new lectures or
            changes to lecture content.
          </Typography>
        </Box>
      </FormGroup>
    </Box>
  );
}
